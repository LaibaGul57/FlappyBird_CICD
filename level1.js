
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bird = {
    x: 150,
    y: canvas.height / 2,
    radius: 15,
    gravity: 0.4,
    velocity: 0,
    lift: -10
};

const pipes = [];
const pipeGap = 300;
const pipeWidth = 100;
let score = 0;
let isGameOver = false;
let isGameWin = false;
let attempts = 0;
const maxAttempts = 2;

let showStartMessages = true;
let gameStarted = false;

// Load images
const birdImg = new Image();
birdImg.src = 'assets/bird.png';

const pipeImg = new Image();
pipeImg.src = 'assets/pipe.png';

const starImg = new Image();
starImg.src = 'assets/star.png';

const backgroundImg = new Image();
backgroundImg.src = 'assets/back.png';

// Load audio files
let backgroundMusic = new Audio('assets/background.mp3');
backgroundMusic.loop = true;
let jumpSound = new Audio('assets/jump.mp3');

// Start/Stop background music
function startBackgroundMusic() {
    backgroundMusic.play();
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

// Draw functions
function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
    ctx.drawImage(birdImg, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);
}

function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        ctx.drawImage(pipeImg, pipes[i].x, 0, pipeWidth, pipes[i].topHeight);
        ctx.drawImage(pipeImg, pipes[i].x, pipes[i].topHeight + pipeGap, pipeWidth, canvas.height - pipes[i].topHeight - pipeGap);

        if (!pipes[i].starCollected) {
            ctx.drawImage(starImg, pipes[i].x + pipeWidth / 2 - 15, pipes[i].topHeight + pipeGap / 2 - 15, 30, 30);
        }
    }
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.radius > canvas.height) {
        gameOver();
    }

    if (bird.y - bird.radius < 0) {
        bird.y = bird.radius;
        bird.velocity = 0;
    }
}

function updatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 400) {
        const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            passed: false,
            starCollected: false
        });
    }

    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= 2;

        if (
            bird.x + bird.radius > pipes[i].x &&
            bird.x - bird.radius < pipes[i].x + pipeWidth &&
            (bird.y - bird.radius < pipes[i].topHeight || bird.y + bird.radius > pipes[i].topHeight + pipeGap)
        ) {
            gameOver();
        }

        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x - bird.radius) {
            score++;
            pipes[i].passed = true;
        }

        if (!pipes[i].starCollected &&
            bird.x + bird.radius > pipes[i].x + pipeWidth / 2 - 15 &&
            bird.x - bird.radius < pipes[i].x + pipeWidth / 2 + 15 &&
            bird.y + bird.radius > pipes[i].topHeight + pipeGap / 2 - 15 &&
            bird.y - bird.radius < pipes[i].topHeight + pipeGap / 2 + 15
        ) {
            pipes[i].starCollected = true;
            score += 2;
        }
    }

    if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
    }

    if (score >= 20 && !isGameWin && !isGameOver) {
        gameWin();
    }
}

function drawScore() {
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Score: ' + score, canvas.width / 2, 130);
}

function drawStartOrGameOverMessages() {
    ctx.fillStyle = 'rgba(0,128,0,0.7)';
    ctx.fillRect(canvas.width / 2 - 200, canvas.height / 2 - 100, 400, 200);
    ctx.font = '40px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    if (showStartMessages) {
        ctx.fillText('Level 01', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '30px Arial';
        ctx.fillText('Press Space to Start', canvas.width / 2, canvas.height / 2 + 40);
    } else if (isGameOver) {
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    } else if (isGameWin) {
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
        ctx.font = '28px Arial';
        ctx.fillText('Returning to Levels...', canvas.width / 2, canvas.height / 2 + 50);
    }
}

function gameOver() {
    isGameOver = true;
    stopBackgroundMusic();

    attempts++;
    if (attempts >= maxAttempts) {
        setTimeout(() => {
            window.location.href = 'levels.html';
        }, 2000);
    }
}

function gameWin() {
    isGameWin = true;
    stopBackgroundMusic();
    setTimeout(() => {
        window.location.href = 'levels.html';
    }, 2000);
}

function restartGame() {
    pipes.length = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    score = 0;
    isGameOver = false;
    isGameWin = false;
    gameStarted = false;
    showStartMessages = true;
    startBackgroundMusic();
}

function birdJump() {
    jumpSound.play();
    bird.velocity = bird.lift;
}

function gameLoop() {
    drawBackground();
    drawPipes();
    drawBird();
    drawScore();

    if (showStartMessages || isGameOver || isGameWin) {
        drawStartOrGameOverMessages();
    } else {
        updateBird();
        updatePipes();
    }

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function (e) {
    if (e.key === ' ' && showStartMessages) {
        showStartMessages = false;
        gameStarted = true;
        startBackgroundMusic();
    } else if (e.key === ' ' && gameStarted && !isGameOver && !isGameWin) {
        birdJump();
    } else if (e.key === ' ' && isGameOver && attempts < maxAttempts) {
        restartGame();
    }
});

backgroundImg.onload = function () {
    gameLoop();
};
