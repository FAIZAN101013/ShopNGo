import crypto from "crypto";
import bcrypt from "bcryptjs";
import otpModel from "../models/otpModel.js";

/*
  Read as a function, not a constant. ES module imports are evaluated before
  the importing file runs a single line, so a top level Number(process.env...)
  here would be read before server.js has loaded the .env file - and quietly
  fall back to the default forever.
*/
const ttlMinutes = () => Number(process.env.OTP_TTL_MINUTES || 10);

const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

/*
  Math.random() is predictable enough that, given a few codes, you can work
  out the next one. crypto.randomInt is the one that is not.
*/
const generateCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

/*
  Issue a code and return the plain text of it exactly once, so it can be
  emailed. It is never returned again and never stored readable.
*/
const issueOtp = async (email, purpose) => {
  const TTL_MINUTES = ttlMinutes();

  const existing = await otpModel.findOne({ email, purpose });

  // Stops someone hammering "resend" to spam an inbox that is not theirs.
  if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.createdAt.getTime())) / 1000);
    const error = new Error(`Please wait ${wait} seconds before asking for another code`);
    error.status = 429;
    throw error;
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  // Replace rather than add: asking for a new code retires the old one, so
  // there is never more than one working code at a time. Delete-then-create
  // rather than an upsert, so createdAt is genuinely the time this code was
  // issued - the cooldown above depends on that being true.
  if (existing) await otpModel.deleteOne({ _id: existing._id });

  await otpModel.create({
    email,
    purpose,
    codeHash,
    expiresAt: new Date(Date.now() + TTL_MINUTES * 60 * 1000),
  });

  return { code, expiresInMinutes: TTL_MINUTES };
};

/*
  Check a code. Returns true only once - a used code is deleted immediately,
  so it cannot be replayed.
*/
const verifyOtp = async (email, purpose, code) => {
  const record = await otpModel.findOne({ email, purpose });
  if (!record) return { ok: false, message: "That code has expired. Ask for a new one." };

  if (record.attempts >= MAX_ATTEMPTS) {
    await otpModel.deleteOne({ _id: record._id });
    return { ok: false, message: "Too many wrong attempts. Ask for a new code." };
  }

  const matches = await bcrypt.compare(String(code || ""), record.codeHash);
  if (!matches) {
    record.attempts += 1;
    await record.save();
    const left = MAX_ATTEMPTS - record.attempts;
    return { ok: false, message: `That code is not right. ${left} ${left === 1 ? "try" : "tries"} left.` };
  }

  await otpModel.deleteOne({ _id: record._id });
  return { ok: true };
};

export { issueOtp, verifyOtp };
