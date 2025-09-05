import express from "express";

import { placeOrder, listMyOrders, getMyOrder } from "../controllers/orderController.js";
import requireAuth from "../middleware/auth.js";

const orderRouter = express.Router();

/*
  Every order route is private - there is no such thing as an anonymous
  order history. Rather than repeat requireAuth on each line, it is applied
  to the whole router, so a route added later is protected by default
  instead of protected only if somebody remembers.
*/
orderRouter.use(requireAuth);

orderRouter.post("/", placeOrder);
orderRouter.get("/", listMyOrders);
orderRouter.get("/:reference", getMyOrder);

export default orderRouter;
