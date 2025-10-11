import crypto from "crypto";

/*
  Payments, through Razorpay.

  This was written for Stripe first. Stripe turned out to be invite-only in
  India, so it moved - and the move was small, because the shape of the thing
  never changed:

    A payment is not confirmed because the browser said so. It is confirmed
    because the payment provider told this server directly, in a message
    signed with a secret only the two of us know.

  Everything else is which URL to POST to and what the fields are called.

      browser         this API              Razorpay
        |  place order   |                     |
        |--------------->| create an order     |
        |                |-------------------->|
        |  order id      |<--------------------|
        |<---------------|                     |
        |  card details ---------------------->|
        |                                      |
        |                |  webhook: captured  |
        |                |<--------------------|  <- the only thing believed
        |                | mark paid, email    |

  No SDK. Creating an order is one POST with basic auth, and verifying a
  webhook is an HMAC - about six lines between them, against a dependency
  that would have to be kept up to date forever.
*/

const API = "https://api.razorpay.com/v1";

const isConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/*
  The catalogue is priced in dollars and Razorpay accounts in India settle in
  rupees, so the charge is converted at a rate from the environment.

  A real shop would price in one currency and hold rates properly. This is a
  portfolio shop: one number, in one place, that is obviously a simplification
  rather than a hidden assumption buried in a controller.
*/
const inrPerUsd = () => Number(process.env.INR_PER_USD || 83);

// Razorpay counts in paise, the way Stripe counts in cents and every other
// payment API counts in the smallest unit there is. Floating point and money
// are a bad pair.
const toPaise = (usd) => Math.round(usd * inrPerUsd() * 100);

const authHeader = () =>
  "Basic " +
  Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

const createPaymentOrder = async ({ amountUsd, reference }) => {
  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: toPaise(amountUsd),
      currency: "INR",
      // Comes back on the webhook, and ties the payment to our order without
      // trusting anything the browser passes along.
      receipt: reference,
      notes: { reference },
    }),
    signal: AbortSignal.timeout(15000),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.description || `Razorpay refused the order (${response.status})`);
  }

  return data;
};

/*
  Is this webhook really from Razorpay?

  An HMAC of the exact bytes they sent, keyed with the webhook secret. The
  raw body matters: parse and re-encode it and a byte moves somewhere, the
  hash changes, and every payment silently stops being confirmed.

  timingSafeEqual rather than === because a plain comparison returns faster
  the earlier it finds a difference, and that timing is enough to guess a
  signature one character at a time.
*/
const verifyWebhookSignature = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");

  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const describeMode = () => {
  const key = process.env.RAZORPAY_KEY_ID || "";
  if (!key) return "not configured";
  // Test keys are rzp_test_..., live ones rzp_live_. Worth saying out loud:
  // the two behave identically, and finding out which is loaded by taking a
  // real payment is not the way to find out.
  return key.startsWith("rzp_live_") ? "LIVE - real money" : "test mode";
};

const verifyRazorpay = () => {
  if (!isConfigured()) {
    console.log("Razorpay: no keys - card payments are off, cash on delivery still works");
    return;
  }

  console.log(`Razorpay: ready (${describeMode()}), charging at ${inrPerUsd()} INR per USD`);

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.warn("Razorpay: RAZORPAY_WEBHOOK_SECRET is missing - payments will never be confirmed");
  }
};

export { isConfigured, createPaymentOrder, verifyWebhookSignature, verifyRazorpay, inrPerUsd, toPaise };
