import crypto from "crypto";

import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { sendMailQuietly } from "../config/mailer.js";
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

    const order = await orderModel.create({
      user: req.user._id,
      reference: makeReference(),
      items: lines,
      shipping,
      notes: String(notes).slice(0, 500),
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total: round(subtotal + DELIVERY_FEE),
      paymentMethod: paymentMethod === "STRIPE" ? "STRIPE" : "COD",
    });

    // The order is saved. The receipt is a courtesy on top of that, so it is
    // sent quietly and never gets to fail the request.
    const receipt = orderConfirmationEmail({ name: req.user.name, order, shopUrl: shopUrl() });
    sendMailQuietly({ to: shipping.email, ...receipt });

    // A shop with nobody watching the inbox does not ship anything.
    if (process.env.ADMIN_EMAIL) {
      sendMailQuietly({
        to: process.env.ADMIN_EMAIL,
        subject: `New order ${order.reference} - ${req.user.email}`,
        html: receipt.html,
        text: receipt.text,
      });
    }

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

export { placeOrder, listMyOrders, getMyOrder };
