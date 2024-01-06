import { Router } from "express";
import { asyncHandler } from "../middleware/handler/asyncHandler";
import UserController from "../controllers/UserController";
import userValidation from "../middleware/validation/userValidatation";

const router = Router();

router.post("/", userValidation.signup, asyncHandler(UserController.signup));

router.patch("update-password");

export default router;
