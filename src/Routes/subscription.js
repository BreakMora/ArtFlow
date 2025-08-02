import SubscriptionModel from "../Models/subscription.js";
import stripe from 'stripe'; // Asegúrate de instalar el paquete stripe

async function Subscriptions(fastify, options) {
    const stripeClient = stripe('tu_clave_secreta_stripe');

    fastify.post('/crear-suscripcion', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { monto, artist_id } = request.body;
        const fan_id = request.user._id;

        // Validaciones
        if (request.user.role !== 'fan') {
            return reply.status(403).send({ 
                status: 'error', 
                message: 'Solo los fans pueden suscribirse' 
            });
        }

        if (!monto || monto < 1) {
            return reply.status(400).send({ 
                status: 'error', 
                message: 'Monto inválido' 
            });
        }

        try {
            // Verificar si el artista existe
            const artist = await fastify.mongo.db.collection('users').findOne({ 
                _id: new fastify.mongo.ObjectId(artist_id), 
                role: 'artista' 
            });
            
            if (!artist) {
                return reply.status(404).send({ 
                    status: 'error', 
                    message: 'Artista no encontrado' 
                });
            }

            // Crear suscripción con estado pending
            const newSubscription = new SubscriptionModel({
                fan_id,
                artist_id,
                monto,
                status: 'pending'
            });

            await newSubscription.save();

            // Crear sesión de pago con Stripe
            const session = await stripeClient.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Suscripción a ${artist.username}`,
                        },
                        unit_amount: monto * 100,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${request.headers.origin}/pago-exitoso?subscription_id=${newSubscription._id}`,
                cancel_url: `${request.headers.origin}/perfil-artista.html?id=${artist_id}`,
            });

            return { url: session.url };

        } catch (error) {
            console.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Error al procesar el pago',
                error: error.message
            });
        }
    });

    // Mantén los otros endpoints (unsubscribe, etc.)
    fastify.delete('/unsubscribe/:artist_id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        // ... (mantén el mismo código que ya tienes)
    });

    fastify.get('/pago-exitoso', async (request, reply) => {
    const { subscription_id } = request.query;
    
    try {
        const subscription = await SubscriptionModel.findByIdAndUpdate(
            subscription_id,
            { status: 'active' },
            { new: true }
        );

        if (!subscription) {
            return reply.redirect('/error-pago');
        }

        return reply.redirect(`/perfil-artista.html?id=${subscription.artist_id}?suscription_success=true`);
        
    } catch (error) {
        console.error(error);
        return reply.redirect('/error-pago');
    }
});
}

export default Subscriptions;