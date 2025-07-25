import PublicationModel from "../../Models/publication.js";
import MultimediaModel from "../../Models/publicacion.multimedia.js";

async function createPublication(fastify, options) {

    fastify.post('/create', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { title, description, multimedia } = request.body;
            const user_id = request.user._id; // Obtiene el ID del usuario autenticado
            
            const newPublication = new PublicationModel({
                user_id,
                title,
                description,
                multimedia: []
            });

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
            const deletedPublication = await PublicationModel.findByIdAndDelete(
                { _id: id, user_id: request.user._id } // se asegura que el usuario sea el propietario
            );

            if (!deletedPublication) {
                return reply.status(404).send({ error: 'Publicación no encontrada' });
            }

            // Eliminar multimedia asociada
            await MultimediaModel.deleteMany({ publication_id: deletedPublication._id });

            reply.status(200).send({
                status: 'success',
                message: 'Publicación eliminada exitosamente'
            });

        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Error al eliminar la publicación' });
        }
    });

    // Obtener una publicación por ID
    fastify.get('/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params;

        try {
            const publication = await PublicationModel.findById(id)
                .populate('user_id', 'username email') // Popula el usuario
                .populate('multimedia'); // Popula la multimedia asociada

            if (!publication) {
                return reply.status(404).send({ error: 'Publicación no encontrada' });
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
}

export default createPublication;