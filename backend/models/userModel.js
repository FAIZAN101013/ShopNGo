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

    /*
      Who is allowed to run the shop rather than just buy from it.

        user   shops here
        admin  runs the shop: products and orders
        owner  all of that, plus deciding who the admins are

      Only the owner can hand out or take back admin, and there is no route
      at all that creates an owner - that takes the make-admin script, run by
      somebody who already has the database password.
    */
    role: { type: String, enum: ["user", "admin", "owner"], default: "user" },

    /*
      The cart, shaped exactly as the browser holds it:
        { "<productId>": { "M": 2, "L": 1 } }

      Kept on the user rather than in its own collection because it is only
      ever read and written whole, for one person. A separate collection
      would buy nothing and cost a join.

      Mixed means Mongoose does not watch it for changes, so it is always
      written with an explicit $set rather than by mutating and saving.
    */
    cart: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Bumped whenever the password changes, so tokens handed out before the
    // reset stop working. Without this, stealing a token beats changing the
    // password.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
