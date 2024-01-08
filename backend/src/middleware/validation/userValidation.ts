import { ValidationChain, body } from "express-validator";
import User from "../../models/User";
import { ClientError } from "../../config/errors/clientError";
import { validate } from "./validate";

// Change password

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

const oldPassword: ValidationChain = body("oldPassword", "Old password required").exists({ checkFalsy: true });

// Change email
const password = body("password", "Password cannot be empty").exists({ checkFalsy: true });

const emailTaken: ValidationChain = body("email", "Email is not valid")
    .isEmail()
    .custom(async (value) => {
        const existingEmail = await User.findOne({ email: value });
        if (existingEmail) {
            throw new ClientError("Email already taken");
        }
        return true;
    });

//
// Validate result
const changePassword = [oldPassword, strongPassword, confPassword, validate];
const changeEmail = [emailTaken, password, validate];

const userValidation = { changePassword, changeEmail };

export default userValidation;
