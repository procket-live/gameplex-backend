const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    active: { type: Boolean, default: true },
    name: String,
    description: String,
    thumbnail: String,
    wallpaper: String,
    platform: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
    game_meta: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        key: String,
        lookup_type: { type: mongoose.Schema.Types.ObjectId, ref: 'LookupType' },
        required: { type: Boolean, default: true }
    }],
    price_meta: [{ _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, key: String, dataType: String, ref: String }],
    instructions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstructionStep' }],
    guide: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstructionStep' }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Game', gameSchema);
