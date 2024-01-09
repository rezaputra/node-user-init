import { ValidationChain, body, param } from "express-validator";
import User from "../../models/User";
import { NotFoundError } from "../../config/errors/notFoundError";
import { ClientError } from "../../config/errors/clientError";
import { validate } from "./validate";

// User signup
const fullName = body("fullName", "Full name field cannot be empty").exists({ checkFalsy: true });

const emailTaken: ValidationChain = body("email", "Email is not valid")
    .isEmail()
    .custom(async (value) => {
        const existingEmail = await User.findOne({ email: value });
        if (existingEmail) {
            throw new ClientError("Email already taken");
        }
        return true;
    });

const strongPassword: ValidationChain = body("password", "Weak password").isStrongPassword({
    minLength: 6,
    minSymbols: 0,
});

const confPassword: ValidationChain = body("confPassword", "Confirm password cannot be empty")
    .exists({ checkFalsy: true })
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new ClientError("Password and confirm password did not match");
        }
        return true;
    });

// Send OTP and Verify OTP
const isEmailVerified: ValidationChain = body("email", "Invalid email address")
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

const otp: ValidationChain = body("otp", "OTP not found").exists({ checkFalsy: true });

// Login
const email: ValidationChain = body("email", "Email field cannot be empty").exists({ checkFalsy: true });

const password: ValidationChain = body("password", "Password field cannot be empty").exists({ checkFalsy: true });

// Check forgot email
const emailRegistered: ValidationChain = body("email", "Invalid email address")
    .isEmail()
    .custom(async (value) => {
        const existingEmail = await User.findOne({ email: value });
        if (!existingEmail) {
            throw new NotFoundError("Email not registered");
        }
        return true;
    });

// Reset Token
const resetToken: ValidationChain = param("token", "Reset token not found").exists({ checkFalsy: true });

//
// Validate result
const signup = [fullName, emailTaken, strongPassword, confPassword, validate];
const sendOtp = [isEmailVerified, validate];
const verifyOtp = [isEmailVerified, otp, validate];
const login = [email, password, validate];
const forgotPassword = [emailRegistered, validate];
const verifyForgotPassword = [resetToken, validate];
const resetPassword = [strongPassword, confPassword, validate];

const authValidation = {
    signup,
    sendOtp,
    verifyOtp,
    login,
    forgotPassword,
    verifyForgotPassword,
    resetPassword,
};

export default authValidation;
