import { Router } from "express";
import { asyncHandler } from "../middleware/handler/asyncHandler";
import AuthController from "../controllers/AuthController";
import { checkAccess, checkRefresh, checkReset } from "../middleware/auth/checkJwt";
import authValidation from "../middleware/validation/authValidation";
import { emailLimiter } from "../config/limiter";

const router = Router();

router.post("/signup", authValidation.signup, asyncHandler(AuthController.signup));

router.post("/send-otp", emailLimiter, authValidation.sendOtp, asyncHandler(AuthController.sendOTP));

router.patch("/verify-email", authValidation.verifyOtp, asyncHandler(AuthController.verifyOtp));

router.post("/login", authValidation.login, asyncHandler(AuthController.login));

router.post("/logout", [checkAccess], asyncHandler(AuthController.logout));

router.post("/master-logout", [checkAccess], asyncHandler(AuthController.logoutAllDevices));

router.get("/refresh-token", [checkRefresh], asyncHandler(AuthController.refreshAccessToken));

router.post(
    "/forgot-password",
    emailLimiter,
    authValidation.forgotPassword,
    asyncHandler(AuthController.forgotPassword)
);

router.post(
    "/verify-reset-token/:token",
    authValidation.verifyForgotPassword,
    [checkReset],
    asyncHandler(AuthController.verifyForgotPassword)
);

router.patch(
    "/reset-password/:token",
    authValidation.resetPassword,
    [checkReset],
    asyncHandler(AuthController.resetPassword)
);

export default router;
