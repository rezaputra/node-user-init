import express from "express";
import { json } from "body-parser";
import routes from "./routes/index";
import { errorHandler } from "./middleware/handler/errorHandler";
import config from "./config";
import { lostHandler } from "./middleware/handler/lostHandler";
import { closeDB, connectDB } from "./config/mongodb";

const app = express();
app.use(json());

app.use("/" + config.prefix, routes);

app.use(errorHandler);
app.use(lostHandler);

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
