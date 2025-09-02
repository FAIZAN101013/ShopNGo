import mongoose from "mongoose";

/*
  An account.

  The password field holds a bcrypt hash, never the password itself. If this
  collection ever leaks, the hashes are useless without months of brute force.
  That is the whole reason bcrypt is slow on purpose.

  `verified` starts false. The account exists but cannot sign in until the
  emailed code proves the address is real.
*/
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Stored lowercase so "Faizan@x.com" and "faizan@x.com" are one account
    // and the unique index actually means what it looks like it means.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Never selected by default: a stray res.json(user) cannot leak the hash
    // unless a query explicitly asks for it with .select("+password").
    password: { type: String, required: true, select: false },

    verified: { type: Boolean, default: false },

    // Bumped whenever the password changes, so tokens handed out before the
    // reset stop working. Without this, stealing a token beats changing the
    // password.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
