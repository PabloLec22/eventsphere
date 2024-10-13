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
      return done(null, user); // Si el usuario existe, lo retornamos
    } else {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      });

      await user.save();
      return done(null, user); // Retornar el nuevo usuario
    }
  } catch (err) {
    return done(err); // Manejo de errores
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializando usuario:', user.id); // Verificar que se está serializando correctamente
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('Usuario no encontrado en la base de datos'), null);
    }
    console.log('Usuario deserializado:', user); // Asegúrate de que el usuario es correcto
    done(null, user);
  } catch (err) {
    console.error('Error durante la deserialización del usuario:', err);
    done(err, null);
  }
});



