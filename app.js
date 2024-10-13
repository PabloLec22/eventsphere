require('dotenv').config(); // Cargar las variables de entorno al inicio

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const helmet = require('helmet'); // Añadimos helmet para mejorar la seguridad
const morgan = require('morgan'); // Añadimos morgan para el registro de solicitudes
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts'); // Importar express-ejs-layouts

const passportConfig = require('./config/passportConfig');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express(); // Inicializar la aplicación Express

// Middleware para pasar `user` a todas las vistas
app.use((req, res, next) => {
  res.locals.user = req.user; // req.user es proporcionado por Passport
  next();
});

// Usar express-ejs-layouts
app.use(expressLayouts);

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('layout', 'layout'); // Usar el archivo layout.ejs como plantilla

// Seguridad: Configurar Helmet con más opciones
app.use(helmet({
  contentSecurityPolicy: false, // Puedes configurar un CSP más detallado si es necesario
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' }
}));

// Registro de solicitudes con Morgan
app.use(morgan('dev'));

// Configurar body-parser para manejar datos POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-para-sesiones',
  resave: false, // Mejor práctica: false, no resave innecesariamente
  saveUninitialized: false, // No crear sesiones vacías
  cookie: {
    httpOnly: true, // Asegura que la cookie solo sea accesible a través de HTTP(S)
    secure: process.env.NODE_ENV === 'production', // Usar secure solo en producción
    maxAge: 1000 * 60 * 60 * 24, // La cookie expira después de 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conectar a MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
  }
})();

// Ruta de inicio
app.get('/', (req, res) => {
  res.render('index', { title: 'Inicio - EventSphere' });
});

// Usar las rutas de autenticación
app.use('/auth', authRoutes);

// Usar las rutas de eventos
app.use('/events', eventRoutes);

// Ruta del perfil de usuario
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('profile', { title: 'Perfil - EventSphere', user: req.user });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Página no encontrada - EventSphere' });
});

// Manejo de errores del servidor (500)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Error del servidor - EventSphere' });
});

// Escuchar en el puerto configurado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
