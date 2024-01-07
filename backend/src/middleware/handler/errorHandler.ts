import { Request, Response, NextFunction } from "express";
import { CustomError, IResponseError } from "../../config/errors/customError";
import multer from "multer";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err);

    if (err instanceof CustomError) {
        const customError = err as CustomError;
        let response: IResponseError = {
            success: false,
            status: customError.status,
            message: customError.message,
        };

        if (customError.additionalInfo) {
            response.additionalInfo = customError.additionalInfo;
        }

        return res.status(customError.status).json(response);
    } else if (err instanceof multer.MulterError) {
        let response: IResponseError = {
            success: false,
            status: 400,
            message: "File is invalid",
        };

        if (err.code === "LIMIT_FILE_SIZE") {
            response.message = "File size limit exceeded";
            return res.status(400).json(response);
        } else {
            return res.status(400).json(response);
        }
    } else {
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Server error, please try again later",
        });
    }
}
