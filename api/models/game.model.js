const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    active: { type: Boolean, default: true },
    name: mongoose.Schema.Types.String,
    description: mongoose.Schema.Types.String,
    thumbnail: mongoose.Schema.Types.String,
    wallpaper: mongoose.Schema.Types.String,
    game_route: { type: String },
    platform: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
    game_meta: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        key: mongoose.Schema.Types.String,
        lookup_type: { type: mongoose.Schema.Types.ObjectId, ref: 'LookupType' },
        required: { type: Boolean, default: true }
    }],
    packageId: mongoose.Schema.Types.String,
    playstore: mongoose.Schema.Types.String,
    game_target: { type: String, enum: ['native', 'extern'], default: 'extern' },
    price_meta: [{ _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, key: mongoose.Schema.Types.String, dataType: mongoose.Schema.Types.String, ref: mongoose.Schema.Types.String }],
    instructions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstructionStep' }],
    guide: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InstructionStep' }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Game', gameSchema);
