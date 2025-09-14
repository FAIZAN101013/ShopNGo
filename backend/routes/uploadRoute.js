import express from "express";

import { getUploadSignature } from "../controllers/uploadController.js";
import requireAuth from "../middleware/auth.js";
import requireAdmin from "../middleware/admin.js";

const uploadRouter = express.Router();

// Admins only. Without this, anyone could ask for a signature and fill the
// shop's Cloudinary account with whatever they liked.
uploadRouter.get("/signature", requireAuth, requireAdmin, getUploadSignature);

export default uploadRouter;
