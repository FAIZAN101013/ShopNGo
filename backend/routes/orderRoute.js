import express from "express";

import {
  placeOrder,
  confirmDemoPayment,
  listMyOrders,
  getMyOrder,
  listAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import requireAuth from "../middleware/auth.js";
import { requireStaff } from "../middleware/admin.js";

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

// Only answers while there is no real payment provider. See the controller.
orderRouter.post("/:reference/confirm-demo", confirmDemoPayment);

/*
  These two come BEFORE "/:reference". Express takes the first route that
  matches, and "/:reference" would happily match the word "all" and go
  looking for an order with that reference.
*/
orderRouter.get("/all", requireStaff, listAllOrders);
orderRouter.patch("/:reference/status", requireStaff, updateOrderStatus);

orderRouter.get("/:reference", getMyOrder);

export default orderRouter;
