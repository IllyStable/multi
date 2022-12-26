// Dependencies
const express = require('express');
const socket = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
var server = http.Server(app);
var io = socket(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
})

server.listen(5000, () => {
    console.log('Server listening on port 5000')
})

var players = {};

// Websocket handlers
io.on('connection', function(socket) {
    socket.on('new', () => {
        players[socket.id] = {
            x: 300,
            y: 300
        }
    });
    socket.on('movement', (data) => {
        var player = players[socket.id] || {};
        if (data.A) player.x -= 5
        if (data.W) player.y -= 5
        if (data.D) player.x += 5
        if (data.S) player.y += 5
    })
})

setInterval(() => {
    io.sockets.emit('state', players);
}, 1000 / 60)