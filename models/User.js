const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: { type: String, required: true },
  name: String,
  email: String,
}, {
  timestamps: true, // Agregar createdAt y updatedAt automáticamente
});

const User = mongoose.model('User', userSchema);
module.exports = User;
