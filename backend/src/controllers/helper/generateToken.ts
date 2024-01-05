import config from "../../config";
import Token, { IToken, TokenType } from "../../models/Token";
import { IUser } from "../../models/User";
import jwt from "jsonwebtoken";
import { CustomError } from "../../utils/errors/customError";

export function generateAccessToken(user: IUser) {
    try {
        const accessToken: string = jwt.sign(
            {
                userId: user._id,
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
        throw new CustomError("Failed to generate refresh token", 500, error);
    }
}

export async function generateRefreshToken(user: IUser) {
    try {
        const existingToken = await Token.findOne({ userId: user._id, type: TokenType.REFRESH });

        if (existingToken) {
            const { value: refreshToken, expiresAt: expirationDate } = existingToken;
            return { refreshToken, expirationDate };
        }

        let refreshToken: string = jwt.sign(
            {
                userId: user._id,
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

        await Token.create({
            userId: user._id,
            value: refreshToken,
            type: TokenType.REFRESH,
            expiresAt: expirationDate,
        });

        return { refreshToken, expirationDate };
    } catch (error) {
        throw new CustomError("Error generate token");
    }
}
