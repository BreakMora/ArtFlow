import mongoose from "mongoose";

export async function connectDatabase(MONGO_URI) {
    if (mongoose.connection.readyState === 1) {
        console.log("✅ Ya estás conectado a MongoDB.");
        return mongoose.connection;
    }

    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: 'admin'
        });

        console.log("✅ Conectado a MongoDB.");
        return mongoose.connection;
    } catch (error) {
        console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
        throw error; // Esto deja que lo maneje la función `start()` en app.js
    }
}
