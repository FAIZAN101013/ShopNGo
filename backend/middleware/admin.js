/*
  The second bouncer.

  requireAuth answers "who is this?". This answers "are they allowed to run
  the shop?". They are kept apart because most protected routes need the
  first and not the second - your own order history is private, but it is not
  an admin thing.

  Always used AFTER requireAuth, which is what puts req.user there.
*/
const requireAdmin = (req, res, next) => {
  if (!["admin", "owner"].includes(req.user?.role)) {
    // 403, not 401. 401 means "we do not know who you are, sign in"; signing
    // in again would not help here. This is "we know exactly who you are,
    // and the answer is no".
    return res.status(403).json({ success: false, message: "Admins only" });
  }

  next();
};

/*
  Stricter still: only the owner decides who the admins are.

  Kept separate from requireAdmin so an admin cannot quietly promote a
  friend, or demote the owner and take the shop.
*/
const requireOwner = (req, res, next) => {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ success: false, message: "Only the shop owner can do that" });
  }

  next();
};

export default requireAdmin;
export { requireOwner };
