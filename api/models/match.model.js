const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    active: { type: Boolean, default: true },
    name: String,
    match_type: { type: String, enum: ['1 VS 1 BATTLE'] },
    entry_fee: { type: String, require: true },
    winning_amount: { type: String, require: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Match', matchSchema);