import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../config/errors/customError";

export function validate(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors: Record<string, string> = {};
        errors.array().forEach((err: any) => {
            extractedErrors[err.path] = err.msg;
        });
        throw new CustomError("Validation failed", 400, extractedErrors);
    }
    next();
}
