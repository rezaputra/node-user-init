import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./checkJwt";
import { Roles } from "../../models/User";
import { ForbiddenError } from "../../config/errors/forbiddenError";

export function checkRole(roles: Array<Roles>, verified: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userPayload = (req as CustomRequest).token.payload;

            if (verified && !userPayload.verified) {
                throw new ForbiddenError("Please verify your email");
            }

            if (!roles.includes(userPayload.role)) {
                throw new ForbiddenError("Not enough permission");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}
