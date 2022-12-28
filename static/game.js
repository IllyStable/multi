var socket = io()

var movement = {
    W: false,
    A: false,
    S: false,
    D: false,
    direction: 90
}

var hit = false

document.addEventListener('keydown', (event) => {
    switch (event.key.toUpperCase()) {
        case 'W':
            movement.W = true
            break;
        case 'A':
            movement.A = true
            break;
        case 'S':
            movement.S = true
            break;
        case 'D':
            movement.D = true
            break;
    }
})

document.addEventListener('mousedown', () => {
    movement.Fire = true
})

document.addEventListener('keyup', (event) => {
    switch (event.key.toUpperCase()) {
        case 'W':
            movement.W = false
            break;
        case 'A':
            movement.A = false
            break;
        case 'S':
            movement.S = false
            break;
        case 'D':
            movement.D = false
            break;
    }
})

document.addEventListener('mousemove', (event) => {
    movement.direction = Math.atan2( event.pageY - localPlayer.y, event.pageX - localPlayer.x );
})

document.addEventListener('onbeforeunload', (event) => {
    io.emit('close')
});

socket.emit('new');

setInterval(() => {
    socket.emit('movement', movement)
    movement.Fire = false
}, 1000 / 60)

let localPlayer;

var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext('2d');
socket.on('state', function(players) {
  console.log(players);
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.fillStyle = 'green';
  for (var id in players) {
    var player = players[id];
    context.beginPath();

    if (player.speed == 1) context.fillStyle="red"
    else context.fillStyle="green";

    context.translate(player.x, player.y)
    context.rotate(player.direction)
    context.fillRect(20, -5, 30, 10);
    context.rotate(-player.direction)
    context.translate(-player.x, -player.y)

    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
    if (id == socket.id) {
        localPlayer = player;
    }
  }
});
socket.on('entities', function(entities) {
    console.log(entities);
    for (var id in entities) {
        var entity = entities[id];
        context.beginPath();
        
        context.fillStyle="green"

        context.translate(entity.x, entity.y)
        context.rotate(entity.direction)
        context.fillRect(20, -5, 5, 5);
        context.rotate(-entity.direction)
        context.translate(-entity.x, -entity.y)

        if (!(entity.x - 5 >= localPlayer.x + 10 || entity.y - 5 >= localPlayer.y + 10 || entity.x + 5 <= localPlayer.x - 5 || entity.y + 5 <= localPlayer.y - 10)) {
            hit = true;
            socket.emit('hit');
        } else {
            hit = false;
        }
    }
})