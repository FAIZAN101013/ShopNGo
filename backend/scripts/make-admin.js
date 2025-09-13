import "dotenv/config";
import mongoose from "mongoose";

import userModel from "../models/userModel.js";

/*
  Promote an account to admin.

  Run by hand, from a machine that already has the database password:

    npm run make-admin you@example.com

  There is deliberately no route that does this. An endpoint that grants
  admin is an endpoint somebody will eventually find a way to call, and the
  shop needs this roughly once ever.
*/

const email = String(process.argv[2] || "").trim().toLowerCase();

if (!email) {
  console.error("Which account? Usage: npm run make-admin you@example.com");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const user = await userModel.findOne({ email });

if (!user) {
  console.error(`No account with the email ${email}. Sign up first, then run this.`);
  await mongoose.disconnect();
  process.exit(1);
}

user.role = "admin";
await user.save();

console.log(`${user.name} <${user.email}> is now an admin.`);
console.log("They need to sign out and back in - the role is read when the page loads.");

await mongoose.disconnect();
