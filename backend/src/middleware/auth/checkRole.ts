import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./checkJwt";
import { Roles } from "../../models/User";
import { UnauthorizedError } from "../../config/errors/unauthorizedError";

export function checkRole(roles: Array<Roles>, verified: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userPayload = (req as CustomRequest).token.payload;

            if (verified && !userPayload.verified) {
                throw new UnauthorizedError("Please verify your email");
            }

            if (!roles.includes(userPayload.role)) {
                throw new UnauthorizedError("Not enough permission");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
