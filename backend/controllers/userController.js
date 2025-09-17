import bcrypt from "bcryptjs";
import crypto from "crypto";

import userModel from "../models/userModel.js";
import { issueOtp, verifyOtp } from "../utils/otp.js";
import { createToken, publicUser } from "../utils/token.js";
import { sendMail, sendMailQuietly } from "../config/mailer.js";
import {
  verificationEmail,
  welcomeEmail,
  passwordResetEmail,
  adminInviteEmail,
  adminGrantedEmail,
} from "../emails/templates.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const shopUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

/*
  bcrypt with 10 rounds takes roughly a tenth of a second on purpose. That is
  unnoticeable when one person signs in and ruinous for anyone trying to test
  a million passwords a second against a stolen database.

  It also salts every hash by itself, so two people with the same password
  still get different hashes and cracking one tells you nothing about the
  other.
*/
const hash = (password) => bcrypt.hash(password, 10);

const normaliseEmail = (email) => String(email || "").trim().toLowerCase();

// Turn whatever someone typed into a search box into a literal string, so
// that "a.b+c" matches "a.b+c" instead of being read as a pattern.
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// One code path for "the client sent us something unusable". 400 means the
// request was wrong, which is different from 500 meaning we were wrong.
const badRequest = (res, message) => res.status(400).json({ success: false, message });

// "an admin" but "a manager". A small thing, and the alternative is every
// message reading like a form letter.
const aOrAn = (role) => (/^[aeiou]/i.test(role) ? `an ${role}` : `a ${role}`);

/*
  Create an account.

  It exists straight away but cannot be signed into: `verified` is false
  until the emailed code comes back. That is what stops anyone signing up as
  somebody else's address.
*/
const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normaliseEmail(req.body.email);
    const { password } = req.body;

    if (!name || !email || !password) return badRequest(res, "Name, email and password are all required");
    if (!EMAIL_PATTERN.test(email)) return badRequest(res, "That does not look like a valid email address");
    if (String(password).length < MIN_PASSWORD) {
      return badRequest(res, `Password must be at least ${MIN_PASSWORD} characters`);
    }

    const existing = await userModel.findOne({ email });

    if (existing?.verified) {
      return res.status(409).json({ success: false, message: "An account with that email already exists" });
    }

    // Signing up again with an address that was never verified is not an
    // error - it is somebody who lost the first email. Update the details
    // and send a fresh code rather than telling them the address is taken.
    const user = existing
      ? Object.assign(existing, { name, password: await hash(password) })
      : new userModel({ name, email, password: await hash(password) });

    await user.save();

    const { code, expiresInMinutes } = await issueOtp(email, "verify");
    // Awaited, not fired and forgotten: an account nobody can verify is
    // worse than a signup that visibly failed and can be retried.
    await sendMail({ to: email, ...verificationEmail({ name, code, expiresInMinutes }) });

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email,
      message: `We sent a 6 digit code to ${email}`,
    });
  } catch (error) {
    console.error("register failed:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Could not create the account. Please try again.",
    });
  }
};

/*
  Turn a correct code into a verified account and a signed in session.
*/
const verifyEmail = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const { code } = req.body;

    if (!email || !code) return badRequest(res, "Enter the code we emailed you");

    const user = await userModel.findOne({ email });
    if (!user) return badRequest(res, "No account is waiting to be verified for that address");
    if (user.verified) return badRequest(res, "That email is already verified. Please sign in.");

    const result = await verifyOtp(email, "verify", code);
    if (!result.ok) return badRequest(res, result.message);

    user.verified = true;
    await user.save();

    // Quietly: the account is verified whether or not this arrives, so a
    // mail failure must not turn a successful verification into an error.
    sendMailQuietly({ to: email, ...welcomeEmail({ name: user.name, shopUrl: shopUrl() }) });

    res.json({ success: true, token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("verify failed:", error);
    res.status(500).json({ success: false, message: "Could not verify that code. Please try again." });
  }
};

/*
  Send another code, for either purpose. The cooldown lives in issueOtp, so
  this cannot be used to flood an inbox.
*/
const resendCode = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const purpose = req.body.purpose === "reset" ? "reset" : "verify";

    if (!email) return badRequest(res, "Which email address should we send it to?");

    const user = await userModel.findOne({ email });

    // Same answer whether or not the account exists, so this cannot be used
    // to find out which addresses are registered.
    const answer = { success: true, message: `If that address has an account, a new code is on its way to ${email}` };

    if (!user) return res.json(answer);
    if (purpose === "verify" && user.verified) {
      return badRequest(res, "That email is already verified. Please sign in.");
    }

    const { code, expiresInMinutes } = await issueOtp(email, purpose);
    const template =
      purpose === "reset"
        ? passwordResetEmail({ name: user.name, code, expiresInMinutes })
        : verificationEmail({ name: user.name, code, expiresInMinutes });

    await sendMail({ to: email, ...template });
    res.json(answer);
  } catch (error) {
    console.error("resend failed:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Could not send the code. Please try again.",
    });
  }
};

/*
  Sign in.
*/
const loginUser = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) return badRequest(res, "Enter your email and password");

    // The hash is select:false on the model, so it has to be asked for.
    const user = await userModel.findOne({ email }).select("+password");

    // One message for both a missing account and a wrong password. Two
    // different messages would tell a stranger which addresses are real.
    const invalid = () => res.status(401).json({ success: false, message: "Email or password is incorrect" });

    if (!user) return invalid();

    const matches = await bcrypt.compare(String(password), user.password);
    if (!matches) return invalid();

    // Correct password, unverified address: send a fresh code and tell the
    // browser to show the code screen instead of the error.
    if (!user.verified) {
      try {
        const { code, expiresInMinutes } = await issueOtp(email, "verify");
        await sendMail({ to: email, ...verificationEmail({ name: user.name, code, expiresInMinutes }) });
      } catch (error) {
        // Hitting the resend cooldown here is fine - a code is already in
        // their inbox, which is exactly what the next screen asks for.
        console.warn("could not reissue verification code:", error.message);
      }

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email,
        message: "Please confirm your email address. We sent you a code.",
      });
    }

    res.json({ success: true, token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("login failed:", error);
    res.status(500).json({ success: false, message: "Could not sign you in. Please try again." });
  }
};

/*
  Step one of a password reset: email a code.
*/
const forgotPassword = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    if (!email) return badRequest(res, "Enter the email address on your account");

    const user = await userModel.findOne({ email });

    // Always the same answer. "No account with that email" on this form is
    // a free tool for working out who shops here.
    const answer = {
      success: true,
      message: `If that address has an account, we have sent a reset code to ${email}`,
    };

    if (!user) return res.json(answer);

    const { code, expiresInMinutes } = await issueOtp(email, "reset");
    await sendMail({ to: email, ...passwordResetEmail({ name: user.name, code, expiresInMinutes }) });

    res.json(answer);
  } catch (error) {
    console.error("forgot password failed:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Could not send the reset code. Please try again.",
    });
  }
};

/*
  Step two: the code plus a new password.
*/
const resetPassword = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const { code, password } = req.body;

    if (!email || !code || !password) return badRequest(res, "Enter the code and your new password");
    if (String(password).length < MIN_PASSWORD) {
      return badRequest(res, `Password must be at least ${MIN_PASSWORD} characters`);
    }

    const user = await userModel.findOne({ email });
    if (!user) return badRequest(res, "That code is not valid");

    const result = await verifyOtp(email, "reset", code);
    if (!result.ok) return badRequest(res, result.message);

    user.password = await hash(password);
    // Anyone already signed in as this account is signed out. If the reason
    // for the reset was that somebody else got in, this is what removes them.
    user.tokenVersion += 1;
    // Proving you can read the inbox is proof the address is yours, so a
    // reset also settles verification.
    user.verified = true;
    await user.save();

    res.json({ success: true, message: "Password changed. You can sign in with it now." });
  } catch (error) {
    console.error("reset password failed:", error);
    res.status(500).json({ success: false, message: "Could not change the password. Please try again." });
  }
};

/*
  Who am I? The browser calls this on load with a stored token, which is how
  a refresh keeps you signed in without keeping your details in localStorage.
*/
const getProfile = async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
};

const updateProfile = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return badRequest(res, "Name cannot be empty");

    req.user.name = name;
    await req.user.save();

    res.json({ success: true, user: publicUser(req.user) });
  } catch (error) {
    console.error("update profile failed:", error);
    res.status(500).json({ success: false, message: "Could not save your profile. Please try again." });
  }
};

/* ---------- owner only ---------- */

/*
  Invite someone to help run the shop.

  Two quite different situations wear the same button:

  - They already shop here. There is nothing to set up, so the role changes
    and they get a note telling them so. Their password is untouched - we
    could not read it if we wanted to.

  - They have never been here. An account is created for them, holding a
    random password nobody knows, and a code goes to their inbox. Until they
    enter it there is no way in: not by us, not by them, not by anyone who
    guessed the address was invited.

  Either way the invitation goes to an inbox, which is what makes it an
  invitation rather than an announcement.
*/
// One address. Returns a line describing what happened rather than throwing,
// so inviting six people does not stop at the first one that is already staff.
const inviteOne = async ({ email, name, role, invitedBy }) => {
  if (!EMAIL_PATTERN.test(email)) {
    return { email, ok: false, message: "Not a valid email address" };
  }

  const existing = await userModel.findOne({ email });

  if (existing?.role === "owner") {
    return { email, ok: false, message: "That is the owner's account" };
  }

  if (existing?.role === role && existing.verified) {
    return { email, ok: false, message: `${existing.name} is already ${aOrAn(role)}` };
  }

  // Case one: a real, verified account. Just hand over the keys.
  if (existing?.verified) {
    existing.role = role;
    await existing.save();

    sendMailQuietly({
      to: email,
      ...adminGrantedEmail({ name: existing.name, role, invitedBy, shopUrl: shopUrl() }),
    });

    return {
      email,
      ok: true,
      promoted: true,
      message: `${existing.name} already had an account and is now ${aOrAn(role)}`,
    };
  }

  /*
    Case two: nobody, or somebody who never finished signing up.

    The password is 32 random bytes that are hashed and then forgotten. The
    field cannot be left empty - the model requires it - and a known
    placeholder would be one password every invited account shared.
  */
  const unusablePassword = await hash(crypto.randomBytes(32).toString("hex"));

  const user =
    existing || new userModel({ name: name || email.split("@")[0], email, password: unusablePassword });

  if (name) user.name = name;
  user.role = role;
  user.verified = false;
  if (!existing) user.password = unusablePassword;

  await user.save();

  try {
    const { code, expiresInMinutes } = await issueOtp(email, "invite");

    await sendMail({
      to: email,
      ...adminInviteEmail({ email, code, expiresInMinutes, role, invitedBy, shopUrl: shopUrl() }),
    });
  } catch (error) {
    // The account exists but nobody was told. Say so plainly - "invited"
    // when no email went out is the kind of lie that wastes an afternoon.
    return { email, ok: false, message: `Account made, but the email failed: ${error.message}` };
  }

  return { email, ok: true, invited: true, message: `Invitation sent to ${email}` };
};

const inviteStaff = async (req, res) => {
  try {
    const role = String(req.body.role || "admin").toLowerCase();
    const name = String(req.body.name || "").trim();

    if (!["manager", "admin"].includes(role)) {
      return badRequest(res, "Role must be either manager or admin");
    }

    /*
      Accepts one address or many. People paste a list out of a message or a
      spreadsheet, so commas, semicolons, spaces and newlines all separate.
    */
    const raw = Array.isArray(req.body.emails) ? req.body.emails.join(",") : String(req.body.emails || req.body.email || "");
    const emails = [...new Set(raw.split(/[\s,;]+/).map(normaliseEmail).filter(Boolean))];

    if (emails.length === 0) return badRequest(res, "Enter at least one email address");
    if (emails.length > 20) return badRequest(res, "Twenty invitations at a time is the limit");

    // A name only makes sense for a single invitation.
    const results = [];
    for (const email of emails) {
      results.push(await inviteOne({ email, name: emails.length === 1 ? name : "", role, invitedBy: req.user.name }));
    }

    const sent = results.filter((r) => r.ok).length;

    res.status(sent > 0 ? 201 : 400).json({
      success: sent > 0,
      results,
      message:
        results.length === 1
          ? results[0].message
          : `${sent} of ${results.length} invitations sent`,
    });
  } catch (error) {
    console.error("invite staff failed:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Could not send that invitation. Please try again.",
    });
  }
};

/*
  Claim an invitation: the code from the email, plus a password of your own.

  Public, because the person accepting has no account to authenticate with
  yet. The code is what authorises it, which is why it is hashed, expires,
  and allows five attempts like every other code here.
*/
const acceptInvite = async (req, res) => {
  try {
    const email = normaliseEmail(req.body.email);
    const { code, password } = req.body;
    const name = String(req.body.name || "").trim();

    if (!email || !code || !password) return badRequest(res, "Enter the code and choose a password");
    if (String(password).length < MIN_PASSWORD) {
      return badRequest(res, `Password must be at least ${MIN_PASSWORD} characters`);
    }

    const user = await userModel.findOne({ email });

    // One message for every way this can be wrong, so a stranger poking at
    // it learns nothing about who was invited.
    const invalid = () => badRequest(res, "That invitation is not valid. Ask the owner to send a new one.");

    if (!user || user.verified || !["manager", "admin", "owner"].includes(user.role)) return invalid();

    const result = await verifyOtp(email, "invite", code);
    if (!result.ok) return badRequest(res, result.message);

    if (name) user.name = name;
    user.password = await hash(password);
    // Holding the inbox proved the address, which is the same thing the
    // signup code proves.
    user.verified = true;
    await user.save();

    sendMailQuietly({ to: email, ...welcomeEmail({ name: user.name, shopUrl: shopUrl() }) });

    res.json({ success: true, token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("accept invite failed:", error);
    res.status(500).json({ success: false, message: "Could not accept that invitation. Please try again." });
  }
};

/*
  Everyone who can get into the back office, plus anyone whose name or email
  matches a search - so an owner can find the account they want to promote
  without scrolling past every customer in the shop.
*/
const listStaff = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    // Escaped before it becomes a regular expression. Plenty of real email
    // addresses contain "+", and "a+b" as a pattern means something quite
    // different from "a+b" as a string.
    const safe = escapeRegex(search);

    const filter = search
      ? {
          $or: [
            { email: { $regex: safe, $options: "i" } },
            { name: { $regex: safe, $options: "i" } },
          ],
        }
      : // No search: just the people who already have the keys.
        { role: { $in: ["manager", "admin", "owner"] } };

    const users = await userModel.find(filter).sort({ role: 1, name: 1 }).limit(50);

    res.json({ success: true, users: users.map(publicUser) });
  } catch (error) {
    console.error("list staff failed:", error);
    res.status(500).json({ success: false, message: "Could not load the accounts" });
  }
};

/*
  Grant or take back admin.

  Only "user" and "admin" can be set. There is no way to make another owner
  through the API - a shop has one, and changing that should take somebody
  with the database password and a moment's thought.
*/
const setUserRole = async (req, res) => {
  try {
    const role = String(req.body.role || "").toLowerCase();

    if (!["user", "manager", "admin"].includes(role)) {
      return badRequest(res, "Role must be user, manager or admin");
    }

    const target = await userModel.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "No such account" });

    // The owner cannot demote themselves. Otherwise one wrong click leaves
    // the shop with nobody who can appoint anybody.
    if (target._id.equals(req.user._id)) {
      return badRequest(res, "You cannot change your own role");
    }

    if (target.role === "owner") {
      return badRequest(res, "The owner's role cannot be changed here");
    }

    // An account that has never confirmed its email is not a person we can
    // be sure of, so it does not get the keys.
    if (role !== "user" && !target.verified) {
      return badRequest(res, "That account has not verified its email yet");
    }

    target.role = role;
    await target.save();

    res.json({
      success: true,
      message:
        role === "user"
          ? `${target.name} no longer works here`
          : `${target.name} is now ${aOrAn(role)}`,
      user: publicUser(target),
    });
  } catch (error) {
    console.error("set role failed:", error);
    res.status(500).json({ success: false, message: "Could not change that role" });
  }
};

export {
  listStaff,
  setUserRole,
  inviteStaff,
  acceptInvite,
  registerUser,
  verifyEmail,
  resendCode,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};
