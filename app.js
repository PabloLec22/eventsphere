require('dotenv').config(); // Cargar las variables de entorno al inicio

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const helmet = require('helmet'); // Añadimos helmet para mejorar la seguridad
const morgan = require('morgan'); // Añadimos morgan para el registro de solicitudes
const bodyParser = require('body-parser');

const passportConfig = require('./config/passportConfig');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
// Inicializar la aplicación Express antes de usar `app.use()`
const app = express(); 

// Seguridad: Configurar Helmet
app.use(helmet());

// Registro de solicitudes con Morgan
app.use(morgan('dev'));

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs');

// Configurar body-parser para manejar datos POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-para-sesiones',
  resave: true,
  saveUninitialized: false, // Importante que esté en false para no crear sesiones vacías
  cookie: {
    httpOnly: true, // Asegura que la cookie solo sea accesible a través de HTTP(S)
    secure: false, // Esto debe ser true en producción cuando uses HTTPS
    maxAge: 1000 * 60 * 60 * 24, // La cookie expira después de 24 horas
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch((err) => {
    console.log('Error al conectar a MongoDB:', err);
  });

// Ruta de inicio
app.get('/', (req, res) => {
  res.render('index');
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
  res.render('profile', { user: req.user });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).send('Página no encontrada');
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error del servidor');
});

// Escuchar en el puerto configurado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
