// Constants
const GWINDOW_WIDTH = 360;
const GWINDOW_HEIGHT = 600;
const N_ROWS = 10;
const N_COLS = 10;
const BRICK_ASPECT_RATIO = 4 / 1;
const BRICK_TO_BALL_RATIO = 3 / 1;
const BRICK_TO_PADDLE_RATIO = 2 / 3;
const BRICK_SEP = 2;
const TOP_FRACTION = 0.1;
const BOTTOM_FRACTION = 0.05;
const N_BALLS = 3;
const TIME_STEP = 7;
const INITIAL_Y_VELOCITY = 3.0;
const MIN_X_VELOCITY = 1.0;
const MAX_X_VELOCITY = 3.0;

// Derived Constants
const BRICK_WIDTH = (GWINDOW_WIDTH - (N_COLS + 1) * BRICK_SEP) / N_COLS;
const BRICK_HEIGHT = BRICK_WIDTH / BRICK_ASPECT_RATIO;
const PADDLE_WIDTH = BRICK_WIDTH / BRICK_TO_PADDLE_RATIO;
const PADDLE_HEIGHT = BRICK_HEIGHT / BRICK_TO_PADDLE_RATIO;
const PADDLE_Y = (1 - BOTTOM_FRACTION) * GWINDOW_HEIGHT - PADDLE_HEIGHT;
const BALL_DIAMETER = BRICK_WIDTH / BRICK_TO_BALL_RATIO;

// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let lives = N_BALLS;
let bricksRemaining = N_ROWS * N_COLS;
let ballMoving = false;
let gameOver = false;
let vx, vy;
let paddleX, paddleY;
let ballX, ballY;

// Initialize Game
function init() {
    paddleX = (GWINDOW_WIDTH - PADDLE_WIDTH) / 2;
    paddleY = PADDLE_Y;
    ballX = (GWINDOW_WIDTH - BALL_DIAMETER) / 2;
    ballY = (GWINDOW_HEIGHT - BALL_DIAMETER) / 2;
    vx = Math.random() * (MAX_X_VELOCITY - MIN_X_VELOCITY) + MIN_X_VELOCITY;
    if (Math.random() < 0.5) vx = -vx;
    vy = INITIAL_Y_VELOCITY;
    drawBricks();
    drawPaddle();
    drawBall();
}

// Draw Bricks
function drawBricks() {
    const brickColors = ["Red", "Orange", "Green", "Cyan", "Blue"];
    let brickX = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
    let brickY = TOP_FRACTION * GWINDOW_HEIGHT;

    for (let row = 0; row < N_ROWS; row++) {
        const color = brickColors[Math.floor(row / 2)];
        for (let col = 0; col < N_COLS; col++) {
            ctx.fillStyle = color;
            ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
            brickX += BRICK_WIDTH + BRICK_SEP;
        }
        brickX = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
        brickY += BRICK_HEIGHT + BRICK_SEP;
    }
}

// Draw Paddle
function drawPaddle() {
    ctx.fillStyle = "Black";
    ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
}

// Draw Ball
function drawBall() {
    ctx.fillStyle = "Black";
    ctx.beginPath();
    ctx.arc(ballX + BALL_DIAMETER / 2, ballY + BALL_DIAMETER / 2, BALL_DIAMETER / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Move Paddle
function movePaddle(event) {
    const rect = canvas.getBoundingClientRect();
    paddleX = event.clientX - rect.left - PADDLE_WIDTH / 2;
    paddleX = Math.max(0, Math.min(paddleX, GWINDOW_WIDTH - PADDLE_WIDTH));
    drawPaddle();
}

// Move Ball
function moveBall() {
    if (gameOver) return;

    if (ballMoving) {
        ballX += vx;
        ballY += vy;
    }

    // Check for collisions with the window boundaries
    if (ballX < 0 || ballX + BALL_DIAMETER > GWINDOW_WIDTH) {
        vx = -vx;
    }
    if (ballY < 0) {
        vy = -vy;
    } else if (ballY + BALL_DIAMETER > GWINDOW_HEIGHT) {
        lives--;
        if (lives > 0) {
            ballX = (GWINDOW_WIDTH - BALL_DIAMETER) / 2;
            ballY = (GWINDOW_HEIGHT - BALL_DIAMETER) / 2;
            ballMoving = false;
        } else {
            drawTitle("Game Over");
            gameOver = true;
        }
    }

    // Check for collisions with the paddle
    if (ballX + BALL_DIAMETER > paddleX && ballX < paddleX + PADDLE_WIDTH &&
        ballY + BALL_DIAMETER > paddleY && ballY < paddleY + PADDLE_HEIGHT) {
        vy = -vy;
        ballY = paddleY - BALL_DIAMETER;
    }

    // Check for collisions with bricks
    // This is a simplified collision detection for bricks
    // You may need to implement a more accurate collision detection
    // based on your specific requirements.

    // Check for winning condition
    if (bricksRemaining === 0) {
        drawTitle("You Win!");
        gameOver = true;
    }

    // Redraw the game
    ctx.clearRect(0, 0, GWINDOW_WIDTH, GWINDOW_HEIGHT);
    drawBricks();
    drawPaddle();
    drawBall();
}

// Draw Title
function drawTitle(titleText) {
    ctx.font = "italic bold 36px 'Times New Roman'";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(titleText, GWINDOW_WIDTH / 2, GWINDOW_HEIGHT / 2);
}

// Mouse Click Event
function mouseClick(event) {
    if (!ballMoving) {
        vy = Math.abs(vy);
        if (!intervalSet) {
            setInterval(moveBall, TIME_STEP);
            intervalSet = true;
        }
        ballMoving = true;
    }
}

// Event Listeners
canvas.addEventListener('mousemove', movePaddle);
canvas.addEventListener('click', mouseClick);

// Start the game
init();