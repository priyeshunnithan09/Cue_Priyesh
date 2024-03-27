const socket = io();

let playerNumber;
let currentPlayer;
let cursors;
let rook;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('rook', 'assets/rook.png');
}

function create() {
    const self = this;

    socket.on('playerNumber', (number) => {
        playerNumber = number;
    });

    socket.on('gameStarted', (data) => {
        currentPlayer = data.currentPlayer;
        if (playerNumber === currentPlayer) {
            this.add.text(10, 10, 'Your turn', { font: '16px Arial', fill: '#00FF00' });
        } else {
            this.add.text(10, 10, 'Opponent\'s turn', { font: '16px Arial', fill: '#FF0000' });
        }
    });

    socket.on('startTurn', () => {
        if (playerNumber === currentPlayer) {
            this.add.text(10, 10, 'Your turn', { font: '16px Arial', fill: '#00FF00' });
        } else {
            this.add.text(10, 10, 'Opponent\'s turn', { font: '16px Arial', fill: '#FF0000' });
        }
        cursors = this.input.keyboard.createCursorKeys();
    });

    socket.on('nextTurn', (data) => {
        currentPlayer = data.currentPlayer;
        if (playerNumber === currentPlayer) {
            this.add.text(10, 10, 'Your turn', { font: '16px Arial', fill: '#00FF00' });
        } else {
            this.add.text(10, 10, 'Opponent\'s turn', { font: '16px Arial', fill: '#FF0000' });
        }
    });

    socket.on('playerMove', (data) => {
        if (data.direction === 'left') {
            rook.x -= 50;
        } else if (data.direction === 'down') {
            rook.y += 50;
        }
    });

    socket.on('gameOver', (data) => {
        if (data.winner === playerNumber) {
            this.add.text(300, 300, 'You win!', { font: '32px Arial', fill: '#00FF00' });
        } else {
            this.add.text(300, 300, 'You lose!', { font: '32px Arial', fill: '#FF0000' });
        }
    });

    socket.on('error', (errorMessage) => {
        this.add.text(300, 300, errorMessage, { font: '16px Arial', fill: '#FF0000' });
    });

    this.add.image(0, 0, 'chessboard').setOrigin(0);

    rook = this.add.sprite(100, 100, 'rook');

    this.input.keyboard.on('keydown_LEFT', () => {
        if (playerNumber === currentPlayer) {
            socket.emit('move', 'left');
        }
    });

    this.input.keyboard.on('keydown_DOWN', () => {
        if (playerNumber === currentPlayer) {
            socket.emit('move', 'down');

        }
    });
}
       
