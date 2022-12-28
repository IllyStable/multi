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
io.eio.pingTimeout = 120000;

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
            direction: 90,
            speed: 5,
            slowcooldown: 0,
            lives: 3,
        }
    });
    socket.on('movement', (data) => {
        var player = players[socket.id] || {};
        if (data.A) player.x -= player.speed
        if (data.W) player.y -= player.speed
        if (data.D) player.x += player.speed
        if (data.S) player.y += player.speed
        if (data.Fire) bullets.push({x: player.x + Math.cos(player.direction) * 30, y: player.y + Math.sin(player.direction) * 30, direction: player.direction, time: 0})
        player.direction = data.direction
    })
    socket.on('hit', (id) => {
        var player = players[socket.id] || {};
        player.speed = 1;
        player.lives--;
        if (player.lives == 0) players[socket.id] = {
            x: 300,
            y: 300,
            direction: 90,
            speed: 5,
            slowcooldown: 0,
            lives: 3,
        }
        player.slowcooldown = 1;
        bullets.splice(id, 1)
    })
    socket.on('disconnect', () => {
        delete players[socket.id];
    })
})

setInterval(() => {
    io.sockets.emit('state', players);
    io.sockets.emit('entities', bullets);
    let newBullets = bullets
    for (id in bullets) {
        bullet = bullets[id]
        bullet.x = bullet.x += Math.cos(bullet.direction) * 10
        bullet.y = bullet.y += Math.sin(bullet.direction) * 10
        bullet.time++
        if (bullet.time > 10*(1000/60)) {
            if (bullets.length == 1) {
                newBullets = []
            } else {
                newBullets.splice(id, 1)
            }
        }
    }
    bullets = newBullets
    for (id in players) {
        player = players[id]
        if (player.slowcooldown > 0) {
            player.slowcooldown++
            if (player.slowcooldown > 10*(1000/60)) {
                player.slowcooldown = 0
                player.speed = 5
            }
        }
    }
}, 1000 / 60)