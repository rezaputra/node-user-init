import mongoose, { Document, Schema } from "mongoose";
import otpGenerator from "otp-generator";
import { CustomError } from "../utils/errors/customError";

export interface IOtp extends Document {
    email: string;
    value: string;
    createdAt: Date;
    // generateOtp: () => Promise<string>;
}

const OtpSchema: Schema<IOtp> = new mongoose.Schema({
    email: { type: String, required: true },
    value: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 5 },
});

// OtpSchema.methods.generateOtp = async function () {
//     let otp: string = "";
//     let isUnique: boolean = false;
//     let attempts = 0;
//     const maxAttempts = 10;

//     while (!isUnique && attempts < maxAttempts) {
//         otp = otpGenerator.generate(6, {
//             upperCaseAlphabets: false,
//             lowerCaseAlphabets: false,
//             specialChars: false,
//         });
//         const existingOTP = await Otp.findOne({ value: otp });
//         if (!existingOTP) {
//             isUnique = true;
//         }
//         attempts++;
//     }

//     if (!isUnique) {
//         throw new CustomError("Failed to generate a unique OTP");
//     }
//     return otp;
// };

// OtpSchema.pre<IOtp>("save", async function (next) {
//     if (this.isNew) {
//         this.value = await this.generateOtp();
//         next();
//     }
// });

const Otp = mongoose.model<IOtp>("Otp", OtpSchema);

export default Otp;
