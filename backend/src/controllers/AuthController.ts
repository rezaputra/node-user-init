import { Request, Response, NextFunction } from "express";
import Otp, { IOtp } from "../models/Otp";
import GenerateEmail from "../config/email/emailBody";
import emailSender from "../config/email/emailSender";
import User, { UserDocument } from "../models/User";
import { ClientError } from "../config/errors/clientError";
import { CustomRequest } from "../middleware/auth/checkJwt";
import Token, { TokenDocument, TokenType } from "../models/Token";
import { UnauthorizedError } from "../config/errors/unauthorizedError";
import { CustomError } from "../config/errors/customError";
import bcrypt from "bcrypt";
import { NotFoundError } from "../config/errors/notFoundError";

class AuthController {
    static async sendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { email }: { email: string } = req.body;

            const newOtp: IOtp = new Otp({ email });
            const generatedOtp: string = await newOtp.generateAndSaveOtp();

            const emailBody: string = GenerateEmail.verificationEmail(generatedOtp);
            emailSender(email, "Verification email", emailBody);

            const response = {
                success: true,
                status: 200,
                message: `OTP Sent Successfully, Please check your email`,
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp }: { email: string; otp: string } = req.body;

            const getOtp = await Otp.findOneAndDelete({ email, otp });
            if (!getOtp) {
                throw new ClientError("OTP is not valid");
            }

            await User.updateOne({ email: email }, { verified: true });

            const response = {
                success: true,
                status: 200,
                message: "Email verified successfully",
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password }: { email: string; password: string } = req.body;

            const user = await User.findByCredential(email, password);
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();

            if (!accessToken || !refreshToken) {
                throw new CustomError("Error generate token");
            }

            user.active = true;
            user.lastLogin = new Date();
            await user.save();

            res.cookie("refreshToken", refreshToken?.value, {
                httpOnly: true,
                expires: refreshToken?.expiresAt,
            });

            const response = {
                success: true,
                status: 200,
                message: "Login success",
                data: [user],
                token: accessToken,
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie("refreshToken");
            const userPayload = (req as CustomRequest).token.payload;

            await User.updateOne({ _id: userPayload._id }, { active: false, lastLogin: new Date() });

            const response = {
                success: true,
                status: 200,
                message: "Logout success",
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async logoutAllDevices(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie("refreshToken");
            const userPayload = (req as CustomRequest).token.payload;

            await Token.deleteMany({ userId: userPayload._id });
            await User.updateOne({ _id: userPayload._id }, { active: false, lastLogin: new Date() });

            const response = {
                success: true,
                status: 200,
                message: "Logout all devices success",
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshCookie = req.cookies.refreshToken;
            const userPayload = (req as CustomRequest).token.payload;

            const token = await Token.findOne({ userId: userPayload._id, type: TokenType.REFRESH });

            if (!token || token.value !== refreshCookie) {
                throw new UnauthorizedError("Please login");
            }

            const user = await User.findById(userPayload._id);
            const accessToken = user?.generateAccessToken();

            const response = {
                success: true,
                status: 200,
                message: "Success generate refresh access token",
                toke: accessToken,
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const email: string = req.body.email;
            const user = await User.findOne({ email });
            const resetToken = await user?.generateResetToken();

            if (!resetToken) {
                throw new CustomError("Error generate reset token");
            }

            const emailBody: string = GenerateEmail.forgotPasswordEmail(resetToken.value);
            emailSender(email, "Reset password", emailBody);

            const response = {
                success: true,
                status: 200,
                message: "Email send successfully, Please check your email",
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async verifyForgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const resetToken = req.params.token;

            const response = {
                success: true,
                status: 200,
                message: "Success validate reset token, Please sent new password",
                token: resetToken,
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { password, confirmPassword } = req.body;
            const resetTokenParam = req.params.token;
            const userPayload = (req as CustomRequest).token.payload;

            const token = await Token.findOne({ userId: userPayload._id, type: TokenType.RESET });

            if (!token || token.value !== resetTokenParam) {
                throw new UnauthorizedError("Token is invalid");
            }

            const user = await User.findById({ _id: userPayload._id });

            if (!user) {
                throw new NotFoundError("User not found");
            }

            user.password = password;
            user.active = true;
            user.lastLogin = new Date();
            await user.save();

            await Token.deleteMany({ userId: user._id });

            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();

            res.cookie("refreshToken", refreshToken?.value, {
                httpOnly: true,
                expires: refreshToken?.expiresAt,
            });

            const response = {
                success: true,
                status: 200,
                message: "Success for reset the password",
                data: [user],
                token: accessToken,
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;
