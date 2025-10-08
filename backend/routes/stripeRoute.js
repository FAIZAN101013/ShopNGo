import express from "express";

import { stripeWebhook } from "../controllers/orderController.js";

const stripeRouter = express.Router();

/*
  Not part of orderRouter, and deliberately so.

  Every order route requires a signed-in user. Stripe is not a user and has
  no token; it authenticates by signing the request body with a shared
  secret, which the handler checks. Putting this behind requireAuth would
  reject every payment confirmation the shop ever received.

  express.raw, not express.json: the signature is over the exact bytes Stripe
  sent. Parsing and re-encoding them changes a byte somewhere and the
  signature stops matching.
*/
stripeRouter.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default stripeRouter;
