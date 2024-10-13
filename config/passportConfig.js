const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Modelo de Usuario

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      console.log('Usuario encontrado:', user);
      return done(null, user); // Si el usuario existe, lo retornamos
    } else {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      });

      await user.save();
      console.log('Nuevo usuario creado:', user);
      return done(null, user); // Retornar el nuevo usuario
    }
  } catch (err) {
    console.error('Error en la estrategia de Google OAuth:', err);
    return done(err); // Manejo de errores
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializando usuario:', user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('Usuario no encontrado en la base de datos'), null);
    }
    console.log('Usuario deserializado:', user);
    done(null, user);
  } catch (err) {
    console.error('Error durante la deserialización del usuario:', err);
    done(err, null);
  }
});
