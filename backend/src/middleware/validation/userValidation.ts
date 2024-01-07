import { ValidationChain, body } from "express-validator";
import User from "../../models/User";
import { ClientError } from "../../config/errors/clientError";
import { validate } from "./validate";
import { NextFunction } from "express";
import multer, { Multer } from "multer";

// User signup
const name = body("fullName").exists({ checkFalsy: true });

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

// Change password
const oldPassword: ValidationChain = body("oldPassword", "Old password required").exists({ checkFalsy: true });

// Change email
const password = body("password", "Password cannot be empty").exists({ checkFalsy: true });

//
// Validate result
const signup = [name, emailTaken, strongPassword, confPassword, validate];
const changePassword = [oldPassword, strongPassword, confPassword, validate];
const changeEmail = [emailTaken, password, validate];

const userValidation = { signup, changePassword, changeEmail };

export default userValidation;
