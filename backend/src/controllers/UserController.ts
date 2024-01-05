import { Request, Response, NextFunction } from "express";
import User, { IUser, Roles } from "../models/User";

interface INewUserRequest {
    email: string;
    password: string;
    confPassword: string;
}

class UserController {
    static async listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users: IUser[] = await User.find().select("-password");
            return res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    static async newUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, confPassword }: INewUserRequest = req.body;

            const newUser: IUser = new User({ email, password, role: Roles.USER });
            const savedUser: IUser = await newUser.save();

            const responseData = {
                success: true,
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
}

export default UserController;
