import {
    validateConfirmPassword,
    validateOtpEmail,
    validatePassword,
    validateRegisterEmail,
    validateOtpValue,
    validateLoginEmail,
    validateLoginPassword,
    validateName,
} from "./requests";
import { validate } from "./validate";

export const registrationSchema = [
    validateName,
    validateRegisterEmail,
    validatePassword,
    validateConfirmPassword,
    validate,
];

export const sendOtpSchema = [validateOtpEmail, validate];

export const verifyOtpSchema = [validateOtpEmail, validateOtpValue, validate];

export const loginSchema = [validateLoginEmail, validateLoginPassword, validate];
