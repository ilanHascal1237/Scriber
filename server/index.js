const express = require('express');
const app = express();
const http = require('http').Server(app);
const morgan = require('morgan');
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(morgan('tiny'));

// const getRoom = socket => {
// 	const rooms = Object.keys(socket.rooms);
// 	if (rooms[0])
// };

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
			socket.join(roomId);
		} else {
			socket.emit('noRoom');
		}
	});

	// socket.on('newMsg', msg => {
	//     socket.rooms.keys()
	// });
});

const port = process.env.PORT || 3000;
http.listen(port, function() {
	console.log('Listening on %s', port);
});
