const express = require('express');
const passport = require('passport');
const router = express.Router();

// Iniciar sesión con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', failureMessage: 'Error en la autenticación' }), (req, res) => {
  console.log('Autenticación exitosa:', req.user);
  res.redirect('/profile');
});

// Cerrar sesión
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error('Error durante el logout:', err);
      return next(err);
    }
    res.redirect('/'); // Redirigir a la página de inicio después de cerrar sesión
  });
});

module.exports = router;
