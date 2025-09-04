import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

/*
  The bouncer.

  Middleware is just a function that runs before the controller and decides
  whether to call next() or answer the request itself. Put this in front of a
  route and that route can assume req.user exists; leave it off and the route
  is public.

  The point is that no controller has to remember to check. Forgetting a
  check inside a controller is invisible - forgetting the middleware on a
  route is one line you can see.
*/
const requireAuth = async (req, res, next) => {
  // "Authorization: Bearer <token>" is the convention. The token goes in a
  // header rather than the URL because URLs end up in logs and history.
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Please sign in to continue" });
  }

  try {
    // Throws if the signature is wrong or the token has expired. That is the
    // whole security check - no database call needed to know it is genuine.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // We still load the user, because a token can be perfectly valid and
    // describe an account that has since been deleted.
    const user = await userModel.findById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "That account no longer exists" });
    }

    // Resetting a password bumps tokenVersion, which retires every token
    // handed out before it. Otherwise a stolen token would outlive the
    // password change that was meant to shut it out.
    if ((payload.tokenVersion || 0) !== user.tokenVersion) {
      return res.status(401).json({ success: false, message: "Your session has expired. Please sign in again." });
    }

    if (!user.verified) {
      return res.status(403).json({ success: false, message: "Please verify your email address first" });
    }

    req.user = user;
    next();
  } catch (error) {
    // Expired and tampered-with both land here; the browser does the same
    // thing either way, which is send you back to the sign in page.
    const expired = error.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      message: expired ? "Your session has expired. Please sign in again." : "Invalid session. Please sign in again.",
    });
  }
};

export default requireAuth;
