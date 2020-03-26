const mongoose = require('mongoose');
const ChatRoom = require('../api/models/chat-room.model');

exports.getRoomData = async function (roomId) {
    const result = await ChatRoom
        .findById(roomId)
        // .populate({
        //     path: 'messages',
        //     populate: {
        //         path: 'created_by',
        //         select: 
        //     }
        // })
        .populate('messages.created_by', 'name profile_image')
        .exec();
    return result;
}

exports.sendMessage = async function (roomId, userId, message) {
    try {
        const messageObject = {
            media: [],
            created_at: Date.now(),
            _id: new mongoose.Types.ObjectId(),
            text: message,
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
        console.log('errrr', err)
        return false;
    }
}