import express from "express";

import { getCart, saveCart } from "../controllers/cartController.js";
import requireAuth from "../middleware/auth.js";

const cartRouter = express.Router();

// A cart belongs to an account, so both routes need one. Guests keep theirs
// in the browser and never reach here.
cartRouter.use(requireAuth);

cartRouter.get("/", getCart);
cartRouter.put("/", saveCart);

export default cartRouter;
