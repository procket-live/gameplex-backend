const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
    tournament_name: String,
    logo: String,
    description: String,
    prize: [{ key: String, value: String }],
    tournament_meta: [{ key: String, value: String }],
    rank: [{ rank: Number, amount: Number, props: String }],
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', require: true },
    platform: String,
    size: Number,
    registration_opening: Date,
    registration_closing: Date,
    tournament_start_time: Date,
    form_message: String,
    validation_message: String,
    tnc_link: String,
    created_at: Date,
    updated_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Tournament', tournamentSchema);