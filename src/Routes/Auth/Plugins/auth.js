import jsonwebtoken from 'jsonwebtoken';
import fp from 'fastify-plugin';

async function authPlugin(fastify, reply) {
    const authenticate = async function (request, reply) {
        try {
            const authHeader = request.headers?.authorization;
            // Verifica que el token esté presente y sea válido
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.code(401).send({
                    status: 'error',
                    message: 'No autorizado - Token no proporcionado'
                });
            }

            const token = authHeader.split(' ')[1];
            // Verifica el token usando la clave secreta
            if (!token) {
                return reply.code(401).send({
                    status: 'error',
                    message: 'No autorizado - Token no proporcionado'
                });
            }

            const decode = jsonwebtoken.verify(token, process.env.JSONWEBTOKEN_SECRET || 'secreto');
            
            request.user = {
                _id: decode.id,
                role: decode.role
            };

        } catch (error) {
            reply.code(401).send({
                status: 'error',
                message: 'No autorizado - Token invalido'
            });
            // Si el token es válido, se agrega el usuario al request
            throw new Error('No autorizado - Token invalido');
        }
    };

    fastify.decorate('authenticate', authenticate);
}

export default fp(authPlugin);