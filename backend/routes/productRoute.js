import express from "express";

import {
  listProducts,
  addProduct,
  updateProduct,
  removeProduct,
} from "../controllers/productController.js";
import requireAuth from "../middleware/auth.js";
import requireAdmin from "../middleware/admin.js";

const productRouter = express.Router();

// The catalogue is the shop window - anyone can look.
productRouter.get("/", listProducts);

/*
  Changing it is another matter. POST used to be open, which meant anyone who
  found the URL could add products to the shop. Reading is public; writing is
  admins only.
*/
productRouter.post("/", requireAuth, requireAdmin, addProduct);
productRouter.put("/:id", requireAuth, requireAdmin, updateProduct);
productRouter.delete("/:id", requireAuth, requireAdmin, removeProduct);

export default productRouter;
