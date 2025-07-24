import User from "../../Models/user.js";
import UserRole from "../../Models/userRole.js";
import Role from "../../Models/role.js";
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
                birthDate,
                role 
            } = request.body;

            // Obtener roles permitidos en la base de datos
            const validRRoles = Role.schema.path('name').enumValues;
            if (!validRRoles.includes(role)) {
                return reply.code(400).send({
                    status: 'error',
                    message: `Rol no permitido. Roles válidos: ${validRRoles.join(', ')}`
                });
            }

            // Validar que el rol exista
            const roleExists = await Role.findOne({ name: role });
            if (!roleExists) {
                return reply.code(400).send({
                    status: 'error',
                    message: 'El rol especificado no existe'
                });
            }

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

            // Asignar rol al usuario
            const userRole = new UserRole({
                userId: newUser._id,
                roleId: roleExists._id
            });
            await userRole.save();

             // Prepara la respuesta
            const userResponse = newUser.toObject();
            delete userResponse.password; // borra la contraseña antes de devolversela al usuario

            // respuesta con datos del usuario guardados
            reply.code(201).send({
                status: 'success',
                message: 'Usuario registrado con exito',
                user: userResponse,
                role: roleExists.name
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