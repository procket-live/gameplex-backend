const mongoose = require('mongoose');

const platformSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', require: true },
    created_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    updated_at: Date
});

module.exports = mongoose.model('Platform', platformSchema);