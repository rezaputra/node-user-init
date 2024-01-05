import mongoose, { Document, ObjectId, Schema } from "mongoose";

// Define a Token interface extending Document from Mongoose
export interface IToken extends Document {
    userId: ObjectId;
    value: string;
    type: TokenType;
    createdAt: Date;
    expiresAt: Date;
}

export enum TokenType {
    REFRESH = "REFRESH",
    RESET = "RESET",
}

const TokenSchema: Schema<IToken> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    value: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: [TokenType.REFRESH, TokenType.RESET],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // date when token expired
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    },
});

const Token = mongoose.model<IToken>("Token", TokenSchema);

export default Token;
