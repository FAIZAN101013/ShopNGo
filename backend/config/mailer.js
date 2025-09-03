import nodemailer from "nodemailer";

/*
  One place that knows how to send an email.

  Nothing else in the app creates a transport or touches SMTP settings, so
  swapping Gmail for a real sending service later is a change to this file
  and nowhere else.
*/

let transporter = null;

// Gmail refuses your normal password. SMTP_PASS has to be an App Password
// from a Google account with 2-Step Verification turned on.
const isConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

// Dry run prints the email to the terminal instead of sending it. It turns
// on deliberately with MAIL_DRY_RUN=1, and also by itself when there are no
// SMTP details - so a fresh clone with no credentials still runs end to end
// instead of failing at the first signup.
const isDryRun = () => process.env.MAIL_DRY_RUN === "1" || !isConfigured();

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    // 465 is TLS from the first byte. 587 starts in the clear and upgrades,
    // which is why `secure` is only true for 465.
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (isDryRun()) {
    console.log("\n--- EMAIL (dry run, not actually sent) ---");
    console.log(`to:      ${to}`);
    console.log(`subject: ${subject}`);
    console.log(text || "(html only)");
    console.log("--- end email ---\n");
    return { dryRun: true };
  }

  const info = await getTransporter().sendMail({ from, to, subject, html, text });
  console.log(`email sent to ${to}: ${subject}`);
  return info;
};

/*
  Some emails matter enough to fail the request when they do not send (a
  verification code - the account is useless without it). Others do not: an
  order is already paid for and stored, so a failed receipt is a problem to
  log, not a reason to tell someone their order did not go through.
*/
const sendMailQuietly = async (options) => {
  try {
    await sendMail(options);
    return true;
  } catch (error) {
    console.error(`Could not send "${options.subject}" to ${options.to}:`, error.message);
    return false;
  }
};

// Called once at startup so a wrong password is reported when the server
// boots, not an hour later when the first person tries to sign up.
const verifyMailer = async () => {
  if (isDryRun()) {
    console.log(
      isConfigured()
        ? "Mail: dry run (MAIL_DRY_RUN=1) - emails print to this terminal"
        : "Mail: no SMTP credentials - emails print to this terminal"
    );
    return;
  }

  try {
    await getTransporter().verify();
    console.log(`Mail: connected to ${process.env.SMTP_HOST} as ${process.env.SMTP_USER}`);
  } catch (error) {
    console.error("Mail: SMTP login failed -", error.message);
    console.error("Mail: falling back is not automatic; fix .env or set MAIL_DRY_RUN=1");
  }
};

export { sendMail, sendMailQuietly, verifyMailer, isDryRun };
