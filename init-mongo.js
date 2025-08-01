// init-mongo.js
db = db.getSiblingDB('ArtFlow');

// Insertar datos
db.textcontent.insertMany([
  {
    key: "hero_title",
    value: "Tu podrias ser el proximo Paulo Cohelo",
    isActive: true
  },
  {
    key: "hero_subtitle",
    value: "No necesitas ser un genio para ser un gran artista",
    isActive: true
  }
]);

// schema para las imagenes, tengo que cambiar este hosting para las imagenes
db.imagescontent.insertMany([
  {
    key: "main_image_1",
    url: "https://drive.google.com/thumbnail?id=1Jiuf0anVc2rNSrlUUB9fZdkA3WOgGCqq&sz=w1000", 
    altText: "Imagen principal 1",
    isActive: true,
    order: 1,
    group: "main_menu"
  },
  {
    key: "main_image_2",
    url: "https://drive.google.com/thumbnail?id=1xSJoLpd_l8ekYT9xCtrShYPNE4OPc09Y&sz=w1000",
    altText: "Imagen principal hero section",
    isActive: true,
    order: 1,
    group: "main_menu"
  },
  {
    key: "main_image_3",
    url: "https://drive.google.com/thumbnail?id=1_CPnjPf7IYQpgoFCZvZQ0OCRsLd_YXe1&sz=w1000",
    altText: "Imagen principal hero section",
    isActive: true,
    order: 1,
    group: "main_menu"
  },
  {
    key: "main_image_4",
    url: "https://drive.google.com/thumbnail?id=1ufnYfrGzrgpDX_N8xlKtr6zdLV5szkBM&sz=w1000",
    altText: "Imagen principal hero section",
    isActive: true,
    order: 1,
    group: "main_menu"
  }
]);

db.roles.insertMany([
  {
    name: "admin",
    permissions: ["all"],
    description: "Administrador del sistema"
  },
  {
    name: "artista",
    permissions: ["create_content", "edit_own_content", "view_stats", "edit_own_comments"],
    description: "Artista creador de contenido"
  },
  {
    name: "fan",
    permissions: ["edit_own_comments", "view_stats"],
    description: "Afiliado que ve los publicaciones y apoya el conetnido"
  }
]);

db.users.insertMany([ 
  {
    firstName: "Admin",
    lastName: "System",
    username: "admin",
    email: "admin@artflow.com",
    password: "$2a$12$4EAn.06j4.VVCQZKqsZYkujXf84qDI.kSOYD1Sg4axtL6FvJ4zLQi", // admin123
    gender: "masculino",
    birthDate: new Date("1980-01-01"),
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "Juan",
    lastName: "Pérez",
    username: "juanperez",
    email: "juan@artflow.com",
    password: "$2a$12$C48HH/lPwiqvkz8eOiVHue5tQ3P7lgbcze5NvYSmo5cQe8Te/fk4S", // user123
    gender: "masculino",
    birthDate: new Date("1990-05-15"),
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "María",
    lastName: "García",
    username: "mariagarcia",
    email: "maria@artflow.com",
    password: "$2a$12$ZpwqirfGLOsc8zONdajmYOtTnZrdHFfxAyZXMvCiyZ/oH3QvfyHZa", // fan123
    gender: "Femenino",
    birthDate: new Date("1995-07-20"),
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "Carlos",
    lastName: "Rodríguez",
    username: "carlosartista",
    email: "carlos@artflow.com",
    password: "$2a$12$NQ6LVMl13kwW3XRn7vdpzunIbgUV.qM.aR4Dsj3jRFkbPN.g8IEoa", // artista123
    gender: "Masculino",
    birthDate: new Date("1988-03-15"),
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Asignar roles a usuarios
db.user_roles.insertMany([
  {
    userId: db.users.findOne({username: "admin"})._id,
    roleId: db.roles.findOne({name: "admin"})._id,
    assignedAt: new Date()
  },
  {
    userId: db.users.findOne({username: "juanperez"})._id,
    roleId: db.roles.findOne({name: "artista"})._id,
    assignedAt: new Date()
  },
    {
    userId: db.users.findOne({username: "mariagarcia"})._id,
    roleId: db.roles.findOne({name: "fan"})._id,
    assignedAt: new Date()
  },
  {
    userId: db.users.findOne({username: "carlosartista"})._id,
    roleId: db.roles.findOne({name: "artista"})._id,
    assignedAt: new Date()
  }
]);

// Crear suscripción del fan al artista
db.subscriptions.insertOne({
  fan_id: db.users.findOne({username: "mariagarcia"})._id,
  artist_id: db.users.findOne({username: "carlosartista"})._id,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Crear publicaciones del artista
const artistId = db.users.findOne({username: "carlosartista"})._id;
const fanId = db.users.findOne({username: "mariagarcia"})._id;

// Publicación 1
const pub1 = db.publications.insertOne({
  user_id: artistId,
  title: "Mi visita al Zoologico",
  description: "Hace poco fui al zoologico y vi unos pandas rojos. Espero que les guste.",
  category: "Fotografía",
  type: "gratis",
  likes: [fanId], // El fan le dio like
  dislikes: [],
  views: Math.floor(Math.random() * 100) + 50, // Entre 50 y 150 vistas
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Multimedia para publicación 1
db.multimedia.insertOne({
  publication_id: pub1.insertedId,
  url: "https://drive.google.com/thumbnail?id=1-NvDaC-mOJe4vGGMgGlzqbjnSCaUMooa&sz=w1000",
  title: "Foto - Panda rojo",
  format: "jpeg"
});

// Publicación 2
const pub2 = db.publications.insertOne({
  user_id: artistId,
  title: "Ganyu pintura",
  description: "Estoy trabajando en mi estilo de pintura. Aquí hay un adelanto.",
  category: "Digital",
  type: "premium",
  likes: [],
  dislikes: [fanId], // El fan le dio dislike
  views: Math.floor(Math.random() * 200) + 30, // Entre 30 y 230 vistas
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Multimedia para publicación 2
db.multimedia.insertOne({
  publication_id: pub2.insertedId,
  url: "https://drive.google.com/thumbnail?id=1xIJ4AFCC_-GgvE2JBEnh_mx1Ry6_vljs&sz=w1000",
  title: "Ganyu",
  format: "jpeg"
});

// Actualizar las publicaciones con referencias al multimedia
db.publications.updateOne(
  {_id: pub1.insertedId},
  {$set: {multimedia: [db.multimedia.findOne({publication_id: pub1.insertedId})._id]}}
);

db.publications.updateOne(
  {_id: pub2.insertedId},
  {$set: {multimedia: [db.multimedia.findOne({publication_id: pub2.insertedId})._id]}}
);

// Puedes agregar más colecciones, índices, etc.