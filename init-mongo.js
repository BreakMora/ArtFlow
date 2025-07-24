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
    password: "admin123", // "admin123" hay que hashearlo
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
    password: "user123", // "user123" hay que hashearlo
    gender: "masculino",
    birthDate: new Date("1990-05-15"),
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
  }
]);
// Puedes agregar más colecciones, índices, etc.