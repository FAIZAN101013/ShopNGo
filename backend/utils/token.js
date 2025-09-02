import jwt from "jsonwebtoken";

/*
  A JWT is not encryption. Anyone holding the token can read what is inside
  it - paste one into jwt.io and it shows you the payload. What the signature
  guarantees is that nobody edited it, because they do not have JWT_SECRET.

  So: put an id in it, never a password, never anything private.
*/
const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// The shape of a user that is safe to send to the browser. Built by hand so
// adding a field to the model never quietly starts leaking it.
const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  verified: user.verified,
  createdAt: user.createdAt,
});

export { createToken, publicUser };
