# Imagen base de datos
FROM node:22-alpine

# Directorio de trabajo
WORKDIR /app

# Copia de los modulos y archivos de configuracion
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN corepack enable && pnpm install --frozen-lockfile

# Copiar el resto de archivos
COPY . .

# Exponer el puerto de uso de Fastify
EXPOSE 3000

# Iniciar la aplicacion
CMD ["pnpm", "dev"]