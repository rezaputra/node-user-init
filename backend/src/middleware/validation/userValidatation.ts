import { ValidationChain, body } from "express-validator";
import User from "../../models/User";
import { ClientError } from "../../utils/errors/clientError";
import { validate } from "./validate";

const validateFullName = body("fullName", "Name field cannot be empty").exists({ checkFalsy: true });

const validateSignupEmail: ValidationChain = body("email", "Invalid email address update")
    .isEmail()
    .custom(async (value) => {
        const existingEmail = await User.findOne({ email: value });
        if (existingEmail) {
            throw new ClientError("Email already taken");
        }
        return true;
    });

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

const signup = [validateFullName, validateSignupEmail, validatePassword, validateConfirmPassword, validate];

const userValidation = { signup };

export default userValidation;
