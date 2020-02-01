const mongoose = require('mongoose');

const organizerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
  organizer_name: { type: String },
  organizer_logo: { type: String },
  upi_address: { type: String },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  deleted_at: Date
});

module.exports = mongoose.model('Organizer', organizerSchema);