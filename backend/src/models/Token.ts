import mongoose, { Document, ObjectId, Schema } from "mongoose";

// Define a Token interface extending Document from Mongoose
export interface TokenDocument extends Document {
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

const TokenSchema: Schema<TokenDocument> = new mongoose.Schema({
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

// // Instance method to generate an access token
// TokenSchema.methods.generateAccessToken = function () {
//     const user = this;
//     if (!user.verified) {
//         return null;
//     }

//     const accessToken: string = jwt.sign(
//         {
//             _id: user._id,
//             email: user.email,
//             role: user.role,
//         },
//         config.jwt.access!,
//         {
//             expiresIn: `${config.jwt.accessExpires}m`,
//             notBefore: 0,
//             audience: config.jwt.audience,
//             issuer: config.jwt.issuer,
//             algorithm: "HS256",
//         }
//     );

//     return accessToken;
// };

const Token = mongoose.model<TokenDocument>("Token", TokenSchema);

export default Token;
