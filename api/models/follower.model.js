const mongoose = require('mongoose');

const followerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'User' },
    follower: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'User' },
    created_at: Date,
});

module.exports = mongoose.model('Follower', followerSchema);