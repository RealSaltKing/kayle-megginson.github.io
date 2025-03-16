const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
const TIME_STEP = 9;
const INITIAL_Y_VELOCITY = 3.0; // Increased velocity
const MIN_X_VELOCITY = 1.5; // Increased velocity
const MAX_X_VELOCITY = 3.0; // Increased velocity

// Derived Constants
const BRICK_WIDTH = (GWINDOW_WIDTH - (N_COLS + 1) * BRICK_SEP) / N_COLS;
const BRICK_HEIGHT = BRICK_WIDTH / BRICK_ASPECT_RATIO;
const PADDLE_WIDTH = BRICK_WIDTH / BRICK_TO_PADDLE_RATIO;
const PADDLE_HEIGHT = BRICK_HEIGHT / BRICK_TO_PADDLE_RATIO;
const PADDLE_Y = (1 - BOTTOM_FRACTION) * GWINDOW_HEIGHT - PADDLE_HEIGHT;
const BALL_DIAMETER = BRICK_WIDTH / BRICK_TO_BALL_RATIO;

let bricks = [];
let lives = N_BALLS;
let bricksRemaining = N_ROWS * N_COLS;

// Paddle
let paddle = { x: GWINDOW_WIDTH / 2 - PADDLE_WIDTH / 2, y: PADDLE_Y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };

// Ball
let ball = { x: GWINDOW_WIDTH / 2, y: GWINDOW_HEIGHT / 2, vx: Math.random() * (MAX_X_VELOCITY - MIN_X_VELOCITY) + MIN_X_VELOCITY, vy: INITIAL_Y_VELOCITY };
ball.vx *= Math.random() < 0.5 ? -1 : 1;

let ballMoving = false;
let gameOver = false;

function createBricks() {
    let colors = ["red", "orange", "green", "cyan", "blue"];
    let brickY = TOP_FRACTION * GWINDOW_HEIGHT;
    for (let row = 0; row < N_ROWS; row++) {
        let rowBricks = [];
        let color = colors[Math.floor(row / 2)];
        for (let col = 0; col < N_COLS; col++) {
            rowBricks.push({ x: col * (BRICK_WIDTH + BRICK_SEP), y: brickY, width: BRICK_WIDTH, height: BRICK_HEIGHT, color });
        }
        bricks.push(...rowBricks);
        brickY += BRICK_HEIGHT + BRICK_SEP;
    }
}
createBricks();

function drawBricks() {
    bricks.forEach(brick => {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    });
}

function drawPaddle() {
    ctx.fillStyle = "black";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_DIAMETER / 2, 0, Math.PI * 2);
    ctx.fill();
}

function moveBall() {
    if (!ballMoving || gameOver) return;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x < 0 || ball.x + BALL_DIAMETER > GWINDOW_WIDTH) ball.vx *= -1;
    if (ball.y < 0) ball.vy *= -1;
    if (ball.y + BALL_DIAMETER > GWINDOW_HEIGHT) {
        lives--;
        if (lives > 0) {
            ball.x = GWINDOW_WIDTH / 2;
            ball.y = GWINDOW_HEIGHT / 2;
            ballMoving = false;
        } else {
            drawTitle("Game Over");
            gameOver = true;
        }
    }
    checkCollisions();
}

function checkCollisions() {
    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + BALL_DIAMETER > paddle.y
    ) {
        ball.vy *= -1;
        ball.y = paddle.y - BALL_DIAMETER;
    }

    bricks = bricks.filter(brick => {
        if (
            ball.x > brick.x &&
            ball.x < brick.x + brick.width &&
            ball.y > brick.y &&
            ball.y < brick.y + brick.height
        ) {
            ball.vy *= -1;
            bricksRemaining--;
            if (bricksRemaining === 0) {
                drawTitle("You Win!");
                gameOver = true;
            }
            return false;
        }
        return true;
    });
}

function drawTitle(text) {
    ctx.fillStyle = "black";
    ctx.font = "36px Arial";
    ctx.fillText(text, GWINDOW_WIDTH / 4, GWINDOW_HEIGHT / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
}

function update() {
    moveBall();
    draw();
    requestAnimationFrame(update);
}

canvas.addEventListener("mousemove", event => {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(x, GWINDOW_WIDTH - paddle.width));
});

canvas.addEventListener("mousedown", event => {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(x, GWINDOW_WIDTH - paddle.width));
});

canvas.addEventListener("touchmove", event => {
    let rect = canvas.getBoundingClientRect();
    let touch = event.touches[0];
    let x = touch.clientX - rect.left - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(x, GWINDOW_WIDTH - paddle.width));
    event.preventDefault();
});

canvas.addEventListener("click", () => {
    if (!ballMoving) ballMoving = true;
});

update();