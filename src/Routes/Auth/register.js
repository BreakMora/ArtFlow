import User from "../../Models/user.js";
import jsonwebtoken from "jsonwebtoken";

async function Register(fastify, options) {
    
    fastify.post('/register', async (request, reply) => {
        try {

            const {
                firstName,
                lastName,
                username,
                email,
                password,
                gender,
                birthDate
            } = request.body;

            const existUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existUser) {
                return reply.code(409).send({
                    status: 'error',
                    message: 'El email o nombre de usuario ya esta en uso'
                });
            }

            const newUser = new User({
                firstName,
                lastName,
                username,
                email,
                password,
                gender,
                birthDate: new Date(birthDate),
                status: 'active'
            });

            // Guarda datos del usuario
            await newUser.save();

             // Prepara la respuesta
            const userResponse = newUser.toObject();
            delete userResponse.password; // borra la contraseña antes de devolversela al usuario

            // respuesta con datos del usuario guardados
            reply.code(201).send({
                status: 'success',
                message: 'Usuario registrado con exito',
                user: userResponse
            });
            
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({
                status: 'error',
                message: 'Error interno del servidor al registrar el usuario'
            });
        }
    });
};

export default Register;