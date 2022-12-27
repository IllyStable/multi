// Dependencies
const express = require('express');
const socket = require('socket.io');
const http = require('http');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
var server = http.Server(app);
var io = socket(server);

app.set('port', 5000);
app.use(compression());
app.use(helmet());
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
})

server.listen(5000, () => {
    console.log('Server listening on port 5000')
})

var players = {};
var bullets = [];

// Websocket handlers
io.on('connection', function(socket) {
    socket.on('new', () => {
        players[socket.id] = {
            x: 300,
            y: 300,
            direction: 90
        }
    });
    socket.on('movement', (data) => {
        var player = players[socket.id] || {};
        if (data.A) player.x -= 5
        if (data.W) player.y -= 5
        if (data.D) player.x += 5
        if (data.S) player.y += 5
        if (data.Fire) bullets.push({x: player.x, y: player.y, direction: player.direction})
        player.direction = data.direction
    })
    socket.on('close', () => {
        delete players[socket.id];
    })
})

setInterval(() => {
    io.sockets.emit('state', players);
    io.sockets.emit('entities', bullets);
    for (bullet in bullets) {
        bullet = bullets[bullet]
        bullet.x = bullet.x += Math.cos(bullet.direction) * 10
        bullet.y = bullet.y += Math.sin(bullet.direction) * 10
    }
}, 1000 / 60)