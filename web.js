String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./app');
const Notify = require('./api/controllers/notify.controller');

const port = process.env.PORT || 3001;
const server = http.createServer(app);
server.listen(port);

const io = require("socket.io")(server)
const ChatRoomUtils = require('./utils/chat-room.utils');

let globalSocket;

const onlineUsers = {};
const clients = {}

io.on("connection", (socket) => {
    globalSocket = socket;
    socket.join("online_list");

    socket.on('online', ({ userId }) => {
        onlineUsers[userId] = true;
        socket.userId = userId;
        clients[socket.id] = userId;
        console.log('user_online', socket.id, userId, clients)
        io.emit('online_user_list', onlineUsers);
    });

    socket.on('offline', ({ userId }) => {
        delete onlineUsers[userId];
        console.log('offline');
        io.emit('online_user_list', onlineUsers);
    });

    socket.on('join', async ({ token, roomId }, callback) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userData = decoded;
        } catch (error) {
            callback(error);
        }
        socket.join(roomId);

        const roomData = await ChatRoomUtils.getRoomData(roomId);
        io.to(roomId).emit('roomData', roomData);

        callback();
    });


    socket.on('disconnect', () => {
        const userId = clients[socket.id];
        console.log('user disconnected', socket.id, userId)
        delete onlineUsers[userId];
        console.log('user list', onlineUsers);
        io.emit('online_user_list', onlineUsers);
    })

    socket.on('sendMessage', async ({ token, roomId, message, image }, callback) => {
        let userData;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userData = decoded;
        } catch (error) {
            callback(error);
        }

        const response = await ChatRoomUtils.sendMessage(roomId, userData.userId, message, image);
        if (response && typeof response == 'object') {
            io.in(roomId).emit('message', response);
            try {
                Notify.notify_chat_room(roomId, userData.userId, message);
            } catch (er) {
                callback(er);
            }
        }

        callback();
    });
})

io.on("connect", () => {
    console.log("A user is connected to socket");
})

exports.globalSocket = globalSocket;
exports.globalIo = io;