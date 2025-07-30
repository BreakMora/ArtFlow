import CommentModel from "../../Models/comments.js";
import PublicationModel from "../../Models/publication.js";
import SubscriptionModel from "../../Models/subscription.js";

async function Comments(fastify, options) {

    // Ruta para crear un comentario
    fastify.post('/:publication_id/comments', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { publication_id } = request.params;
        const { content } = request.body;
        const user_id = request.user._id;

        try {
            /*
            // Validar si es fan con subscripción o artista dueño de la publicación
            const isFanWithSubscription = request.user.role === 'fan' && subscription;
            const isOwnerArtist = request.user.role === 'artista' && publication.user_id.toString() === user_id.toString();

            if (!isFanWithSubscription && !isOwnerArtist) {
                return reply.status(403).send({
                    status: 'error',
                    message: 'Debes estar suscrito al artista o ser el propietario de la publicación para comentar'
                });
            }
            */
            // Verificar si la publicación existe
            const publication = await PublicationModel.findById(publication_id);
            if (!publication) {
                return reply.status(404).send({ 
                    status: 'error', 
                    message: 'Publicación no encontrada' 
                });
            }

            /*
            // Verificar si el usuario está suscrito al artista de la publicación
            const subscription = await SubscriptionModel.findOne({
                fan_id: user_id,
                artist_id: publication.user_id,
                status: 'active'
            });

            // Si no está suscrito o no es propietario de la publicación, no puede comentar
            if (!subscription && publication.user_id.toString() !== user_id.toString()) {
                return reply.status(403).send({ 
                    status: 'error', 
                    message: 'Debes estar suscrito al artista para comentar' 
                });
            }
            */
            // Validar permisos para comentar
            const isOwner = publication.user_id.toString() === user_id.toString();
            const isAdmin = request.user.role === 'admin';
            const isFree = publication.type === 'gratis';

            let isSubscribed = false;
            if (request.user.role === 'fan') {
                const subscription = await SubscriptionModel.findOne({
                    fan_id: user_id,
                    artist_id: publication.user_id,
                    status: 'active'
                });
                isSubscribed = !!subscription;
            }

            // Reglas:
            const canComment = isOwner || isAdmin || (request.user.role === 'fan' && ((isFree) || isSubscribed));

            if (!canComment) {
                return reply.status(403).send({
                    status: 'error',
                    message: 'No tienes permiso para comentar en esta publicación'
                });
            }

            // Crear el comentario
            const newComment = new CommentModel({
                publication_id,
                user_id,
                content
            });

            await newComment.save();
            reply.status(201).send({
                status: 'success',
                message: 'Comentario creado exitosamente',
                comment: newComment
            });

        } catch (error) {
            reply.status(500).send({
                status: 'error',
                message: 'Error interno del servidor, no se pudo crear el comentario',
                error: error.message
            });
        }
    
    });

    // Ruta para obtener comentarios de una publicación
    fastify.get('/:publication_id/comments', async (request, reply) => {
        const { publication_id } = request.params;
        
        try {
            // Verificar si la publicación existe
            const publication = await PublicationModel.findById(publication_id);
            if (!publication) {
                return reply.status(404).send({ 
                    status: 'error', 
                    message: 'Publicación no encontrada' 
                });
            }

            // verificar si el usuario está suscrito al artista de la publicación o es el propietario o es admin
            const isOwner = publication.user_id.toString() === request.user._id.toString();
            const isAdmin = request.user.role === 'admin';
            const isSubscribed = await SubscriptionModel.findOne({
                fan_id: request.user._id,
                artist_id: publication.user_id,
                status: 'active'
            });

            if (!isOwner && !isAdmin && !isSubscribed) {
                return reply.status(403).send({
                    status: 'error',
                    message: 'No tienes permiso para ver los comentarios de esta publicación'
                });
            }

            // Obtener los comentarios de la publicación
            const comments = await CommentModel.find({ publication_id }).populate('user_id', 'username');

            reply.status(200).send({
                status: 'success',
                comments
            });

        } catch (error) {
            reply.status(500).send({
                status: 'error',
                message: 'Error interno del servidor, no se pudieron obtener los comentarios',
                error: error.message
            });
        }
    });

    // Ruta para eliminar un comentario solo si es el autor de la publicacion o el autor del comentario o admin
    fastify.delete('/:comment_id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        const { comment_id } = request.params;
        const user_id = request.user._id;

        try {
            // Buscar el comentario
            const comment = await CommentModel.findById(comment_id);
            if (!comment) {
                return reply.status(404).send({ 
                    status: 'error', 
                    message: 'Comentario no encontrado' 
                });
            }

            // Buscar la publicación asociada al comentario
            const publication = await PublicationModel.findById(comment.publication_id);
            if (!publication) {
                return reply.status(404).send({ 
                    status: 'error', 
                    message: 'Publicación asociada al comentario no encontrada' 
                });
            }

            // Verificar si el usuario es el autor del comentario, el autor de la publicación o un administrador
            const isAuthorOfComment = comment.user_id.toString() === user_id.toString();
            const isAuthorOfPublication = publication.user_id.toString() === user_id.toString();
            const isAdmin = request.user.role === 'admin';

            if (!isAuthorOfComment && !isAuthorOfPublication && !isAdmin) {
                return reply.status(403).send({ 
                    status: 'error', 
                    message: 'No tienes permiso para eliminar este comentario' 
                });
            }

            // Eliminar el comentario
            await CommentModel.findByIdAndDelete(comment_id);
            reply.status(200).send({
                status: 'success',
                message: 'Comentario eliminado exitosamente'
            });

        } catch (error) {
            reply.status(500).send({
                status: 'error',
                message: 'Error interno del servidor, no se pudo eliminar el comentario',
                error: error.message
            });
        }
    });

}

export default Comments;