const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    message: { type: mongoose.Schema.Types.String },
    image: { type: mongoose.Schema.Types.String },
    created_by: { type: mongoose.Schema.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    expires_at: { type: Date },
    active: { type: Boolean }
});

module.exports = mongoose.model('Offer', offerSchema);