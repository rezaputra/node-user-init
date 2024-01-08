import express from "express";
import { json } from "body-parser";
import routes from "./routes/index";
import { errorHandler } from "./middleware/handler/errorHandler";
import { closeDB, connectDB } from "./config/mongodb";
import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import corsOptions from "./config/cors";
import { generalLimiter } from "./config/limiter";

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/" + config.prefix, generalLimiter, routes);

app.use(errorHandler);
app.use((req, res) => {
    const response = {
        success: false,
        status: 404,
        message: "Resource not found",
    };
    res.status(404).json(response);
});

async function startServer() {
    try {
        await connectDB();
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
}

async function stopServer() {
    try {
        await closeDB();
        console.log("Server stopped. MongoDB connection closed.");
    } catch (error) {
        console.error("Error stopping server:", error);
    } finally {
        process.exit(0);
    }
}

startServer();

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);
