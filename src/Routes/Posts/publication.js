import PublicationModel from "../../Models/publication.js";
import MultimediaModel from "../../Models/publicacion.multimedia.js";

async function Publications(fastify, options) {

    // Ruta para crear una nueva publicación
    fastify.post('/create', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            if (request.user.role !== 'artista') {
                return reply.status(403).send({ status: 'error', message: 'No tienes permiso para crear publicaciones' });
            }

            const { title, description, category, type, multimedia } = request.body;
            const user_id = request.user._id; // Obtiene el ID del usuario autenticado
            
            const newPublication = new PublicationModel({
                user_id,
                title,
                description,
                category,
                type,
                multimedia: []
            });

            // Verificar si se proporcionó multimedia
            if ( multimedia && multimedia.length > 0) {
                const multimediaDocs = await Promise.all(multimedia.map(async (item) => {
                    const newMultimedia = new MultimediaModel({
                        publication_id: newPublication._id,
                        url: item.url,
                        title: item.title,
                        format: item.format
                    });
                    await newMultimedia.save();
                    return newMultimedia._id;
                }));
                newPublication.multimedia = multimediaDocs; 
            }

            await newPublication.save();
            reply.status(201).send({
                status: 'success',
                message: 'Publicación creada exitosamente',
                publication: newPublication
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al crear la publicación', details: error.message });
        }
    });

    // Actualizar una publicación
    // Se asegura que el usuario sea el propietario de la publicación
    fastify.put('/update/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const { title, description, multimedia } = request.body;

        try {
            const publication = await PublicationModel.findOne(
                { _id: id, user_id: request.user._id } // se asegura que el usuario sea el propietario
            );

            if (!publication) {
                return reply.status(404).send({ error: 'Publicación no encontrada' });
            }

            // Actualizar campos de la publicación
            publication.title = title || publication.title;
            publication.description = description || publication.description;

            // Actualizar multimedia
            if ( multimedia && multimedia.length > 0) {
                // Eliminar multimedia existente asociada a la publicación
                await MultimediaModel.deleteMany({ publication_id: publication._id });
                // Crear nueva multimedia
                const multimediaDocs = await Promise.all(multimedia.map(async (item) => {
                    const newMultimedia = new MultimediaModel({
                        publication_id: publication._id,
                        url: item.url,
                        title: item.title,
                        format: item.format
                    });
                    await newMultimedia.save();
                    return newMultimedia._id;
                }));

                publication.multimedia = multimediaDocs;
            }

            await publication.save();

            // Popula la multimedia actualizada
            const updatedPublication = await PublicationModel.findById(publication._id)
                .populate('user_id', 'username email') // Popula el usuario
                .populate('multimedia'); // Popula la multimedia asociada

            reply.status(200).send({
                status: 'success',
                message: 'Publicación actualizada exitosamente',
                publication: updatedPublication
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al actualizar la publicación' });
        }
    });

    // Eliminar una publicación
    // Se asegura que el usuario sea el propietario de la publicación
    fastify.delete('/delete/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;

        try {
            // Buscar la publicación
            const publication = await PublicationModel.findById(id);
            if (!publication) {
                return reply.status(404).send({ error: 'Publicación no encontrada' });
            }

            // Verificar si el usuario cuenta con permisos de admin o artista
            const isOwner = publication.user_id.equals(request.user._id);
            const isAdmin = request.user.role === 'admin';

            // Permitir eliminar solo publicaciones activas
            if (!(isAdmin || isOwner)) {
                return reply.status(403).send({ error: 'No tienes permiso para eliminar esta publicación' });
            }

            // Eliminar publicación de forma lógica
            await PublicationModel.findByIdAndUpdate(id, { status: 'deleted' });

            reply.status(200).send({
                status: 'success',
                message: 'Publicación eliminada exitosamente'
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al eliminar la publicación' });
        }
    });

    // Búsqueda por título con paginación
    fastify.get('/search', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { title, category, type, artist } = request.query;
        const userId = request.user.id;
        const userRole = request.user.rol;

        const filter = { status: 'active' }; // Solo publicaciones activas

        if (title) {
            filter.$or = [
                { title: new RegExp(title, 'i') },
                { description: new RegExp(title, 'i') }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (type) {
            filter.type = type;
        }
        
        // Verificar roles y aplicar restricciones
        const isAdmin = userRole === 'admin';
        const isArtist = userRole === 'artista';
        const isFan = userRole === 'fan';

        try {
            const page = parseInt(request.query.page) || 1; // Página por defecto es 1
            const limit = parseInt(request.query.limit) || 10; // Límite por defecto es 10
            const skip = (page - 1) * limit; // Calcular el número de documentos a saltar

            // Si es artista, filtrar por su ID
            if (isArtist && !isAdmin) {
                filter.user_id = userId;

                // si intenta filtrar por otro artista, no se permite
                if (artist && artist !== request.user.username) {
                    reply.status(403).send({ status: 'error', message: 'No tienes permiso para ver publicaciones de otros artistas' });
                    return;
                }
            }

            // Si es fan, filtrar por sus suscripciones
            else if (isFan && !isAdmin) {
                // Obtener las suscripciones del fan
                const subscriptions = await SubscriptionModel.find({ fan_id: userId, status: 'active' });
                const subscribeArtist = subscriptions.map(sub => sub.artist_id);

                // solo pueden ver:
                /**
                 * 1. Publicaciones de los artistas a los que están suscritos (premiun y gratis)
                 * 2. Publicaciones gratis de otros artistas
                 */
                filter.$or = [
                    {
                        $and: [
                            { user_id: { $in: subscribeArtist } },
                            { type: { $in: ['gratis', 'premium'] } }
                        ]
                    },
                    { type: 'gratis' }
                ];

                // Combinar con otros filtros si existen
                if (filter.$or) {
                    filter.$and = filter.$and || [];
                    filter.$and.push({ $or: filter.$or });
                    delete filter.$or;
                }
            }
            // Si es admin, puede ver todo (no se aplican restricciones adicionales)

            // Si se especifica un artista en el filtro (y el usuario tiene permiso)
            if (artist && (!isArtist || isAdmin)) {
                const artistUser = await UserModel.findOne({ username: artist });
                if (artistUser) {
                    filter.user_id = artistUser._id;
                }
            }

            // Consulta con paginación
            const publications = await PublicationModel.find({ title: new RegExp(title, 'i') })
                .populate('user_id', 'username email') // Popula el usuario
                .populate('multimedia') // Popula la multimedia asociada
                .skip(skip) // Saltar los documentos de las páginas anteriores
                .limit(limit); // Limitar el número de documentos devueltos

            const total = await PublicationModel.countDocuments(filter);

            reply.status(200).send({
                status: 'success',
                data: {
                    publications,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalResults: total
                    }
                }
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ 
                status: 'error',
                message: 'Error al buscar publicaciones',
                error: error.message
            });
        }
    });

    // Obtener una publicación por ID
    fastify.get('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const userId = request.user._id;

        try {
            const publication = await PublicationModel.findById(id)
                .populate('user_id', 'username email') // Popula el usuario
                .populate('multimedia'); // Popula la multimedia asociada

            if (!publication) {
                return reply.status(404).send({ error: 'Publicación no encontrada' });
            }

            if (publication.status === 'deleted') {
                return reply.status(410).send({ error: 'Publicación eliminada' });
            }

            // verificar permiso de acceso
            const isOwner = publication.user_id._id.equals(userId);
            const isAdmin = request.user.role === 'admin';

            //verificar si el usuario es un fan subsicrito al artista
            let isSubscribed = false;
            if (request.user.role === 'fan') {
                const subscription = await SubscriptionModel.findOne({
                    fan_id: userId,
                    artist_id: publication.user_id._id,
                    status: 'active'
                });
                isSubscribed = !!subscription;
            }

            // Permitir acceso solo si es el propietario, admin o fan suscrito
            if (!isOwner && !isAdmin && !isSubscribed) {
                return reply.status(403).send({ error: 'No tienes permiso para ver esta publicación' });
            }

            // Incrementar las vistas de la publicación solo si el usuario no es el propietario
            if (!isOwner) {
                publication.views = publication.views || 0; // Asegura que views no sea undefined
                publication.views += 1;
                await publication.save();
            }

            reply.status(200).send({
                status: 'success',
                publication
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al obtener la publicación' });
        }
    });

    // Obtener todas las publicaciones de un usuario 
/*  // Descomentar si se desea habilitar esta ruta
    fastify.get('/user/:userId', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { userId } = request.params;

        try {
            const publications = await PublicationModel.find({ user_id: userId })
                .populate('user_id', 'username email') // Popula el usuario
                .populate('multimedia'); // Popula la multimedia asociada

            reply.status(200).send({
                status: 'success',
                publications
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al obtener las publicaciones del usuario' });
        }
    });
*/ 

    // Obtener todas mis publicaciones con paginación
    fastify.get('/my', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const userId = request.user._id;

        try {
            const page = parseInt(request.query.page) || 1; // Página por defecto es 1
            const limit = parseInt(request.query.limit) || 10; // Límite por defecto es 10
            const skip = (page - 1) * limit; // Calcular el número de documentos a saltar

            // Consulta con paginación
            const [publicacion, total] = await Promise.all([
                PublicationModel.find({ user_id: userId })
                    .populate({ path: 'user_id', select: 'username email' }) // Popula el usuario
                    .populate({ path: 'multimedia', select: 'url' }) // Popula la multimedia asociada
                    .skip(skip) // Saltar los documentos de las páginas anteriores
                    .limit(limit), // Limitar el número de documentos devueltos
                PublicationModel.countDocuments( { user_id: userId })
            ]);

            reply.status(200).send({
                status: 'success',
                count: publicacion.length,
                page: Math.ceil(total / limit),
                total,
                publications: publicacion,
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al obtener mis publicaciones' });
        }
    });

    // registrar likes
    fastify.post('/:id/like', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const userId = request.user._id;

        try {
            // Buscar la publicación
            const publication = await PublicationModel.findById(id);
            if (!publication) {
                return reply.status(404).send({ error: 'Publicación no encontrada' });
            }

            // validar suscripción
            const isSubscribed = await SubscriptionModel.exists({
                fan_id: userId,
                artist_id: publication.user_id,
                status: 'active'
            });
            
            if (!isSubscribed) {
                return reply.status(403).send({ error: 'Debes estar suscrito al artista para dar like' });
            }

            // Verificar si el usuario ya ha dado like
            if (publication.likes.includes(userId)) {
                return reply.status(400).send({ error: 'Ya has dado like a esta publicación' });
            }

            // Agregar el like
            publication.likes.push(userId);
            await publication.save();

            reply.status(200).send({
                status: 'success',
                message: 'Like registrado exitosamente',
                publication
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al registrar el like' });
        }
    });

    // registrar dislikes
    fastify.post('/:id/dislike', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;
        const userId = request.user._id;

        try {
            const publication = await PublicationModel.findById(id);
            if (!publication) {
                return reply.status(404).send({ error: 'Publicación no encontrada' });
            }

            // validar suscripción
            const isSubscribed = await SubscriptionModel.exists({
                fan_id: userId,
                artist_id: publication.user_id,
                status: 'active'
            });

            if (!isSubscribed) {
                return reply.status(403).send({ error: 'Debes estar suscrito al artista para dar dislike' });
            }

            // Verificar si el usuario ya ha dado dislike
            if (publication.dislikes.includes(userId)) {
                return reply.status(400).send({ error: 'Ya has dado dislike a esta publicación' });
            }

            // Agregar el dislike
            publication.dislikes.push(userId);
            await publication.save();

            reply.status(200).send({
                status: 'success',
                message: 'Dislike registrado exitosamente',
                publication
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al registrar el dislike' });
        }
    });

}

export default Publications;