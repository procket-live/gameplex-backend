const mongoose = require('mongoose');

const badgeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    image: String,
    created_at: Date,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    points: Number
});

module.exports = mongoose.model('Badge', badgeSchema);