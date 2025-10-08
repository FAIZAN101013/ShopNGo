import Stripe from "stripe";

/*
  Payments.

  The important idea, and the reason this is not just a link:

    A payment is not confirmed because the browser came back saying so.
    It is confirmed because STRIPE told this server, directly, in a message
    signed with a secret only the two of us know.

  The old "pay with Stripe" button was a payment link that sent the customer
  away and never told the server anything. Anyone could reach the success
  page by typing its URL. This flow closes that.

      browser        this API             Stripe
        |  place order  |                    |
        |-------------->| create a Checkout  |
        |               | Session (prices    |
        |               | from the database) |
        |               |------------------->|
        |  session url  |<-------------------|
        |<--------------|                    |
        |  card details -------------------->|
        |                                    |
        |               |   webhook: paid    |
        |               |<-------------------|   <- the only thing believed
        |               | mark paid, email   |
*/

let client = null;

const isConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

const getStripe = () => {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
};

/*
  Test keys start "sk_test_", live ones "sk_live_". Worth surfacing at boot:
  the two behave identically, and finding out which one is in use by taking a
  real payment is not the way to find out.
*/
const describeMode = () => {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!key) return "not configured";
  return key.startsWith("sk_live_") ? "LIVE - real money" : "test mode";
};

const verifyStripe = () => {
  if (!isConfigured()) {
    console.log("Stripe: no key - card payments are off, cash on delivery still works");
    return;
  }

  console.log(`Stripe: ready (${describeMode()})`);

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    // Without it every webhook is rejected, so orders would be paid for and
    // never marked paid. Worth shouting about at startup.
    console.warn("Stripe: STRIPE_WEBHOOK_SECRET is missing - payments will never be confirmed");
  }
};

export { isConfigured, getStripe, verifyStripe, describeMode };
