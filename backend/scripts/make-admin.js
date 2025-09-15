import "dotenv/config";
import mongoose from "mongoose";

import userModel from "../models/userModel.js";

/*
  Promote an account to admin.

  Run by hand, from a machine that already has the database password:

    npm run make-admin you@example.com          -> admin
    npm run make-admin you@example.com owner    -> owner

  An owner can appoint admins from the admin pages, so in practice this is
  run once, for the first owner. There is deliberately no route that creates
  an owner - that is the one thing which should always require the database
  password and a moment's thought.
*/

const email = String(process.argv[2] || "").trim().toLowerCase();
const role = String(process.argv[3] || "admin").trim().toLowerCase();

if (!email) {
  console.error("Which account? Usage: npm run make-admin you@example.com [admin|owner]");
  process.exit(1);
}

if (!["admin", "owner"].includes(role)) {
  console.error(`Role must be admin or owner, not "${role}".`);
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const user = await userModel.findOne({ email });

if (!user) {
  console.error(`No account with the email ${email}. Sign up first, then run this.`);
  await mongoose.disconnect();
  process.exit(1);
}

user.role = role;
await user.save();

console.log(`${user.name} <${user.email}> is now ${role === "owner" ? "the owner" : "an admin"}.`);
console.log("They should reload the shop - the browser reads the role when the page loads.");

await mongoose.disconnect();
