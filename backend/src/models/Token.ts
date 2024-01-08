import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";
import { UserDocument } from "./User";
import jwt from "jsonwebtoken";
import config from "../config";
import { CustomError } from "../config/errors/customError";

export interface TokenDocument extends Document {
    userId: ObjectId;
    value: string;
    type: TokenType;
    createdAt: Date;
    expiresAt: Date;
    generateAccessToken: (user: UserDocument) => Promise<string>;
    generateRefreshToken: (user: UserDocument) => Promise<TokenDocument>;
    generateResetToken: (user: UserDocument) => Promise<TokenDocument>;
}

export enum TokenType {
    REFRESH = "REFRESH",
    RESET = "RESET",
}

const TokenSchema: Schema<TokenDocument> = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    value: { type: String, required: true },
    type: { type: String, enum: [TokenType.REFRESH, TokenType.RESET], required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, expires: 0 },
});

TokenSchema.methods.generateAccessToken = function (user: UserDocument) {
    try {
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
    } catch (error) {
        throw new CustomError("Failed generate access token");
    }
};

TokenSchema.methods.generateRefreshToken = async function (user: UserDocument) {
    try {
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
    } catch (error) {
        throw new CustomError("Failed generate refresh token");
    }
};

TokenSchema.methods.generateResetToken = async function (user: UserDocument) {
    const existingToken = await Token.find({ userId: user._id, type: TokenType.RESET });

    if (existingToken) {
        await Token.deleteMany({ userId: user._id, type: TokenType.RESET });
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

const Token = mongoose.model<TokenDocument>("Token", TokenSchema);

export default Token;
