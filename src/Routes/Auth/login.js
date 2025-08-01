import User from '../../Models/user.js';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';

async function Login(fastify, options) {

  fastify.post('/login', async (request, reply) => {
    try {
      const { identifier, password } = request.body; // se utiliza identifier para mayor flexibilidad
      
      // buscar usuario por username o email
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
      }).select('+password');

      if (!user) {
        return reply.code(401).send({
          status: 'error',
          message: 'Credenciales inválidas (usuario no encontrado)'
        });
      }

      // Comparar contraseñas con BCrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.code(401).send({
          status: 'error',
          message: 'Credenciales inválidas'
        });
      }

      const userRole = (await user.getRole())[0]// aseguramos que sea un string
      
      const token = jsonwebtoken.sign(
        { id: user._id, role: userRole },
        process.env.JSONWEBTOKEN_SECRET || 'secreto',
        { expiresIn: '6h' }
      );

      const userResponse = user.toObject();
      delete userResponse.password;

      reply.code(200).send({
        status: 'success',
        token,
        user: {
          ...userResponse,
          role: userRole
        }
      });

    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        status: 'error',
        message: error.message || 'Error al iniciar sesión'
      });
    }
  });
}

export default Login;