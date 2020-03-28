const mongoose = require('mongoose');
const ChatRoom = require('../api/models/chat-room.model');

exports.getRoomData = async function (roomId) {
    const result = await ChatRoom
        .findById(roomId)
        .populate('messages.created_by', 'name profile_image')
        .exec();
    return result;
}

exports.sendMessage = async function (roomId, userId, message, image) {
    try {
        const messageObject = {
            media: [],
            created_at: Date.now(),
            _id: new mongoose.Types.ObjectId(),
            text: message,
            image,
            created_by: {
                _id: userId
            }
        }

        ChatRoom.findByIdAndUpdate(roomId, {
            $push: {
                messages: messageObject
            }
        }).exec();
        return messageObject;
    } catch (err) {
        return false;
    }
}