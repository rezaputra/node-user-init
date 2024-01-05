import { NotFoundError } from "../../utils/errors/notFoundError";

export function lostHandler() {
    throw new NotFoundError("Resource not found");
}
