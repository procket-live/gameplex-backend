const mongoose = require('mongoose');

const chatRoomSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    messages: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            media: [String],
            created_at: { type: Date, default: Date.now }
        }
    ],
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);