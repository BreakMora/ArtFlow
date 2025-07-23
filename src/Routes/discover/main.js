import ContentModel from '../../Models/content.js';
import ImageModel from '../../Models/images.js';

async function Main(fastify, options) {

    fastify.get('/main', async (request, reply) => {
        try {
            const [content, menuImages] = await Promise.all([
                ContentModel.find({ isActive: true }),
                ImageModel.findByGroup('main_menu')
            ]);

            return {
                status: 'success',
                data: {
                    content,
                    menuImages
                },
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({
                status: 'error',
                message: 'Error al obtener datos principales'
            });
        }
    });

    fastify.get('/main/text-content', async (request, reply) => {
        const content = await ContentModel.find({ isActive: true });
        return {
            data: content,
            status: 'success'
        }
    });

    fastify.get('/main/images-content', async (request, reply) => {
        try {
            const menuImages = await ImageModel.findByGroup('main_menu');

            return {
                status: 'success',
                data: menuImages,
                count: menuImages.length,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({
                status: 'error',
                message: 'Error al obtener imágenes del menú'
            });
        }
    });


}

export default Main;