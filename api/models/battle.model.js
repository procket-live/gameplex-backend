const mongoose = require('mongoose');

const battleSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    active: { type: Boolean, default: true },
    rank: Number,
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', require: true },
    name: String,
    completed: { type: Boolean, default: false },
    offers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer', require: true }],
    instructions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstructionStep', require: true }],
    match_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match', require: true }],
    tournament_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', require: true }],
    battle_type: { type: String, enum: ['match', 'fantasy', 'gather', 'tournament'] },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Battle', battleSchema);