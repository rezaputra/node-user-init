import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import User, { UserDocument, Roles } from "../models/User";
import { CustomRequest } from "../middleware/auth/checkJwt";
import { NotFoundError } from "../config/errors/notFoundError";
import { ClientError } from "../config/errors/clientError";
import Token from "../models/Token";
import fs from "fs";
import { CustomError } from "../config/errors/customError";
import uploadProfile from "../middleware/upload/profileUpload";
import multer from "multer";

class UserController {
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
                data: [
                    {
                        _id: savedUser._id,
                        email: savedUser.email,
                        role: savedUser.role,
                    },
                ],
            };

            return res.status(201).json(responseData);
        } catch (error) {
            next(error);
        }
    }

    static async userProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userPayload = (req as CustomRequest).token.payload;

            const user = await User.findById(userPayload._id);

            if (!user) {
                throw new NotFoundError("User not found");
            }

            const response = {
                success: true,
                status: 200,
                data: [user],
            };
            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userPayload = (req as CustomRequest).token.payload;
            const updateUserData = req.body;

            if (
                updateUserData.email ||
                updateUserData.profile ||
                updateUserData.role ||
                updateUserData.password ||
                updateUserData.verified ||
                updateUserData.active ||
                updateUserData.lastLogin
            ) {
                throw new ClientError("Sensitive field cannot be update");
            }

            const user = await User.findByIdAndUpdate(userPayload._id, updateUserData, { new: true });

            if (!user) {
                throw new NotFoundError("User not found");
            }

            const response = {
                success: true,
                status: 200,
                message: "Success update user data",
                data: [user],
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async uploadProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userPayload = (req as CustomRequest).token.payload;
            const file = req.file;

            if (!file) {
                throw new ClientError("File cannot be empty");
            }

            const user = await User.findById(userPayload._id);

            if (!user) {
                throw new NotFoundError("User not found");
            }

            const oldProfile: string = `${file?.destination}/${user.profile}`;

            try {
                fs.unlinkSync(oldProfile);
            } catch (unlinkError) {
                console.error("Error deleting old profile");
            }

            user.profile = file.filename;
            await user.save();

            const response = {
                success: true,
                status: 200,
                message: "Profile image updated",
            };

            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    throw new ClientError("File size limit exceeded");
                }
            }
            next(new ClientError('"File size limit exceeded"'));
        }
    }

    static async deleteProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userPayload = (req as CustomRequest).token.payload;

            const user = await User.findById(userPayload._id);
            if (!user) {
                throw new NotFoundError("User not found");
            }

            const filePath = `public/profiles/${user.profile}`;

            try {
                fs.unlinkSync(filePath);
            } catch (unlinkError) {
                console.error("Error deleting old profile");
            }

            user.profile = "null";
            await user.save();

            const updatedUser = await User.findById(userPayload._id);

            const response = {
                success: true,
                status: 200,
                message: "Success delete profile",
                data: [updatedUser],
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                oldPassword,
                password,
                confPassword,
            }: { oldPassword: string; password: string; confPassword: string } = req.body;
            const userPayload = (req as CustomRequest).token.payload;

            const user = await User.findByCredential(userPayload.email, oldPassword);

            user.password = password;
            user.save();

            res.clearCookie("refreshToken");
            await Token.deleteMany({ userId: userPayload._id });

            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();

            res.cookie("refreshToken", refreshToken?.value, {
                httpOnly: true,
                expires: refreshToken?.expiresAt,
            });

            const response = {
                success: true,
                status: 200,
                message: "Success change password",
                token: accessToken,
            };

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async changeEmail(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        const userPayload = (req as CustomRequest).token.payload;

        const user = await User.findByCredential(userPayload._email, password);

        user.email = email;
        user.verified = false;
        user.active = false;
        user.lastLogin = new Date();

        await user.save();

        res.clearCookie("refreshToken");
        await Token.deleteMany({ userId: userPayload._id });

        const response = {
            success: true,
            status: 200,
            message: "Success change email",
        };

        return res.status(200).json(response);
    }
}

export default UserController;
