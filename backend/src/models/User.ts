import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import mongoose, { Document, Schema } from "mongoose";
import { NotFoundError } from "../utils/errors/notFoundError";
import { ClientError } from "../utils/errors/clientError";
import config from "../config";
import Token, { TokenType } from "./Token";

export interface IUser extends Document {
    fullName: string;
    profile: string;
    email: string;
    password: string;
    role: Roles;
    active: boolean;
    lastLogin: Date;
    verified: boolean;
}

export interface IResUser {
    fullName: string;
    profile: string;
    email: string;
}

export enum Roles {
    ADMIN = "ADMIN",
    USER = "USER",
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
    {
        fullName: { type: String, trim: true, default: null },
        profile: { type: String, trim: true, default: null },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true, trim: true },
        role: { type: String, enum: [Roles.ADMIN, Roles.USER], required: true, default: Roles.USER },
        active: { type: Boolean, default: false },
        lastLogin: { type: Date, default: new Date() },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

UserSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret, options) {
        const { fullName, profile, email } = ret as IResUser;
        return { fullName, profile, email };
    },
});

UserSchema.pre("save", async function (next) {
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
const User = mongoose.model<IUser>("User", UserSchema);

UserSchema.statics.findByCredential = async function (email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new NotFoundError("User not found");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new ClientError("Wrong password");
    }

    return user;
};

UserSchema.methods.generateAccessToken = function () {
    const user = this;

    if (!user.verified) {
        return null;
    }

    const accessToken: string = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            role: user.role,
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

UserSchema.methods.generateRefreshToken = async function () {
    const user = this;

    const refreshToken: string = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            role: user.role,
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

    await Token.create({
        userId: user._id,
        value: refreshToken,
        type: TokenType.REFRESH,
        expiresAt: expirationDate,
    });

    return { refreshToken, expirationDate };
};

UserSchema.methods.generateResetToken = async function () {
    const user = this;

    const resetTokenValue: string = crypto.randomBytes(20).toString("base64url");
    const resetTokenSecret: string = crypto.randomBytes(10).toString("hex");
    const resetToken: string = `${resetTokenValue}+${resetTokenSecret}`;

    const resetTokenHash: string = crypto.createHmac("sha256", resetTokenSecret).update(resetToken).digest("hex");

    const expirationDate: Date = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(config.jwt.resetExpires as string));

    await Token.create({ userId: user._id, value: resetTokenHash, type: TokenType.RESET, expiresAt: expirationDate });

    return resetToken;
};

export default User;
