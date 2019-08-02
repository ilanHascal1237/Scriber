const express = require('express');
const app = express();
const morgan = require('morgan');
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(morgan('tiny'));

const getRoom = socket => {
	const rooms = Object.keys(socket.rooms);
	if (rooms.length > 1) {
		return rooms[0] === socket.id ? rooms[1] : rooms[0];
	} else {
		return null;
	}
};

io.on('connection', socket => {
	socket.on('makeRoom', roomId => {
		const room = io.sockets.adapter.rooms[roomId];
		if (room && room.length) {
			socket.emit('dupRoom');
		} else {
            socket.join(roomId);
		}
	});

	socket.on('joinRoom', roomId => {
		const room = io.sockets.adapter.rooms[roomId];
		if (room && room.length) {
			const prevRoom = getRoom(socket);
			if (prevRoom) {
				socket.leave(prevRoom);
			}
            socket.join(roomId);
		} else {
			socket.emit('noRoom');
		}
	});

	socket.on('newMsg', msg => {
		const currRoom = getRoom(socket);
		io.to(currRoom).emit('newMsg', msg);
    });
});

const port = process.env.PORT || 3000;
server.listen(port, function() {
	console.log('Listening on %s', port);
});
