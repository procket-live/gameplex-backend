const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    active: { type: Boolean, default: false },
    public: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'active'], default: 'draft' },
    tournament_name: String,
    logo: String,
    description: String,
    prize: [{ _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, key: String, value: mongoose.Schema.Types.Mixed }],
    tournament_meta: [{ _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, key: String, value: mongoose.Schema.Types.Mixed }],
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', require: true },
    platform: String,
    size: Number,
    registration_opening: Date,
    registration_closing: Date,
    form_message: String,
    validation_message: String,
    tnc_link: String,
    created_at: Date,
    updated_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Tournament', tournamentSchema);