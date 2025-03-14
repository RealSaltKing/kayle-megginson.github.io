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
if (Math.random() < 0.5) ballVX = -ballVX;
let ballVY = INITIAL_Y_VELOCITY;
let paddleX = (GWINDOW_WIDTH - PADDLE_WIDTH) / 2;
let paddleY = PADDLE_Y;
let brickColors = ["red", "orange", "green", "cyan", "blue"];
let gameOver = false;
let bricks = []; // To store brick positions

// Event Listener for paddle movement
document.addEventListener("mousemove", (event) => {
    paddleX = Math.max(0, Math.min(event.clientX - canvas.offsetLeft - PADDLE_WIDTH / 2, GWINDOW_WIDTH - PADDLE_WIDTH));
});

// Draw Bricks
function drawBricks() {
    let brickXPos = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
    let brickYPos = TOP_FRACTION * GWINDOW_HEIGHT;

    bricks = []; // Reset bricks array each time we draw the bricks

    for (let row = 0; row < N_ROWS; row++) {
        let color = brickColors[Math.floor(row / 2)];
        for (let col = 0; col < N_COLS; col++) {
            ctx.fillStyle = color;
            ctx.fillRect(brickXPos, brickYPos, BRICK_WIDTH, BRICK_HEIGHT);
            bricks.push({ x: brickXPos, y: brickYPos, width: BRICK_WIDTH, height: BRICK_HEIGHT });
            brickXPos += BRICK_WIDTH + BRICK_SEP;
        }
        brickXPos = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
        brickYPos += BRICK_HEIGHT + BRICK_SEP;
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

        // Check if the ball intersects with the brick
        if (
            ballX + BALL_DIAMETER > brick.x && ballX < brick.x + brick.width &&
            ballY + BALL_DIAMETER > brick.y && ballY < brick.y + brick.height
        ) {
            // Collision detected, remove the brick from array and canvas
            bricks.splice(i, 1); // Remove the brick from the array
            bricksRemaining -= 1;

            // Clear the brick from the canvas (by overwriting with the background color)
            ctx.clearRect(brick.x, brick.y, brick.width, brick.height);

            // Reverse the ball's vertical velocity (bounce the ball)
            ballVY = -ballVY;

            // Fix the position of the ball if it went through the brick
            if (ballY + BALL_DIAMETER > brick.y && ballY < brick.y + brick.height) {
                ballY = brick.y - BALL_DIAMETER; // Set ball just above the brick
            }
            break; // Stop after the first collision
        }
    }
}

// Ball Movement Logic
function moveBall() {
    if (gameOver) return;

    if (ballMoving) {
        ballX += ballVX;
        ballY += ballVY;

        // Ball and wall collision
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
                ballMoving = false;
            } else {
                gameOver = true;
                drawTitle("Game Over!");
            }
        }

        // Paddle collision
        if (ballY + BALL_DIAMETER > paddleY && ballX + BALL_DIAMETER > paddleX && ballX < paddleX + PADDLE_WIDTH) {
            ballVY = -ballVY;
            ballY = paddleY - BALL_DIAMETER; // Make sure the ball is above the paddle to prevent clipping
        }

        // Check for brick collisions
        checkBrickCollision();

        // Win condition: if no bricks remain
        if (bricksRemaining === 0) {
            gameOver = true;
            drawTitle("You Win!");
        }
    }
}

// Draw Game Over or Win Message
function drawTitle(message) {
    ctx.fillStyle = "black";
    ctx.font = "36px Arial";
    ctx.fillText(message, GWINDOW_WIDTH / 2 - ctx.measureText(message).width / 2, GWINDOW_HEIGHT / 2);
}

// Start the game once the user clicks
canvas.addEventListener('click', () => {
    if (!ballMoving) {
        ballMoving = true;
        ballVY = Math.abs(ballVY); // Ensure the ball moves downward
        setInterval(moveBall, TIME_STEP);
    }
});

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, GWINDOW_WIDTH, GWINDOW_HEIGHT);
    drawBricks();
    drawPaddle();
    drawBall();
    moveBall();
    requestAnimationFrame(gameLoop);
}

// Start Game
function startGame() {
    if (!ballMoving) {
        ballMoving = true;
        gameLoop();
    }
}

// Reset game after game over
function resetGame() {
    bricks = []; // Reset brick array
    bricksRemaining = N_ROWS * N_COLS; // Reset remaining bricks
    lives = N_BALLS; // Reset lives
    gameOver = false;
    ballX = (GWINDOW_WIDTH - BALL_DIAMETER) / 2;
    ballY = (GWINDOW_HEIGHT - BALL_DIAMETER) / 2;
    ballVX = Math.random() * (MAX_X_VELOCITY - MIN_X_VELOCITY) + MIN_X_VELOCITY;
    if (Math.random() < 0.5) ballVX = -ballVX;
    ballVY = INITIAL_Y_VELOCITY;
    startGame();
}

// Draw initial setup (before starting the game)
drawBricks();
drawPaddle();
drawBall();

canvas.addEventListener("click", startGame); // Start game on click
