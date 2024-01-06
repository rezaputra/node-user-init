import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Document, Schema, Model } from "mongoose";
import { NotFoundError } from "../utils/errors/notFoundError";
import { ClientError } from "../utils/errors/clientError";
import config from "../config";
import Token, { TokenDocument, TokenType } from "./Token";

// Define interfaces for User and Response User
export interface UserDocument extends Document {
    fullName: string;
    profile: string;
    email: string;
    password: string;
    role: Roles;
    active: boolean;
    lastLogin: Date;
    verified: boolean;
    generateAccessToken: () => Promise<string | null>;
    generateRefreshToken: () => Promise<TokenDocument | null>;
    generateResetToken: () => Promise<TokenDocument | null>;
}

export interface UserModel extends Model<UserDocument> {
    findByCredential(email: string, password: string): Promise<UserDocument>;
}

export interface ResponseUser {
    fullName: string;
    profile: string;
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
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true, trim: true },
        role: { type: String, enum: [Roles.ADMIN, Roles.USER], required: true, default: Roles.USER },
        active: { type: Boolean, default: false },
        lastLogin: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Transform schema output to a cleaner format
UserSchema.set("toJSON", {
    virtuals: true,
    transform: function (_doc, ret) {
        const { fullName, profile, email } = ret as ResponseUser;
        return { fullName, profile, email };
    },
});

// Hash password before saving
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

// Static method to find a user by credentials
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

// Instance method to generate an access token
UserSchema.methods.generateAccessToken = function () {
    const user = this;

    const accessToken: string = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            role: user.role,
            verified: user.verified,
        },
        config.jwt.access!,
        {
            expiresIn: `${config.jwt.accessExpires}m`,
            notBefore: 0,
            audience: config.jwt.audience,
            issuer: config.jwt.issuer,
            algorithm: "HS256",
        }
    );

    return accessToken;
};

// Instance method to generate a refresh token and manage its expiration
UserSchema.methods.generateRefreshToken = async function () {
    const user = this;

    const existingToken = await Token.findOne({ userId: user._id, type: TokenType.REFRESH });

    if (existingToken) {
        return existingToken;
    }

    const refreshToken: string = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            role: user.role,
            verified: user.verified,
        },
        config.jwt.refresh as string,
        {
            expiresIn: `${config.jwt.refreshExpires}d`,
            notBefore: 0,
            audience: config.jwt.audience,
            issuer: config.jwt.issuer,
            algorithm: "HS256",
        }
    );

    const expirationDate: Date = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(config.jwt.refreshExpires as string));

    const token: TokenDocument = new Token({
        userId: user._id,
        value: refreshToken,
        type: TokenType.REFRESH,
        expiresAt: expirationDate,
    });
    const savedToken = await token.save();

    return savedToken;
};

// Instance method to generate a reset token
UserSchema.methods.generateResetToken = async function () {
    const user = this;

    const existingToken = await Token.find({ userId: user._id, type: TokenType.REFRESH });

    if (existingToken) {
        await Token.deleteMany({ userId: user._id, type: TokenType.REFRESH });
    }

    const resetToken: string = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            role: user.role,
        },
        config.jwt.refresh as string,
        {
            expiresIn: `${config.jwt.refreshExpires}m`,
            notBefore: 0,
            audience: config.jwt.audience,
            issuer: config.jwt.issuer,
            algorithm: "HS256",
        }
    );

    const expirationDate: Date = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(config.jwt.resetExpires as string));

    const token: TokenDocument = new Token({
        userId: user._id,
        value: resetToken,
        type: TokenType.RESET,
        expiresAt: expirationDate,
    });

    const savedToken = await token.save();

    return savedToken;
};

// const UserModel: Model<UserDocument> = mongoose.model<UserDocument, UserModel>("User", UserSchema);

// export default UserModel;

const User = mongoose.model<UserDocument, UserModel>("User", UserSchema);
export default User;
