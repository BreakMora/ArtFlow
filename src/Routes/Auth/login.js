import User from '../../Models/user.js';
import jsonwebtoken from 'jsonwebtoken';

async function Login(fastify, options) {
  fastify.post('/login', async (request, reply) => {
    try {
      const { username, password } = request.body; // ← cambiamos "email" a "username"

      const user = await User.findOne({ username }).select('+password');
      if (!user) {
        return reply.code(401).send({
          status: 'error',
          message: 'Credenciales inválidas (usuario no encontrado)'
        });
      }

      //const isMatch = await user.comparePassword(password);    //simple
      const isMatch = user.password === password;
      if (!isMatch) {
        return reply.code(401).send({
          status: 'error',
          message: 'Credenciales inválidas (contraseña incorrecta)'
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

/*import User from '../../Models/user.js'
import jsonwebtoken from 'jsonwebtoken';

async function Login(fastify, options) {
    
    fastify.post('/login', async (request, reply) => {
        try {
            const { email, password } = request.body;

            // buscar el usuario por email
            const user = await User.findOne({ email }).select('+password');

            // generar token jsonwebtoken
            const token = jsonwebtoken.sign(
                {
                    id: user._id,
                    role: (await user.getRole())[0]
                },
                process.env.JSONWEBTOKEN_SECRET || 'secreto',
                { expiresIn: '6h' }
            );

            // Prepara la respuesta
            const userResponse = user.toObject();
            delete userResponse.password; // borra la contraseña antes de devolversela al usuario

            // respuesta con el token y datos del usuario
            reply.code(200).send({
                status: 'success',
                token,
                user: userResponse // datos del usuario sin la contraseña y otros campos sensibles, borrar a futuro
            });

        } catch (error) {
            fastify.log.error(error);
            reply.code(404).send({
                status: 'error',
                message: 'Error al obtener los datos solicitados'
            });
        }
    });
}

export default Login;
*/