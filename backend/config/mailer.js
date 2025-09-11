import nodemailer from "nodemailer";

/*
  One place that knows how to send an email.

  There are two ways out, and this file picks between them:

  - BREVO_API_KEY set  -> send over HTTPS to Brevo's API
  - SMTP details only  -> talk SMTP directly, as before
  - neither            -> print to the terminal

  The second one is what works on a laptop and what does not work on a free
  Render instance, which blocks outbound SMTP entirely: port 465 does not
  refuse the connection, it just never answers. Nothing in the code can open
  a port somebody else has shut, so on a host like that the message has to
  leave over 443 like any other web request.

  This is the file that was always going to absorb that. Nothing else in the
  app knows how an email gets sent.
*/

let transporter = null;

const brevoKey = () => process.env.BREVO_API_KEY;

// Gmail refuses your normal password. SMTP_PASS has to be an App Password
// from a Google account with 2-Step Verification turned on.
const hasSmtp = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const isConfigured = () => Boolean(brevoKey()) || hasSmtp();

// Dry run prints the email to the terminal instead of sending it. It turns
// on deliberately with MAIL_DRY_RUN=1, and also by itself when there are no
// credentials at all - so a fresh clone still runs end to end instead of
// failing at the first signup.
const isDryRun = () => process.env.MAIL_DRY_RUN === "1" || !isConfigured();

/*
  MAIL_FROM is written the way an email header is - "ShopNGo <me@gmail.com>".
  SMTP takes that string as it stands; Brevo wants the two halves separately.
*/
const parseFrom = () => {
  const raw = (process.env.MAIL_FROM || process.env.SMTP_USER || "").trim();
  const match = /^(.*?)\s*<([^>]+)>$/.exec(raw);

  if (match) return { name: match[1].replace(/^"|"$/g, "") || "ShopNGo", email: match[2].trim() };
  return { name: "ShopNGo", email: raw };
};

/* ---------- over HTTPS ---------- */

const sendViaBrevo = async ({ to, subject, html, text }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoKey(),
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: parseFrom(),
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
    // Without this a hung API call would hold the signup request open the
    // same way the blocked SMTP port did.
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    // Brevo explains refusals properly - an unverified sender address, a
    // daily limit - so the reason is worth passing on rather than replacing
    // with "email failed".
    const detail = await response.text();
    throw new Error(`Brevo refused the message (${response.status}): ${detail.slice(0, 300)}`);
  }

  return response.json();
};

/* ---------- over SMTP ---------- */

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

    // Force IPv4. smtp.gmail.com resolves to both an A and an AAAA record,
    // and Node will happily pick the IPv6 one - which fails with ENETUNREACH
    // on a host that has no IPv6 route out.
    family: 4,

    // Fail in seconds rather than the default two minutes. If the port is
    // blocked, the person waiting on the signup form should be told so
    // quickly instead of watching a spinner for a minute and a half.
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  return transporter;
};

/* ---------- what the rest of the app calls ---------- */

const sendMail = async ({ to, subject, html, text }) => {
  if (isDryRun()) {
    console.log("\n--- EMAIL (dry run, not actually sent) ---");
    console.log(`to:      ${to}`);
    console.log(`subject: ${subject}`);
    console.log(text || "(html only)");
    console.log("--- end email ---\n");
    return { dryRun: true };
  }

  if (brevoKey()) {
    const info = await sendViaBrevo({ to, subject, html, text });
    console.log(`email sent to ${to} via Brevo: ${subject}`);
    return info;
  }

  const info = await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
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

// Called once at startup so a bad key or a blocked port is reported when the
// server boots, not an hour later when the first person tries to sign up.
const verifyMailer = async () => {
  if (isDryRun()) {
    console.log(
      isConfigured()
        ? "Mail: dry run (MAIL_DRY_RUN=1) - emails print to this terminal"
        : "Mail: no credentials - emails print to this terminal"
    );
    return;
  }

  if (brevoKey()) {
    try {
      // Cheapest authenticated call Brevo has: it proves the key works
      // without sending anything.
      const response = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": brevoKey(), accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      console.log(`Mail: Brevo API ready, sending as ${parseFrom().email}`);
    } catch (error) {
      console.error("Mail: Brevo key rejected -", error.message);
    }
    return;
  }

  try {
    await getTransporter().verify();
    console.log(`Mail: connected to ${process.env.SMTP_HOST} as ${process.env.SMTP_USER}`);
  } catch (error) {
    console.error("Mail: SMTP login failed -", error.message);
    console.error("Mail: many hosts block outbound SMTP. Set BREVO_API_KEY to send over HTTPS instead.");
  }
};

export { sendMail, sendMailQuietly, verifyMailer, isDryRun };
