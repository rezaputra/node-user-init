import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express-validator/src/base";
import { ClientError } from "../../config/errors/clientError";
import { CustomRequest } from "../auth/checkJwt";

const allowedExtensions = [".jpg", ".jpeg", ".png"];

const createDestination: multer.DiskStorageOptions["destination"] = (req: Request, file: Express.Multer.File, cb) => {
    const destinationPath = `public/profiles`;

    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }
    cb(null, destinationPath);
};

const profileStorage = multer.diskStorage({
    destination: createDestination,
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const userPayload = (req as CustomRequest).token.payload;
        const filename = `${file.fieldname}-${userPayload._id}-${Date.now()}${path.extname(file.originalname)}`;

        cb(null, filename);
    },
});

const profileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = file.originalname.toLowerCase().match(/\.[0-9a-z]+$/);

    if (fileExtension && allowedExtensions.includes(fileExtension[0].toLowerCase())) {
        cb(null, true);
    } else {
        cb(new ClientError("Only jpeg, jpg, and png files are allowed"));
    }
};

const uploadProfile = multer({
    storage: profileStorage,
    limits: {
        fileSize: 2097152,
    },
    fileFilter: profileFilter,
});

export default uploadProfile;
