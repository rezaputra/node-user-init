import mongoose from "mongoose";
import config from ".";

async function connectDB() {
    const uri = config.db.uri as string;
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection error: ", error);
    }
}

async function closeDB() {
    try {
        await mongoose.disconnect();
        console.log("MongoDB connection closed");
    } catch (error) {
        console.error("Error closing MongoDB connection:", error);
    }
}

export { connectDB, closeDB };
