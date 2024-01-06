import { ValidationChain, body, param } from "express-validator";
import User from "../../models/User";
import { NotFoundError } from "../../utils/errors/notFoundError";
import { ClientError } from "../../utils/errors/clientError";
import { validate } from "./validate";

// Send OTP and Verify OTP
const validateOtpEmail: ValidationChain = body("email", "Invalid email address")
    .isEmail()
    .custom(async (value) => {
        const existingEmail = await User.findOne({ email: value });
        if (!existingEmail) {
            throw new NotFoundError("email not registered");
        }
        if (existingEmail.verified === true) {
            throw new ClientError("Account already verified");
        }
        return true;
    });

const validateOtpValue: ValidationChain = body("body", "OTP not found").isEmpty();

// Login
const validateLoginEmail: ValidationChain = body("email", "Email field cannot be empty").exists({
    checkFalsy: true,
});
const validateLoginPassword: ValidationChain = body("password", "Password field cannot be empty").exists({
    checkFalsy: true,
});

// Check forgot email
const validateForgotEmail: ValidationChain = body("email", "Invalid email address")
    .isEmail()
    .custom(async (value) => {
        const existingEmail = await User.findOne({ email: value });
        if (!existingEmail) {
            throw new NotFoundError("Email not registered");
        }
        return true;
    });

// Reset Token
const validateResetToken: ValidationChain = param("token", "Reset token not found").exists({ checkFalsy: true });

// Reset new password
const validatePassword: ValidationChain = body("password", "Password is too weak").isStrongPassword({
    minLength: 6,
    minSymbols: 0,
});

const validateConfirmPassword: ValidationChain = body("confPassword", "Confirm password cannot be empty")
    .exists({ checkFalsy: true })
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new ClientError("Password and confirm password did not match");
        }
        return true;
    });

const sendOtp = [validateOtpEmail, validate];
const verifyOtp = [validateOtpEmail, validateOtpValue, validate];
const login = [validateLoginEmail, validateLoginPassword, validate];
const forgotPassword = [validateForgotEmail, validate];
const verifyForgotPassword = [validateResetToken, validate];
const resetPassword = [validatePassword, validateConfirmPassword, validate];

const authValidation = {
    sendOtp,
    verifyOtp,
    login,
    forgotPassword,
    verifyForgotPassword,
    resetPassword,
};

export default authValidation;
