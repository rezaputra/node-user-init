import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import Otp, { OtpDocument } from "../models/Otp";
import GenerateEmail from "../config/email/emailBody";
import emailSender from "../config/email/emailSender";
import User, { Roles, UserDocument } from "../models/User";
import { ClientError } from "../config/errors/clientError";
import { CustomRequest } from "../middleware/auth/checkJwt";
import Token, { TokenDocument, TokenType } from "../models/Token";
import { UnauthorizedError } from "../config/errors/unauthorizedError";
import { NotFoundError } from "../config/errors/notFoundError";

class AuthController {
    static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                fullName,
                email,
                password,
                confPassword,
            }: { fullName: string; email: string; password: string; confPassword: string } = req.body;

            const newUser: UserDocument = new User({ fullName, email, password, role: Roles.USER });
            const savedUser: UserDocument = await newUser.save();

            const responseData = {
                success: true,
                status: 201,
                message: "User registered successfully",
                data: [savedUser],
            };

            return res.status(201).json(responseData);
        } catch (error) {
            next(error);
        }
    }

    static async sendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { email }: { email: string } = req.body;

            const newOtp: OtpDocument = new Otp({ email });
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

            const user: UserDocument = await User.findByCredential(email, password);

            const token = new Token();

            const accessToken = await token.generateAccessToken(user);
            const refreshToken = await token.generateRefreshToken(user);

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
            const refreshTokenCookie = req.cookies.refreshToken;
            const userPayload = (req as CustomRequest).token.payload;

            const token = await Token.findOne({ userId: userPayload._id, type: TokenType.REFRESH }).populate("userId");
            const user = token?.userId as any;

            if (!token || token.value !== refreshTokenCookie) {
                throw new UnauthorizedError("Please login");
            }

            const accessToken = token.generateAccessToken(user);

            const response = {
                success: true,
                status: 200,
                message: "Success generate refresh access token",
                token: accessToken,
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

            if (!user) {
                throw new NotFoundError("User not found");
            }
            const token = new Token();
            const resetToken = await token.generateResetToken(user);

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

            const token = await Token.findOne({ userId: userPayload._id, type: TokenType.RESET }).populate("userId");
            const user = token?.userId as any;

            if (!token || token.value !== resetTokenParam) {
                throw new UnauthorizedError("Invalid a token");
            }

            const passwordHash = bcrypt.hashSync(password, 10);

            await User.findByIdAndUpdate(userPayload._id, {
                password: passwordHash,
                active: true,
                lastLogin: new Date(),
            });

            await Token.deleteMany({ userId: token.userId });

            const accessToken = await token.generateAccessToken(user);
            const refreshToken = await token.generateRefreshToken(user);

            res.cookie("refreshToken", refreshToken.value, {
                httpOnly: true,
                expires: refreshToken.expiresAt,
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
