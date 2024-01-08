import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Document, Schema, Model } from "mongoose";
import { NotFoundError } from "../config/errors/notFoundError";
import { ClientError } from "../config/errors/clientError";
import config from "../config";
import Token, { TokenDocument, TokenType } from "./Token";

export interface UserDocument extends Document {
    fullName: string;
    profile: string;
    dateBirth: Date;
    address: string;
    email: string;
    password: string;
    role: Roles;
    active: boolean;
    lastLogin: Date;
    verified: boolean;
}

export interface UserModel extends Model<UserDocument> {
    findByCredential(email: string, password: string): Promise<UserDocument>;
}

export interface ResponseUser {
    fullName: string;
    profile: string;
    dateBirth: Date;
    address: string;
    email: string;
}

// Enum for user roles
export enum Roles {
    ADMIN = "ADMIN",
    USER = "USER",
}

// Define User Schema
const UserSchema: Schema<UserDocument> = new mongoose.Schema(
    {
        fullName: { type: String, trim: true, default: null },
        profile: { type: String, trim: true, default: null },
        dateBirth: { type: Date, trim: true, default: null },
        address: { type: String, trim: true, default: null },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true, trim: true },
        role: { type: String, enum: [Roles.ADMIN, Roles.USER], required: true, default: Roles.USER },
        active: { type: Boolean, default: false },
        lastLogin: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

UserSchema.set("toJSON", {
    virtuals: true,
    transform: function (_doc, ret) {
        const { email, fullName, profile, dateBirth, address } = ret as ResponseUser;
        return { email, fullName, profile, dateBirth, address };
    },
});

UserSchema.pre<UserDocument>("save", async function (next) {
    try {
        if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        throw new Error(error as string);
    }
});

UserSchema.statics.findByCredential = async function (email: string, password: string) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new NotFoundError("User not found");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new ClientError("Wrong password");
    }

    return user;
};

const User = mongoose.model<UserDocument, UserModel>("User", UserSchema);
export default User;
