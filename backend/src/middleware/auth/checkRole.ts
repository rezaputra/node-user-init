import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./checkJwt";
import User, { Roles } from "../../models/User";
import { CustomError } from "../../utils/errors/customError";
import { ForbiddenError } from "../../utils/errors/forbiddenError";
import { NotFoundError } from "../../utils/errors/notFoundError";

// interface ITokenPayload {
//     userId: string,
//     email: string,
//     role: Roles,
//     verified: boolean,
// }

export function checkRole(roles: Array<Roles>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userPayload = (req as CustomRequest).token.payload;

            if (!roles.includes(userPayload.role)) {
                throw new ForbiddenError("Not enough permission");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

export async function isVerified(req: Request, res: Response, next: NextFunction) {
    try {
        const userPayload = (req as CustomRequest).token.payload;

        if (userPayload.verified === true) {
            throw new ForbiddenError("Please verify your email");
        }

        next();
    } catch (error) {
        next(error);
    }
}
