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
const TIME_STEP = 10;
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

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables
let ballMoving = false;
let lives = N_BALLS;
let bricksRemaining = N_ROWS * N_COLS;
let ballX = (GWINDOW_WIDTH - BALL_DIAMETER) / 2;
let ballY = (GWINDOW_HEIGHT - BALL_DIAMETER) / 2;
let ballVX = Math.random() * (MAX_X_VELOCITY - MIN_X_VELOCITY) + MIN_X_VELOCITY;
let ballVY = INITIAL_Y_VELOCITY;
let paddleX = (GWINDOW_WIDTH - PADDLE_WIDTH) / 2;
let paddleY = PADDLE_Y;
let brickColors = ["red", "orange", "green", "cyan", "blue"];
let gameOver = false;
let bricks = [];

// Paddle Movement
document.addEventListener("mousemove", (event) => {
    paddleX = Math.max(0, Math.min(event.clientX - canvas.offsetLeft - PADDLE_WIDTH / 2, GWINDOW_WIDTH - PADDLE_WIDTH));
});

// Initialize Bricks Only Once
function initializeBricks() {
    let brickXPos = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
    let brickYPos = TOP_FRACTION * GWINDOW_HEIGHT;

    bricks = [];

    for (let row = 0; row < N_ROWS; row++) {
        let color = brickColors[Math.floor(row / 2)];
        for (let col = 0; col < N_COLS; col++) {
            bricks.push({
                x: brickXPos,
                y: brickYPos,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                color: color
            });
            brickXPos += BRICK_WIDTH + BRICK_SEP;
        }
        brickXPos = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
        brickYPos += BRICK_HEIGHT + BRICK_SEP;
    }
}

// Draw Bricks
function drawBricks() {
    for (let brick of bricks) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
}

// Draw Paddle
function drawPaddle() {
    ctx.fillStyle = "black";
    ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
}

// Draw Ball
function drawBall() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_DIAMETER / 2, 0, Math.PI * 2, false);
    ctx.fill();
}

// Check Ball Collision with Bricks
function checkBrickCollision() {
    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];

        if (
            ballX + BALL_DIAMETER > brick.x && ballX < brick.x + brick.width &&
            ballY + BALL_DIAMETER > brick.y && ballY < brick.y + brick.height
        ) {
            bricks.splice(i, 1);
            bricksRemaining -= 1;

            // Ensure ball bounces correctly when hitting bricks
            if (ballVY < 0) {
                ballVY = INITIAL_Y_VELOCITY;
            } else {
                ballVY = -INITIAL_Y_VELOCITY;
            }
            break;
        }
    }
}

// Move Ball
function moveBall() {
    if (gameOver) return;

    if (ballMoving) {
        ballX += ballVX;
        ballY += ballVY;

        if (ballX < 0 || ballX + BALL_DIAMETER > GWINDOW_WIDTH) {
            ballVX = -ballVX;
        }
        if (ballY < 0) {
            ballVY = -ballVY;
        }
        if (ballY + BALL_DIAMETER > GWINDOW_HEIGHT) {
            lives -= 1;
            if (lives > 0) {
                ballX = (GWINDOW_WIDTH - BALL_DIAMETER) / 2;
                ballY = (GWINDOW_HEIGHT - BALL_DIAMETER) / 2;
                ballVX = Math.random() * (MAX_X_VELOCITY - MIN_X_VELOCITY) + MIN_X_VELOCITY;
                ballVY = INITIAL_Y_VELOCITY;
                ballMoving = false;
            } else {
                drawMessage("Game Over!");
            }
        }

        if (bricksRemaining === 0) {
            drawMessage("You Win!");
        }

        if (ballY + BALL_DIAMETER > paddleY && ballX + BALL_DIAMETER > paddleX && ballX < paddleX + PADDLE_WIDTH) {
            ballVY = -INITIAL_Y_VELOCITY;
        }

        checkBrickCollision();
    }
}

// Game Loop
function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, GWINDOW_WIDTH, GWINDOW_HEIGHT);
        drawBricks();
        drawPaddle();
        drawBall();
        moveBall();
        requestAnimationFrame(gameLoop);
    }
}

// Start Game
function startGame() {
    if (!ballMoving && !gameOver) {
        ballMoving = true;
        gameLoop();
    }
}

// Initialize Game
initializeBricks();
drawBricks();
drawPaddle();
drawBall();

canvas.addEventListener("click", startGame);

