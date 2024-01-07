import { Router } from "express";
import { asyncHandler } from "../middleware/handler/asyncHandler";
import UserController from "../controllers/UserController";
import userValidation from "../middleware/validation/userValidation";
import { checkAccess } from "../middleware/auth/checkJwt";
import { checkRole } from "../middleware/auth/checkRole";
import { Roles } from "../models/User";
import uploadProfile from "../middleware/upload/profileUpload";

const router = Router();

router.post("/", userValidation.signup, asyncHandler(UserController.signup));

router.get("/", [checkAccess], asyncHandler(UserController.userProfile));

router.patch("/", [checkAccess, checkRole([Roles.USER])], asyncHandler(UserController.updateUser));

router.patch(
    "/upload-profile",
    [checkAccess, checkRole([Roles.USER])],
    uploadProfile.single("profileImage"),
    asyncHandler(UserController.uploadProfile)
);

router.patch("/delete-profile", [checkAccess, checkRole([Roles.USER])], asyncHandler(UserController.deleteProfile));

router.patch(
    "/change-password",
    userValidation.changePassword,
    [checkAccess],
    asyncHandler(UserController.changePassword)
);

router.patch("/change-email", [checkAccess, checkRole([Roles.USER])], asyncHandler(UserController.changeEmail));

export default router;
