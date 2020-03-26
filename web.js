String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./app');

const port = process.env.PORT || 3001;
const server = http.createServer(app);
server.listen(port);

const io = require("socket.io")(server)
const ChatRoomUtils = require('./utils/chat-room.utils');


io.on("connection", (socket) => {
    console.log("A user is connected to socket");

    socket.on('join', async ({ token, roomId }, callback) => {
        let userData;
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
        console.log("user had left");
    })

    socket.on('sendMessage', async ({ token, roomId, message }, callback) => {
        let userData;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userData = decoded;
        } catch (error) {
            callback(error);
        }
        console.log('server messagemessage', message)
        const response = await ChatRoomUtils.sendMessage(roomId, userData.userId, message);
        if (response && typeof response == 'object') {
            console.log('messaage response', response);
            io.to(roomId).emit('message', response);
        }

        callback();
    });
})

io.on("connect", () => {
    console.log("A user is connected to socket");
})