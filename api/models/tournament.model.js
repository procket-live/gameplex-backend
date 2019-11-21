const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    status: { type: String },
    tournament_name: String,
    tournament_complete_name: String,
    logo: String,
    description: String,
    prize: {},
    game: { ref: mongoose.Schema.Types.ObjectId, ref: 'Game', require: true },
    platform: [{ ref: mongoose.Schema.Types.ObjectId, ref: 'Platform', require: true }],
    size: Number,
    participent_type: { type: String },
    registration: {
        is_active: Boolean,
        registration_opening: Date,
        registration_closing: Date,
        form_message: String,
        validation_message: String,
        tnc_link: String
    },
    created_at: Date,
    expires_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Tournament', tournamentSchema);