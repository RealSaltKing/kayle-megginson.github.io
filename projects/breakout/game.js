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

const BRICK_WIDTH = (GWINDOW_WIDTH - (N_COLS + 1) * BRICK_SEP) / N_COLS;
const BRICK_HEIGHT = BRICK_WIDTH / BRICK_ASPECT_RATIO;
const PADDLE_WIDTH = BRICK_WIDTH / BRICK_TO_PADDLE_RATIO;
const PADDLE_HEIGHT = BRICK_HEIGHT / BRICK_TO_PADDLE_RATIO;
const PADDLE_Y = (1 - BOTTOM_FRACTION) * GWINDOW_HEIGHT - PADDLE_HEIGHT;
const BALL_DIAMETER = BRICK_WIDTH / BRICK_TO_BALL_RATIO;

let canvas, context, bricks = [], ball, paddle;
let lives = N_BALLS;
let bricksRemaining = N_ROWS * N_COLS;
let vx, vy;
let ballMoving = false;
let gameOver = false;

function setup() {
    canvas = document.createElement("canvas");
    canvas.width = GWINDOW_WIDTH;
    canvas.height = GWINDOW_HEIGHT;
    document.body.appendChild(canvas);
    context = canvas.getContext("2d");
    
    setupBricks();
    setupPaddle();
    setupBall();
    
    canvas.addEventListener("mousemove", movePaddle);
    canvas.addEventListener("click", startBall);
    setInterval(moveBall, TIME_STEP);
}

function setupBricks() {
    let brickColors = ["Red", "Orange", "Green", "Cyan", "Blue"];
    let brickX = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
    let brickY = TOP_FRACTION * GWINDOW_HEIGHT;
    
    for (let row = 0; row < N_ROWS; row++) {
        let color = brickColors[Math.floor(row / 2)];
        for (let col = 0; col < N_COLS; col++) {
            bricks.push({ x: brickX, y: brickY, color: color, exists: true });
            brickX += BRICK_WIDTH + BRICK_SEP;
        }
        brickX = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
        brickY += BRICK_HEIGHT + BRICK_SEP;
    }
}

function setupPaddle() {
    paddle = { x: GWINDOW_WIDTH / 2 - PADDLE_WIDTH / 2, y: PADDLE_Y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
}

function setupBall() {
    ball = { x: (GWINDOW_WIDTH - BALL_DIAMETER) / 2, y: (GWINDOW_HEIGHT - BALL_DIAMETER) / 2, diameter: BALL_DIAMETER };
    vx = (Math.random() * (MAX_X_VELOCITY - MIN_X_VELOCITY) + MIN_X_VELOCITY) * (Math.random() < 0.5 ? -1 : 1);
    vy = INITIAL_Y_VELOCITY;
}

function movePaddle(event) {
    let x = event.clientX - canvas.offsetLeft - paddle.width / 2;
    paddle.x = Math.max(0, Math.min(x, GWINDOW_WIDTH - paddle.width));
}

function startBall() {
    if (!ballMoving) {
        vy = Math.abs(vy);
        ballMoving = true;
    }
}

function moveBall() {
    if (gameOver || !ballMoving) return;
    
    ball.x += vx;
    ball.y += vy;
    
    if (ball.x < 0 || ball.x + BALL_DIAMETER > GWINDOW_WIDTH) vx = -vx;
    if (ball.y < 0) vy = -vy;
    if (ball.y + BALL_DIAMETER > GWINDOW_HEIGHT) {
        lives--;
        if (lives > 0) {
            setupBall();
            ballMoving = false;
        } else {
            drawTitle("Game Over");
            gameOver = true;
        }
    }
    
    if (collisionWithPaddle()) {
        vy = -vy;
        ball.y = paddle.y - BALL_DIAMETER;
    }
    
    let collidedBrick = collisionWithBricks();
    if (collidedBrick) {
        vy = -vy;
        collidedBrick.exists = false;
        bricksRemaining--;
        if (bricksRemaining === 0) {
            drawTitle("You Win!");
            gameOver = true;
        }
    }
    
    draw();
}

function collisionWithPaddle() {
    return ball.x + BALL_DIAMETER > paddle.x && ball.x < paddle.x + paddle.width &&
           ball.y + BALL_DIAMETER > paddle.y && ball.y < paddle.y + paddle.height;
}

function collisionWithBricks() {
    for (let brick of bricks) {
        if (brick.exists && ball.x + BALL_DIAMETER > brick.x && ball.x < brick.x + BRICK_WIDTH &&
            ball.y + BALL_DIAMETER > brick.y && ball.y < brick.y + BRICK_HEIGHT) {
            return brick;
        }
    }
    return null;
}

function draw() {
    context.clearRect(0, 0, GWINDOW_WIDTH, GWINDOW_HEIGHT);
    
    for (let brick of bricks) {
        if (brick.exists) {
            context.fillStyle = brick.color;
            context.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
    }
    
    context.fillStyle = "black";
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    context.beginPath();
    context.arc(ball.x + BALL_DIAMETER / 2, ball.y + BALL_DIAMETER / 2, BALL_DIAMETER / 2, 0, Math.PI * 2);
    context.fill();
}

function drawTitle(text) {
    context.fillStyle = "black";
    context.font = "italic bold 36px Times New Roman";
    let textWidth = context.measureText(text).width;
    context.fillText(text, (GWINDOW_WIDTH - textWidth) / 2, GWINDOW_HEIGHT / 2);
}

setup();
