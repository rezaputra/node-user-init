import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, verify } from "jsonwebtoken";
import config from "../../config";
import { UnauthorizedError } from "../../utils/errors/unauthorizedError";
import { ForbiddenError } from "../../utils/errors/forbiddenError";

export interface CustomRequest extends Request {
    token: JwtPayload;
}

export const checkAccess = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = <string>req.headers["authorization"]?.split(" ")[1];

        const jwtPayload = (<any>verify(token, config.jwt.access!, {
            complete: true,
            audience: config.jwt.audience,
            issuer: config.jwt.issuer,
            algorithms: ["HS256"],
            clockTolerance: 0,
            ignoreExpiration: false,
            ignoreNotBefore: false,
        })) as JwtPayload;
        (req as CustomRequest).token = jwtPayload;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError("Access token has expired");
        } else {
            throw new ForbiddenError("Invalid access token");
        }
    }
};

export const checkRefresh = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.refreshToken;

        const jwtPayload = (<any>verify(token, config.jwt.refresh!, {
            complete: true,
            audience: config.jwt.audience,
            issuer: config.jwt.issuer,
            algorithms: ["HS256"],
            clockTolerance: 0,
            ignoreExpiration: false,
            ignoreNotBefore: false,
        })) as JwtPayload;
        (req as CustomRequest).token = jwtPayload;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError("Refresh token has expired");
        } else {
            throw new ForbiddenError("Invalid refresh token");
        }
    }
};

export const checkReset = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.params.token;

        const jwtPayload = (<any>verify(token, config.jwt.refresh!, {
            complete: true,
            audience: config.jwt.audience,
            issuer: config.jwt.issuer,
            algorithms: ["HS256"],
            clockTolerance: 0,
            ignoreExpiration: false,
            ignoreNotBefore: false,
        })) as JwtPayload;
        (req as CustomRequest).token = jwtPayload;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError("Reset token has expired");
        } else {
            throw new ForbiddenError("Invalid reset token");
        }
    }
};
