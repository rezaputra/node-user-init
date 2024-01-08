import { CorsOptions } from "cors";

const allowlist: string[] = ["http://127.0.01:3000", "http://127.0.0.1:8000"];

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (origin && allowlist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    exposedHeaders: "WWW-Authenticate",
};

export default corsOptions;
