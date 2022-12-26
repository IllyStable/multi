var socket = io()

var movement = {
    W: false,
    A: false,
    S: false,
    D: false,
}

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

socket.emit('new');

setInterval(() => {
    socket.emit('movement', movement)
}, 1000 / 60)

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function(players) {
  console.log(players);
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'green';
  for (var id in players) {
    var player = players[id];
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
});