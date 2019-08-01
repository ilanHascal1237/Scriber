const express = require('express');
const app = express();
const http = require('http').Server(app);
const morgan = require('morgan');

app.use(morgan('tiny'));

// io.on('connection', async socket => {
// 	socket.emit('hi', 'YEET');

// });

const port = process.env.PORT || 3000;
http.listen(port, function() {
	console.log('Listening on %s', port);
});
