import jwt from 'jsonwebtoken';

async function authPlugin(fastify, options) {
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            const authHeader = request.headers?.authorization;
            const token = authHeader.split(' ')[1];

            const decode = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
            
            request.user = decode;

        } catch (error) {
            reply.code(401).send({
                status: 'error',
                message: 'No autorizado - Token invalido'
            });
        }
    });
}

export default authPlugin;