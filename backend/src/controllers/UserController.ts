import { Request, Response, NextFunction } from "express";
import User, { UserDocument, Roles } from "../models/User";

class UserController {
    static async listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users: UserDocument[] = await User.find().select("-password");
            return res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const { fullName, email, password, confPassword } = req.body;

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
}

export default UserController;
