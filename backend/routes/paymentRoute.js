import express from "express";

import { paymentWebhook } from "../controllers/orderController.js";

const paymentRouter = express.Router();

/*
  Not part of orderRouter, and deliberately so.

  Every order route requires a signed-in user. The payment provider is not a
  user and has no token; it authenticates by signing the request body with a
  shared secret, which the handler checks. Behind requireAuth this would
  reject every payment confirmation the shop ever received.

  express.raw, not express.json: the signature is over the exact bytes that
  were sent. Parsing and re-encoding them moves a byte somewhere and the
  signature stops matching.
*/
paymentRouter.post("/webhook", express.raw({ type: "application/json" }), paymentWebhook);

export default paymentRouter;
