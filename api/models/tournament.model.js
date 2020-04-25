const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', require: true },
    name: String,
    tournament_name: String,
    private: { type: Boolean, default: true },
    logo: String,
    description: String,
    prize: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        key: String,
        value: String
    }],
    tournament_meta: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        key: String,
        value: String
    }],
    rank: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        rank: Number,
        amount: Number,
        props: String
    }],
    platform: String,
    participents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participent' }],
    size: Number,
    min_size: Number,
    registration_opening: Date,
    ranking_set: { type: Boolean, default: false },
    payout_released: { type: Boolean, default: false },
    registration_closing: Date,
    tournament_start_time: Date,
    tournament_end_time: Date,
    form_message: String,
    validation_message: String,
    room_detail: {
        room_id: String,
        room_password: String
    },
    tnc_link: String,
    created_at: Date,
    updated_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deleted_at: { type: Date, default: null }
});

module.exports = mongoose.model('Tournament', tournamentSchema);