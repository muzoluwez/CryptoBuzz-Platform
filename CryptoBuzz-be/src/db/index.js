import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in environment");
        }

        const uri =
            mongoUri.includes("/") && mongoUri.split("/").pop().length
                ? mongoUri
                : `${mongoUri}/${DB_NAME}`;

        const connectionInstance = await mongoose.connect(uri);

        console.log(
            `MongoDB connected — host: ${connectionInstance.connection.host}`
        );
        return connectionInstance;
    } catch (error) {
        console.error("MONGODB connection FAILED:", error.message);
        process.exit(1);
    }
};

export default connectDB;
