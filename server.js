const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const rooms = {};

app.use(express.static('public')); // Serve static files from the 'public' directory

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('getRooms', () => {
        socket.emit('rooms', Object.keys(rooms));
    });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        socket.emit('message', {
            username: 'System',
            time: new Date().toLocaleTimeString(),
            text: `Welcome to ${room}!`,
        });
    });

    socket.on('createRoom', (room) => {
        if (!rooms[room]) {
            rooms[room] = [];
            io.emit('rooms', Object.keys(rooms));
        }
    });

    socket.on('message', (data) => {
        const { room, text } = data;
        const message = {
            username: socket.id,
            time: new Date().toLocaleTimeString(),
            text,
        };
        rooms[room].push(message);
        io.to(room).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
