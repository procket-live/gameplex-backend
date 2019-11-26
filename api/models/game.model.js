const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    active: Boolean,
    name: String,
    description: String,
    thumbnail: String,
    wallpaper: String,
    platform: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
    game_meta: [{
        key: String,
        lookup_type: { type: mongoose.Schema.Types.ObjectId, ref: 'LookupType' },
        required: { type: Boolean, default: true }
    }],
    price_meta: [{ key: String, dataType: String, ref: String }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Game', gameSchema);
