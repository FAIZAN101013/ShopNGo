import mongoose from "mongoose";

/*
  A one-time code, for verifying a new email address or for resetting a
  forgotten password.

  The code is hashed exactly like a password. A six digit code is a very
  short secret, so anyone reading the database should not be able to use
  what they find there.

  `expiresAt` carries a TTL index: MongoDB deletes the document by itself
  once that time passes, so expired codes do not pile up forever and there
  is no cleanup job to write.
*/
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },

    codeHash: { type: String, required: true },

    // "verify" for a new account, "reset" for a forgotten password. Kept
    // apart so a code emailed to confirm an address cannot be replayed to
    // change the password on it.
    purpose: { type: String, required: true, enum: ["verify", "reset"] },

    // Guessing 000000 to 999999 is cheap if you are allowed unlimited tries.
    attempts: { type: Number, default: 0 },

    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

// One live code per address per purpose. Requesting a new one replaces the
// old one rather than leaving two valid codes in the wild.
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

const otpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

export default otpModel;
