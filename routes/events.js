const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User'); // Asegúrate de tener este import

// Ruta para crear un evento (solo para empresas autenticadas)
router.post('/create', async (req, res) => {
    console.log('¿Está autenticado?', req.isAuthenticated());
    console.log('Sesión:', req.session);
    console.log('Usuario en sesión:', req.user);

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

    try {
      await newEvent.save();
      console.log('Evento creado:', newEvent);
      res.status(201).json({ message: 'Evento creado exitosamente' });
    } catch (err) {
      console.error('Error al crear el evento:', err);
      res.status(500).json({ message: 'Error al crear el evento: ' + err.message });
    }
});

// Ruta para listar todos los eventos
router.get('/list', (req, res) => {
  Event.find({})
    .sort({ date: 1 }) // Ordenar por fecha ascendente
    .then((events) => res.render('events', { title: 'Lista de Eventos - EventSphere', events }))
    .catch((err) => res.status(500).json({ message: 'Error al obtener los eventos: ' + err.message }));
});

// Ruta para mostrar el formulario de creación de eventos
router.get('/create', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/auth/google'); // Redirigir a la autenticación si no está autenticado
    }
    res.render('createEvent', { title: 'Crear Evento - EventSphere' }); // Renderizar la vista con el formulario de creación de eventos
});
  
// Ruta para mostrar el calendario con los eventos
router.get('/calendar', (req, res) => {
  Event.find({})
    .then((events) => {
      const formattedEvents = events.map(event => ({
        title: event.title,
        start: event.date, // FullCalendar usa la propiedad `start`
        description: event.description
      }));
      res.render('calendar', { title: 'Calendario de Eventos - EventSphere', events: formattedEvents });
    })
    .catch((err) => res.status(500).json({ message: 'Error al obtener los eventos: ' + err.message }));
});

// Mostrar el detalle de un evento en función de su ID
router.get('/detail/:id', (req, res) => {
  const eventId = req.params.id;

  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        return res.status(404).json({ message: 'Evento no encontrado' });
      }
      res.render('eventDetail', { title: `Detalles del Evento - ${event.title}`, event });
    })
    .catch((err) => res.status(500).json({ message: 'Error al obtener el evento: ' + err.message }));
});

module.exports = router;
