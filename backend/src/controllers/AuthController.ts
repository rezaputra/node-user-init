import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import Otp from "../models/Otp";
import { generateVerificationEmailBody } from "../utils/email/emailBody";
import emailSender from "../utils/email/emailSender";
import User, { IUser } from "../models/User";
import { ClientError } from "../utils/errors/clientError";
import { NotFoundError } from "../utils/errors/notFoundError";
import { generateOtp } from "./helper/generateOtp";
import { generateAccessToken, generateRefreshToken } from "./helper/generateToken";
import { CustomRequest } from "../middleware/auth/checkJwt";
import Token, { TokenType } from "../models/Token";

class AuthController {
    static async sendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { email }: { email: string } = req.body;

            const otp: string = await generateOtp();
            await Otp.create({ email, otp });

            const emailBody: string = generateVerificationEmailBody(otp);
            emailSender(email, "Verification email", emailBody);

            return res.status(200).json({
                success: true,
                message: "OTP Sent Successfully, Please check your email",
            });
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
            const user = (await User.findOne({ email })) as IUser;

            if (!user) {
                throw new NotFoundError("Account not found");
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                throw new ClientError("Wrong password");
            }

            const accessToken: string = generateAccessToken(user);
            const { refreshToken, expirationDate }: { refreshToken: string; expirationDate: Date } =
                await generateRefreshToken(user);

            user.active = true;
            user.lastLogin = new Date();
            await user.save();

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                expires: expirationDate,
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
            const user = (req as CustomRequest).token.payload;

            await User.updateOne({ _id: user.userId }, { active: false, lastLogin: new Date() });

            return res.status(200).json({
                success: true,
                status: 200,
                message: "Logout success",
            });
        } catch (error) {
            next(error);
        }
    }

    static async logoutAllDevices(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie("refreshToken");
            const user = (req as CustomRequest).token.payload;

            await Token.deleteMany({ userId: user.userId });
            await User.updateOne({ _id: user.userId }, { active: false, lastLogin: new Date() });

            return res.status(200).json({
                success: true,
                status: 200,
                message: "Logout all devices success",
            });
        } catch (error) {
            next(error);
        }
    }

    static async refreshAccessToken(req: Request, res: Response, next: NextFunction) {}
}

export default AuthController;
