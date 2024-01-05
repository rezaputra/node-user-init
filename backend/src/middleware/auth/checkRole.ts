import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./checkJwt";
import { Roles } from "../../models/User";
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
            const user = (req as CustomRequest).token.payload;

            if (!user) {
                throw new NotFoundError("User not found");
            }

            if (!roles.includes(user.role && user.verified === false)) {
                throw new ForbiddenError("Not enough permission");
            }

            next();
        } catch (error) {
            throw new CustomError("Error check role");
        }
    };
}
