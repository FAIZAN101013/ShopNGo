import crypto from "crypto";

import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { sendMailQuietly } from "../config/mailer.js";
import { isConfigured as stripeConfigured, getStripe } from "../config/stripe.js";
import { orderConfirmationEmail } from "../emails/templates.js";

// A function rather than a constant: module level code runs before .env is
// loaded, so reading it up here would freeze in the fallback.
const deliveryFee = () => Number(process.env.DELIVERY_FEE || 10);

const shopUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

const badRequest = (res, message) => res.status(400).json({ success: false, message });

// Short, unambiguous, and readable over the phone: no O/0 or I/1 confusion.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeReference = () => {
  const bytes = crypto.randomBytes(6);
  let out = "";
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return `ORD-${out}`;
};

const round = (n) => Math.round(n * 100) / 100;

/*
  The receipt, to the customer and to whoever is watching the shop inbox.

  Sent quietly: by the time this runs the order exists and, for a card order,
  the money has moved. Telling somebody their order failed because an email
  did not send would be a lie about the important part.
*/
const sendReceipt = ({ order, customerName, customerEmail }) => {
  const receipt = orderConfirmationEmail({ name: customerName, order, shopUrl: shopUrl() });

  sendMailQuietly({ to: order.shipping.email, ...receipt });

  // A shop with nobody watching the inbox does not ship anything.
  if (process.env.ADMIN_EMAIL) {
    sendMailQuietly({
      to: process.env.ADMIN_EMAIL,
      subject: `New order ${order.reference} - ${customerEmail}`,
      html: receipt.html,
      text: receipt.text,
    });
  }
};

/*
  Hand Stripe the same lines the order was built from.

  Amounts are in the smallest unit - cents - because floating point and money
  are a bad pair, and every payment API in the world made the same decision.

  Delivery is its own line rather than folded into the prices, so the page
  Stripe shows reads like the basket the customer just looked at.
*/
const createCheckoutSession = async ({ order, email }) => {
  const stripe = getStripe();

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: `${item.name} (${item.size})` },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  if (order.deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Delivery" },
        unit_amount: Math.round(order.deliveryFee * 100),
      },
      quantity: 1,
    });
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: email,
    // Comes back on the webhook. Matching on this rather than on anything in
    // the URL is what makes the confirmation trustworthy.
    client_reference_id: order.reference,
    metadata: { reference: order.reference },
    success_url: `${shopUrl()}/orders?ref=${order.reference}&paid=1`,
    cancel_url: `${shopUrl()}/placeorder?cancelled=${order.reference}`,
  });
};

/*
  Place an order.

  The important rule here: the browser sends what was bought, never what it
  costs. Prices are read back out of the database and the totals recomputed,
  because a request body is typed by whoever is sending it and a $1200 coat
  can arrive claiming to cost three dollars.
*/
const placeOrder = async (req, res) => {
  try {
    const { items, shipping, notes = "", paymentMethod = "COD" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return badRequest(res, "Your cart is empty");
    }

    const required = ["fullName", "email", "phone", "address", "city", "state", "postalCode", "country"];
    const missing = required.filter((field) => !String(shipping?.[field] || "").trim());
    if (missing.length > 0) {
      return badRequest(res, `Please fill in your ${missing[0].replace(/([A-Z])/g, " $1").toLowerCase()}`);
    }

    // One query for every product in the cart rather than one query per line.
    const ids = [...new Set(items.map((item) => item.productId))];
    const products = await productModel.find({ _id: { $in: ids } });
    const byId = new Map(products.map((product) => [product._id.toString(), product]));

    const lines = [];
    for (const item of items) {
      const product = byId.get(String(item.productId));
      // A cart can name a product that has since been removed from the shop.
      if (!product) return badRequest(res, "One of the items in your cart is no longer available");

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) return badRequest(res, "Invalid quantity in your cart");
      if (!item.size) return badRequest(res, `Please choose a size for ${product.name}`);

      lines.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image?.[0] || "",
        size: String(item.size),
        quantity,
      });
    }

    const DELIVERY_FEE = deliveryFee();
    const subtotal = round(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));

    const byCard = paymentMethod === "STRIPE";

    if (byCard && !stripeConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Card payments are not set up. Please choose cash on delivery.",
      });
    }

    const order = await orderModel.create({
      user: req.user._id,
      reference: makeReference(),
      items: lines,
      shipping,
      notes: String(notes).slice(0, 500),
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total: round(subtotal + DELIVERY_FEE),
      paymentMethod: byCard ? "STRIPE" : "COD",
      // A card order is not an order yet - it is an intention. It becomes
      // CONFIRMED when Stripe says the money moved, and not before.
      status: byCard ? "AWAITING_PAYMENT" : "CONFIRMED",
    });

    if (byCard) {
      const session = await createCheckoutSession({ order, email: shipping.email });

      order.stripeSessionId = session.id;
      await order.save();

      // No email yet. Nothing has been bought until the card clears, and a
      // receipt for an abandoned basket is worse than no receipt.
      return res.status(201).json({ success: true, order, checkoutUrl: session.url });
    }

    // Cash on delivery: the order stands on its own, so send the receipt now.
    sendReceipt({ order, customerName: req.user.name, customerEmail: req.user.email });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("place order failed:", error);
    res.status(500).json({ success: false, message: "Could not place the order. Please try again." });
  }
};

/*
  Your orders. Scoped to req.user, so there is no way to ask for someone
  else's by changing a number in the URL.
*/
const listMyOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("list orders failed:", error);
    res.status(500).json({ success: false, message: "Could not load your orders" });
  }
};

const getMyOrder = async (req, res) => {
  try {
    // The user filter is part of the query, not a check afterwards. A wrong
    // id and somebody else's id both come back as "not found", which is the
    // only thing either of them should tell you.
    const order = await orderModel.findOne({ reference: req.params.reference, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    console.error("get order failed:", error);
    res.status(500).json({ success: false, message: "Could not load that order" });
  }
};

/* ---------- admin ---------- */

/*
  Every order in the shop, newest first.

  Capped rather than returning the lot: an admin page that fetches ten
  thousand orders to show the first twenty is a page that stops loading one
  day and nobody knows why.
*/
const listAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, orders });
  } catch (error) {
    console.error("list all orders failed:", error);
    res.status(500).json({ success: false, message: "Could not load the orders" });
  }
};

// AWAITING_PAYMENT is deliberately not here. Stripe decides that one; an
// admin marking an unpaid order as paid by hand is the bug this whole flow
// exists to prevent.
const STATUSES = ["CONFIRMED", "PACKING", "SHIPPED", "DELIVERED", "CANCELLED"];

/*
  Move an order along.

  The status list lives on the model as an enum, and is repeated here so a
  wrong value comes back as a sentence naming the allowed ones rather than a
  Mongoose ValidationError.
*/
const updateOrderStatus = async (req, res) => {
  try {
    const status = String(req.body.status || "").toUpperCase();

    if (!STATUSES.includes(status)) {
      return badRequest(res, `Status must be one of: ${STATUSES.join(", ")}`);
    }

    const order = await orderModel.findOneAndUpdate(
      { reference: req.params.reference },
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (error) {
    console.error("update order status failed:", error);
    res.status(500).json({ success: false, message: "Could not update that order" });
  }
};

/*
  Stripe telling us what happened.

  This is the only thing in the app that may declare an order paid. Not the
  browser arriving at the success page - anyone can type that URL - and not
  the customer saying so. Stripe signs this request with a secret only it and
  this server hold, and an unsigned one is thrown away.

  The raw body matters: the signature is over the exact bytes Stripe sent, so
  this route is mounted with express.raw() before the JSON parser can reshape
  it. Parsing then re-encoding changes a byte somewhere and the signature
  stops matching, which is a genuinely miserable afternoon to debug.
*/
const stripeWebhook = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeConfigured() || !secret) {
    return res.status(503).send("Stripe is not configured");
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, req.headers["stripe-signature"], secret);
  } catch (error) {
    // Anything that fails here was not sent by Stripe, or was tampered with.
    console.error("stripe webhook rejected:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const reference = session.client_reference_id || session.metadata?.reference;

      const order = await orderModel.findOne({ reference }).populate("user", "name email");

      if (!order) {
        console.warn(`stripe webhook: no order for reference ${reference}`);
      } else if (order.paid) {
        // Stripe retries until it gets a 2xx, so the same event can arrive
        // more than once. Doing nothing the second time is what makes that
        // safe - otherwise every retry sends another receipt.
        console.log(`stripe webhook: ${reference} was already paid`);
      } else {
        order.paid = true;
        order.paidAt = new Date();
        order.status = "CONFIRMED";
        await order.save();

        sendReceipt({
          order,
          customerName: order.user?.name || order.shipping.fullName,
          customerEmail: order.user?.email || order.shipping.email,
        });

        console.log(`stripe webhook: ${reference} paid`);
      }
    }
  } catch (error) {
    // A 500 makes Stripe retry, which is what we want if the database was
    // briefly unavailable.
    console.error("stripe webhook handling failed:", error);
    return res.status(500).send("Handler failed");
  }

  // Answer quickly. Stripe treats a slow reply as a failure and retries.
  res.json({ received: true });
};

export { placeOrder, listMyOrders, getMyOrder, listAllOrders, updateOrderStatus, stripeWebhook };
