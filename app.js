// dependencias
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import mongoose from "mongoose";
import path from 'path';
import { fileURLToPath } from 'url';

// plugins de autenticación
import authPlugin from "./src/Plugins/auth.js";

// route Connection Database
import { connectDatabase } from "./src/DataBase/connection.js";

// constantes, puertos y url de la base de datos
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const MONGO_URI = 'mongodb://root:Abcd123!@mongo:27017/ArtFlow?authSource=admin';

// route Login and register
import loginRoute from './src/Routes/Auth/login.js';
import registerRoute from './src/Routes/Auth/register.js';

// route publication
import publicationRoutes from "./src/Routes/Posts/publication.js";

// route comments
import commentRoutes from "./src/Routes/Posts/comment.js";

// rout subscription
import Subscriptions from "./src/Routes/subscription.js";

// instancia de fastify
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
    wildcard: true
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

fastify.get('/descubre.html', (req, reply) => {
    reply.sendFile('descubre.html', path.join(__dirname, 'public'));
});

fastify.get('/fan-home.html', (req, reply) => {
    reply.sendFile('fan-home.html', path.join(__dirname, 'public'));
});

fastify.get('/registro.html', (req, reply) => {
    reply.sendFile('registro.html', path.join(__dirname, 'public'));
});

fastify.get('/login.html', (req, reply) => {
    reply.sendFile('login.html', path.join(__dirname, 'public'));
});

fastify.get('/header.html', (req, reply) => {
    reply.sendFile('header.html', path.join(__dirname, 'public'));
});

fastify.get('/perfil-artista.html', (req, reply) => {
    reply.sendFile('perfil-artista.html', path.join(__dirname, 'public'));
});

fastify.get('/artista-dashboard.html', (req, reply) => {
    reply.sendFile('artista-dashboard.html', path.join(__dirname, 'public'));
});
// Ruta principal
fastify.get('/', (req, reply) => {
    reply.sendFile('index.html', path.join(__dirname, 'public'));
});

// construye las rutas de la api
async function registerRoutes() {
    // Contenido, pagina principal
    await fastify.register(import('./src/Routes/Main/main.js'), {
        prefix: '/api/v1'
    });

    // Plugin de autenticación
    await fastify.register(authPlugin);

     // Ruta registro de usuario
    await fastify.register(registerRoute, {
        prefix: '/api/v1/auth'
    })

    // Ruta de inicio de sesion
    await fastify.register(loginRoute, {
        prefix: '/api/v1/auth'
    })

    // Ruta de publicaciones
    await fastify.register(publicationRoutes, {
        prefix: '/api/v1/publications'
    });

    // Ruta de comentarios
    await fastify.register(commentRoutes, {
        prefix: '/api/v1/comments'
    });

    // Ruta de suscripciones
    await fastify.register(Subscriptions, {
        prefix: '/api/v1/subscriptions'
    });
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