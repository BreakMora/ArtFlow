import SubscriptionModel from "../Models/subscription";

async function Subscriptions(fastify, options) {

    fastify.post('/subscribe', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { artist_id } = request.body;

        try {
            const fan_id = request.user._id;

            // verificar si el usuario es un fan para suscribirse
            if (request.user.role !== 'fan') {
                return reply.status(403).send({ 
                    status: 'error', 
                    message: 'No tienes permiso para suscribirte' 
                });
            }

            // Verificar si el artista existe
            const artist = await fastify.mongo.db.collection('users').findOne({ _id: artist_id, role: 'artista' });
            if (!artist) {
                return reply.status(404).send({ 
                    status: 'error', 
                    message: 'Artista no encontrado' 
                });
            }

            // Verficar si ya existe una suscripción activa
            const existingSubscription = await SubscriptionModel.findOne({
                fan_id,
                artist_id,
                status: 'active'
            });
            
            if (existingSubscription) {
                return reply.status(409).send({ 
                    status: 'error', 
                    message: 'Ya estás suscrito a este artista' 
                });
            }

            // Crear la nueva suscripción
            const newSubscription = new SubscriptionModel({
                fan_id,
                artist_id,
                status: 'active'
            });

            await newSubscription.save();
            reply.status(201).send({
                status: 'success',
                message: 'Suscripción creada exitosamente',
                subscription: newSubscription
            });
        
        } catch (error) {

            if (error.code === 11000) {
                return reply.status(409).send({ 
                    status: 'error', 
                    message: 'Ya estás suscrito a este artista'
                });
            }

            reply.status(500).send({
                status: 'error',
                message: 'Error interno del servidor, no se pudo completar la suscripción',
                error: error.message
            });
        }
    });

    fastify.delete('/unsubscribe/:artist_id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { artist_id } = request.params;
        const fan_id = request.user._id;

        try {
            // Verificar si el usuario es un fan para cancelar la suscripción
            if (request.user.role !== 'fan') {
                return reply.status(403).send({ 
                    status: 'error', 
                    message: 'No tienes permiso para cancelar la suscripción' 
                });
            }

            const subscription = await SubscriptionModel.findOneAndUpdate(
                { fan_id, artist_id },
                { status: 'cancelled' },
                { new: true }
            );

            if (!subscription) {
                return reply.status(404).send({ 
                    status: 'error', 
                    message: 'Suscripción no encontrada' 
                });
            }

            reply.status(200).send({
                status: 'success',
                message: 'Suscripción cancelada exitosamente'
            });

        } catch (error) {
            reply.status(500).send({
                status: 'error',
                message: 'Error interno del servidor, no se pudo cancelar la suscripción',
                error: error.message
            });
        }
    });
    
}

export default Subscriptions;