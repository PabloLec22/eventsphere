const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Ruta para crear un evento (solo para empresas autenticadas)
router.post('/create', async (req, res) => {
    console.log('¿Está autenticado?', req.isAuthenticated());
    console.log('Sesión:', req.session);
    console.log('Usuario en sesión:', req.user);
  
    // Si req.user es undefined, forzamos la asignación del usuario desde la sesión de Passport
    if (!req.user && req.session.passport && req.session.passport.user) {
      console.log('Forzando la asignación del usuario desde req.session.passport.user');
      req.user = await User.findById(req.session.passport.user);
    }
  
    if (!req.user) {
      return res.status(401).json({ message: 'Debes iniciar sesión para crear un evento' });
    }
  
    const { title, description, date, location, price } = req.body;
  
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      price,
      organizer: req.user._id, // El usuario autenticado que organiza el evento
    });
  
    newEvent.save()
      .then(() => res.status(201).json({ message: 'Evento creado exitosamente' }))
      .catch((err) => res.status(500).json({ message: 'Error al crear el evento: ' + err.message }));
  });
  
  

// Ruta para listar todos los eventos
router.get('/list', (req, res) => {
  Event.find({})
    .sort({ date: 1 }) // Ordenar por fecha ascendente (eventos más cercanos primero)
    .then((events) => res.render('events', { events }))
    .catch((err) => res.status(500).json({ message: 'Error al obtener los eventos: ' + err.message }));
});

// Ruta para mostrar el formulario de creación de eventos
router.get('/create', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/auth/google'); // Redirigir a la autenticación si no está autenticado
    }
    res.render('createEvent'); // Renderizar la vista con el formulario de creación de eventos
});
  

module.exports = router;
