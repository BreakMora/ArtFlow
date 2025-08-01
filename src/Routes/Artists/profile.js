// src/Routes/artists/profile.js
import User from '../../Models/user.js'
import PublicationModel from '../../Models/publication.js'
import MultimediaModel from '../../Models/publicacion.multimedia.js'
import SubscriptionModel from '../../Models/subscription.js'

export default async function artistProfile(fastify, opts) {
  // GET /api/v1/artists/:id → datos públicos del artista
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    const artist = await User.findById(id).select('username firstName lastName email')
    if (!artist) return reply.status(404).send({ status:'error', message:'Artista no encontrado' })
    // Asumimos que tienes campos bio y socials en tu modelo
    return { status:'success', data:{ artist } }
  })

  // GET /api/v1/artists/:id/posts?freeOnly=&limit=
  fastify.get('/:id/posts', async (request, reply) => {
    const { id } = request.params
    const freeOnly = request.query.freeOnly === 'true'
    const limit = parseInt(request.query.limit) || 5
    const filter = { user_id: id, status:'active' }
    if (freeOnly) filter.type = 'gratis'
    const posts = await PublicationModel.find(filter)
      .populate('multimedia')
      .sort({ createdAt:-1 })
      .limit(limit)
    return reply.send({ status:'success', data:{ posts } })
  })

  // todas estas rutas requieren que el fan esté autenticado
  fastify.addHook('preValidation', (request, reply, done) => {
    if (request.routerPath !== '/:id' && request.routerPath !== '/:id/posts') {
      return fastify.authenticate(request, reply, done)
    }
    done()
  })

  // GET /api/v1/artists/:id/check-subscription
  fastify.get('/:id/check-subscription', async (request, reply) => {
    const fanId = request.user._id.toString()
    const artistId = request.params.id
    const sub = await SubscriptionModel.findOne({ fan_id:fanId, artist_id:artistId, status:'active' })
    return { status:'success', data:{ isSubscribed: !!sub } }
  })

  // POST /api/v1/artists/:id/subscribe
  fastify.post('/:id/subscribe', async (request, reply) => {
    const fanId = request.user._id
    const artistId = request.params.id
    // no suscribir dos veces
    await SubscriptionModel.updateOne(
      { fan_id:fanId, artist_id:artistId },
      { $set: { status:'active' } },
      { upsert:true }
    )
    return reply.code(201).send({ status:'success', message:'Suscripción activada' })
  })

  // DELETE /api/v1/artists/:id/unsubscribe
  fastify.delete('/:id/unsubscribe', async (request, reply) => {
    const fanId = request.user._id
    const artistId = request.params.id
    await SubscriptionModel.updateOne(
      { fan_id:fanId, artist_id:artistId, status:'active' },
      { $set: { status:'inactive' } }
    )
    return { status:'success', message:'Suscripción cancelada' }
  })
}
