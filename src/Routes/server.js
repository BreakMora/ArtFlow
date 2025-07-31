import Stripe from 'stripe';

export default async function stripePlugin(fastify, options) {
  const stripe = Stripe(process.env.STRIPE_API_KEY);
  const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

  fastify.post('/crear-suscripcion', async (req, reply) => {
    const { monto } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Suscripción Mensual' },
            unit_amount: monto * 100,
            recurring: { interval: 'month' }
          },
          quantity: 1
        }],
        success_url: `${BASE_URL}/perfil-artista.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/cancel.html`
      });

      return { url: session.url };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Error creando la suscripción' });
    }
  });
}
