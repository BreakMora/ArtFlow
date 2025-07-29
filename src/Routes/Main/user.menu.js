import UserModel from "../Models/user.model.js";

async function userMenu(fastify, options) {

    fastify.get('user/menu', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id; // ID del usuario está en el token JWT
            const user = await UserModel.findById(userId).populate('subscriptions');

            return {
                status: 'success',
                data: user,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({
                status: 'error',
                message: 'Error al obtener el menú del usuario'
            });
        }
    });

}

export default userMenu;