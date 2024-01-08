import mongoose, { Document, Schema, Model } from "mongoose";
import otpGenerator from "otp-generator";
import { CustomError } from "../config/errors/customError";

export interface OtpDocument extends Document {
    email: string;
    otp: string;
    createdAt: Date;
    generateAndSaveOtp: () => Promise<string>;
}

const OtpSchema: Schema<OtpDocument> = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 300 },
});

OtpSchema.methods.generateAndSaveOtp = async function (this: OtpDocument): Promise<string> {
    const maxAttempts = 10;
    const existingOtp = await Otp.findOne({ email: this.email });

    if (existingOtp) {
        return existingOtp.otp;
    }

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
        const otp: string = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        const existingOTP = await mongoose.models.Otp.findOne({ otp });
        if (!existingOTP) {
            this.otp = otp;
            await this.save();
            return otp;
        }
    }

    throw new CustomError("Failed to generate a unique OTP");
};

const Otp: Model<OtpDocument> = mongoose.model<OtpDocument>("Otp", OtpSchema);

export default Otp;
