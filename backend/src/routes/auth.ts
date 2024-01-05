import { Router } from "express";
import { loginSchema, sendOtpSchema, verifyOtpSchema } from "../middleware/validation/schema";
import { asyncHandler } from "../middleware/handler/asyncHandler";
import AuthController from "../controllers/AuthController";
import { checkJwt } from "../middleware/auth/checkJwt";

const router = Router();

router.post("/send-otp", sendOtpSchema, asyncHandler(AuthController.sendOTP));

router.patch("/verify-email", verifyOtpSchema, asyncHandler(AuthController.verifyOtp));

router.post("/login", loginSchema, asyncHandler(AuthController.login));

router.post("/logout", [checkJwt], asyncHandler(AuthController.logout));

router.post("/master-logout", [checkJwt], asyncHandler(AuthController.logoutAllDevices));

router.get("refresh-token");

router.post("forgot-password");
router.patch("reset-password");

router.patch("update-password");
export default router;
