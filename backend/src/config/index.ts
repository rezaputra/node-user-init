import * as dotenv from "dotenv";
dotenv.config();

const config = {
    jwt: {
        access: process.env.JWT_ACCESS_TOKEN_SECRET,
        refresh: process.env.JWT_REFRESH_TOKEN_SECRET,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        accessExpires: process.env.JWT_ACCESS_TOKEN_EXPIRES,
        resetExpires: process.env.JWT_RESET_TOKEN_EXPIRES,
        refreshExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES,
    },
    port: process.env.PORT || 3000,
    prefix: process.env.API_PREFIX || "api/v1",
    db: {
        uri: process.env.DB_URI,
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS,
    },
};

export default config;
