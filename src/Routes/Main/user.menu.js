import UserModel from "../../Models/user.js";
import PublicationModel from "../../Models/publication.js";
import SubscriptionModel from "../../Models/subscription.js";
import CommentModel from "../../Models/comments.js";
import bcrypt from 'bcrypt';

async function userMenu(fastify, options) {

    // Endpoint para obtener el feed del usuario (publicaciones de artistas suscritos)
    fastify.get('/feed', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user._id;
            const userRole = request.user.role;

            // Configuración de paginación
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Si es admin, puede ver todas las publicaciones activas
            if (userRole === 'admin') {
                const publications = await PublicationModel.find({ status: 'active' })
                    .populate('user_id', 'username email')
                    .populate('multimedia')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);

                const total = await PublicationModel.countDocuments({ status: 'active' });

                return reply.status(200).send({
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
            }

            // Si es artista, no tiene feed
            if (userRole === 'artista') {
                return reply.status(200).send({
                    status: 'success',
                    data: {
                        publications: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 0,
                            totalResults: 0
                        }
                    },
                    message: 'Los artistas no tienen feed de publicaciones'
                });
            }

            // Si es fan, obtener publicaciones de artistas suscritos y publicaciones gratis
            const subscriptions = await SubscriptionModel.find({
                fan_id: userId,
                status: 'active'
            });

            const subscribedArtists = subscriptions.map(sub => sub.artist_id);

            const filter = {
                status: 'active',
                $or: [
                    {
                        $and: [
                            { user_id: { $in: subscribedArtists } },
                            { type: { $in: ['gratis', 'premium'] } }
                        ]
                    },
                    { type: 'gratis' }
                ]
            };

            const publications = await PublicationModel.find(filter)
                .populate('user_id', 'username email')
                .populate('multimedia')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await PublicationModel.countDocuments(filter);

            // Obtener comentarios para cada publicación
            const publicationsWithComments = await Promise.all(publications.map(async pub => {
                const comments = await CommentModel.find({ publication_id: pub._id })
                    .populate('user_id', 'username')
                    .limit(3); // Solo los últimos 3 comentarios
                return {
                    ...pub.toObject(),
                    comments
                };
            }));

            reply.status(200).send({
                status: 'success',
                data: {
                    publications: publicationsWithComments,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalResults: total
                    }
                }
            });

        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({
                status: 'error',
                message: 'Error al obtener el feed de publicaciones',
                error: error.message
            });
        }
    });

    // Endpoint para obtener artistas recomendados (solo para fans)
    fastify.get('/recommended-artists', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user._id;
            const userRole = request.user.role;

            // Configuración de paginación
            const page = parseInt(request.query.page) || 1;
            const limit = parseInt(request.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Solo fans pueden ver artistas recomendados
            if (userRole !== 'fan') {
                return reply.status(200).send({
                    status: 'success',
                    data: {
                        artists: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 0,
                            totalResults: 0
                        }
                    },
                    message: 'Solo los fans pueden ver artistas recomendados'
                });
            }

            // Obtener artistas a los que ya está suscrito
            const subscriptions = await SubscriptionModel.find({
                fan_id: userId,
                status: 'active'
            });
            const subscribedArtists = subscriptions.map(sub => sub.artist_id);

            // Obtener artistas no suscritos
            const filter = {
                _id: { $nin: subscribedArtists },
                status: 'active',
                role: 'artista'
            };

            const artists = await UserModel.find(filter)
                .select('username email firstName lastName')
                .skip(skip)
                .limit(limit);

            const total = await UserModel.countDocuments(filter);

            reply.status(200).send({
                status: 'success',
                data: {
                    artists,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalResults: total
                    }
                }
            });

        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({
                status: 'error',
                message: 'Error al obtener artistas recomendados',
                error: error.message
            });
        }
    });

    // Endpoint para obtener los datos del perfil del usuario
    fastify.get('/profile', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user._id;
            
            const user = await UserModel.findById(userId)
                .select('-password -__v'); // Excluir campos sensibles

            if (!user) {
                return reply.status(404).send({
                    status: 'error',
                    message: 'Usuario no encontrado'
                });
            }

            // Obtener suscripciones si es fan
            let subscriptions = [];
            if (request.user.role === 'fan') {
                subscriptions = await SubscriptionModel.find({ fan_id: userId, status: 'active' })
                    .populate('artist_id', 'username firstName lastName');
            }

            reply.status(200).send({
                status: 'success',
                data: {
                    user,
                    subscriptions
                }
            });

        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({
                status: 'error',
                message: 'Error al obtener el perfil del usuario',
                error: error.message
            });
        }
    });

    // Endpoint para actualizar los datos del perfil del usuario
    fastify.put('/profile', { preValidation: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user._id;
            const { firstName, lastName, email, currentPassword, newPassword } = request.body;

            const user = await UserModel.findById(userId);
            if (!user) {
                return reply.status(404).send({
                    status: 'error',
                    message: 'Usuario no encontrado'
                });
            }

            // Actualizar campos básicos
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;

            // Actualizar email si es diferente y válido
            if (email && email !== user.email) {
                const emailExists = await UserModel.findOne({ email });
                if (emailExists) {
                    return reply.status(400).send({
                        status: 'error',
                        message: 'El email ya está en uso por otro usuario'
                    });
                }
                user.email = email;
            }

            // Actualizar contraseña si se proporciona
            if (currentPassword && newPassword) {
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return reply.status(400).send({
                        status: 'error',
                        message: 'La contraseña actual es incorrecta'
                    });
                }

                // Hashear la nueva contraseña
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(newPassword, salt);
            }

            await user.save();

            reply.status(200).send({
                status: 'success',
                message: 'Perfil actualizado exitosamente',
                data: {
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        username: user.username,
                        role: user.role
                    }
                }
            });

        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({
                status: 'error',
                message: 'Error al actualizar el perfil del usuario',
                error: error.message
            });
        }
    });
}

export default userMenu;