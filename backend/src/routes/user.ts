import { Router } from "express";
import { registrationSchema } from "../middleware/validation/schema";
import { asyncHandler } from "../middleware/handler/asyncHandler";
import UserController from "../controllers/UserController";
import { validate } from "../middleware/validation/validate";

const router = Router();

router.post("/", registrationSchema, asyncHandler(UserController.newUser));

export default router;
