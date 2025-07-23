// dependencias
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import mongoose from "mongoose";
import path from 'path';
import { fileURLToPath } from 'url';

// route Connection Database
import { connectDatabase } from "./src/DataBase/connection.js";

// constantes, puertos y url de la base de datos
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const MONGO_URI = 'mongodb://root:Abcd123!@mongo:27017/ArtFlow?authSource=admin';

// route Login and register
import loginRoute from './src/Routes/Auth/login.js';
import registerRoute from './src/Routes/Auth/register.js';

// isntancia de fastify
const fastify = Fastify({
    logger: {
        level: 'info'
    }
});

// manejo de cors para peticiones
fastify.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type']
});

// conexion a la base de datos
fastify.addHook('onReady', async () => {
    await connectDatabase(MONGO_URI);
});

// Configuración ÚNICA de static files
fastify.register(fastifyStatic, {
    root: path.join(__dirname),
    prefix: '/',
    decorateReply: true, // Solo una vez
    wildcard: false
});

// Ruta para archivos en /src
fastify.get('/src/*', (req, reply) => {
    const filePath = path.join(__dirname, req.url);
    reply.sendFile(filePath);
});

// Ruta para archivos en /public/assets
fastify.get('/assets/*', (req, reply) => {
    const filePath = path.join(__dirname, 'public', req.url);
    reply.sendFile(filePath);
});

// Ruta principal
fastify.get('/', (req, reply) => {
    reply.sendFile('index.html', path.join(__dirname, 'public'));
});

fastify.get('/registro.html', (req, reply) => {
    reply.sendFile('registro.html', path.join(__dirname, 'public'));
});

fastify.get('/descubre.html', (req, reply) => {
    reply.sendFile('descubre.html', path.join(__dirname, 'public'));
});


async function registerRoutes() {
    // Contenido, pagina principal
    await fastify.register(import('./src/Routes/Main/main.js'), {
        prefix: '/api/v1'
    });

     // Ruta registro de usuariop
    await fastify.register(registerRoute, {
        prefix: '/api/v1/auth'
    })

    // Ruta de inicio de sesion
    await fastify.register(loginRoute, {
        prefix: '/api/v1/auth'
    })
};

fastify.get('/health', async (request, reply) => {
    const dbStatus = mongoose.connection.readyState === 1  ? 'connected' : 'disconnected';

    return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0', 
        dbStatus,
        dbName: mongoose.connection.name || 'not connected'
    }
});

registerRoutes();

// manejo de iniciacion del servicio
const start = async () => {
    try {
        await fastify.listen({
            port: PORT,
            host: '0.0.0.0'
        });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();