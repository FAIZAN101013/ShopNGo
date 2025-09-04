import express from "express";

import {
  registerUser,
  verifyEmail,
  resendCode,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";
import requireAuth from "../middleware/auth.js";

const userRouter = express.Router();

/*
  Public: you cannot already be signed in when you are trying to sign in.
*/
userRouter.post("/register", registerUser);
userRouter.post("/verify", verifyEmail);
userRouter.post("/resend-code", resendCode);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

/*
  Protected: requireAuth runs first and either fills in req.user or answers
  401 by itself, so these two never see a request without a valid token.
*/
userRouter.get("/profile", requireAuth, getProfile);
userRouter.put("/profile", requireAuth, updateProfile);

export default userRouter;
