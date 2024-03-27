const express = require('express');
const http = require('http://localhost:3000');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

let players = [];
let currentPlayer = 0;
let gameStarted = false;
let turnStartTime;

io.on('connection', (socket) => {
    console.log('A user connected');

    if (players.length < 2) {
        players.push(socket.id);
        socket.emit('playerNumber', players.length);
    }

    socket.on('disconnect', () => {
        console.log('User disconnected');
        players = players.filter(player => player !== socket.id);
        if (gameStarted) {
            io.emit('gameOver', { winner: players[0], reason: 'Opponent disconnected' });
            gameStarted = false;
        }
    });

    socket.on('startGame', () => {
        if (players.length === 2) {
            gameStarted = true;
            io.emit('gameStarted', { currentPlayer: currentPlayer });
            turnStartTime = new Date().getTime();
            io.to(players[currentPlayer]).emit('startTurn');
        }
    });

    socket.on('move', (direction) => {
        if (socket.id === players[currentPlayer]) {
            const currentTime = new Date().getTime();
            if (currentTime - turnStartTime <= 30000) {
                if (direction === 'left' || direction === 'down') {
                    io.emit('playerMove', { playerId: currentPlayer, direction: direction });
                    checkWinCondition();
                    nextTurn();
                } else {
                    socket.emit('error', 'Invalid move');
                }
            } else {
                io.emit('gameOver', { winner: players[currentPlayer === 0 ? 1 : 0], reason: 'Time ran out' });
                gameStarted = false;
            }
        } else {
            socket.emit('error', 'It is not your turn');
        }
    });
});

function checkWinCondition() {
    if (currentPlayer === 0) {
        io.emit('gameOver', { winner: players[currentPlayer], reason: 'Player 1 reached the bottom left corner' });
        gameStarted = false;
    } else {
        io.emit('gameOver', { winner: players[currentPlayer], reason: 'Player 2 reached the bottom left corner' });
        gameStarted = false;
    }
}

function nextTurn() {
    currentPlayer = currentPlayer === 0 ? 1 : 0;
    io.emit('nextTurn', { currentPlayer: currentPlayer });
    turnStartTime = new Date().getTime();
    io.to(players[currentPlayer]).emit('startTurn');
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
