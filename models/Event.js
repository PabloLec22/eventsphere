const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'User' }, // Ref a la empresa (usuario)
}, {
  timestamps: true, // Agregar createdAt y updatedAt automáticamente
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
