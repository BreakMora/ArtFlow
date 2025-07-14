import mongoose from "mongoose";

let isConnected = false;

export async function connectDatabase(MONGO_URI) {
    if (isConnected) return mongoose.connection;

    try {
        await mongoose.connect(MONGO_URI, {
            authSource: 'admin'
        });

        isConnected = true;
    } catch (error) {
        console.error(`Error connect to MongoDB: ${error}`);
        process.exit(1);
    }
}