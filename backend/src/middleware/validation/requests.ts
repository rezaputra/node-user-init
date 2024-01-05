import { ValidationChain, body, param, query } from "express-validator";
import { ClientError } from "../../utils/errors/clientError";
import User from "../../models/User";
import { NotFoundError } from "../../utils/errors/notFoundError";

function validateField(
    type: string,
    field: string,
    message: string,
    min: number = 4,
    max: number = 128
): ValidationChain {
    switch (type) {
        case "body":
            return body(field, message).isLength({ max, min });
        case "param":
            return param(field, message).isLength({ max, min });
        default:
            return query(field, message).isLength({ max, min });
    }
}

export const validateName = validateField("body", "fullName", "Name field cannot be empty");

export const validateRegisterEmail: ValidationChain = body("email", "Invalid email address update")
    .isEmail()
    .custom(async (value) => {
        const existingEmail = await User.findOne({ email: value });
        if (existingEmail) {
            throw new ClientError("Email already taken");
        }
        return true;
    });

export const validatePassword: ValidationChain = body("password", "Not is too weak").isStrongPassword({
    minLength: 6,
    minSymbols: 0,
});

export const validateConfirmPassword: ValidationChain = body("confPassword", "Confirm password cannot be empty")
    .exists({ checkFalsy: true })
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new ClientError("Password and confirm password did not match");
        }
        return true;
    });

export const validateOtpEmail: ValidationChain = body("email", "Invalid email address")
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

export const validateOtpValue: ValidationChain = body("body", "OTP not found").isEmpty();

export const validateLoginEmail: ValidationChain = body("email", "Email field cannot be empty").exists({
    checkFalsy: true,
});
export const validateLoginPassword: ValidationChain = body("password", "Password field cannot be empty").exists({
    checkFalsy: true,
});
