import express from "express";
import { listProducts, addProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", listProducts);
productRouter.post("/", addProduct);

export default productRouter;