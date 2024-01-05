import { Request, Response, NextFunction } from "express";
import { CustomError, IResponseError } from "../../utils/errors/customError";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    if (!(err instanceof CustomError)) {
        return res.status(500).send(
            JSON.stringify({
                success: false,
                status: 500,
                message: "Server error, please try again later",
            })
        );
    } else {
        const customError = err as CustomError;
        let response = {
            success: false,
            status: customError.status,
            message: customError.message,
        } as IResponseError;
        if (customError.additionalInfo) response.additionalInfo = customError.additionalInfo;
        return res.status(customError.status).type("json").send(JSON.stringify(response));
    }
}
