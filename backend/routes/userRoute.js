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
  listStaff,
  setUserRole,
  inviteStaff,
  acceptInvite,
} from "../controllers/userController.js";
import requireAuth from "../middleware/auth.js";
import { requireOwner } from "../middleware/admin.js";

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

// Public because the person accepting has no account to sign in with yet.
// The emailed code is what authorises it.
userRouter.post("/accept-invite", acceptInvite);

/*
  Protected: requireAuth runs first and either fills in req.user or answers
  401 by itself, so these two never see a request without a valid token.
*/
userRouter.get("/profile", requireAuth, getProfile);
userRouter.put("/profile", requireAuth, updateProfile);

/*
  Owner only: seeing who has the keys, and handing them out.
*/
userRouter.get("/staff", requireAuth, requireOwner, listStaff);
userRouter.post("/invite-admin", requireAuth, requireOwner, inviteStaff);
userRouter.patch("/:id/role", requireAuth, requireOwner, setUserRole);

export default userRouter;
