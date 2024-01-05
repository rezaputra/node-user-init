import otpGenerator from "otp-generator";
import Otp from "../../models/Otp";
import { CustomError } from "../../utils/errors/customError";

export async function generateOtp(): Promise<string> {
    try {
        let otp: string = "";
        let isUnique: boolean = false;
        let attempts = 0;
        const maxAttempts = 10;
        while (!isUnique && attempts < maxAttempts) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            const existingOTP = await Otp.findOne({ otp });
            if (!existingOTP) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new CustomError("Failed to generate a unique OTP");
        }
        return otp;
    } catch (error) {
        throw new CustomError("Error to generate OTP");
    }
}
