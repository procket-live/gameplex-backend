const mongoose = require('mongoose');

const notificationScheme = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    message: { type: String },
    created_by: { type: mongoose.Schema.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationScheme);