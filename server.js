const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const morgan = require('morgan');

app.use(morgan('tiny'));
io.on('connection', socket => {
	socket.emit('hi', 'YEET');
});

const port = process.env.PORT || 3000;
http.listen(port, function() {
	console.log('Listening on %s', port);
});
