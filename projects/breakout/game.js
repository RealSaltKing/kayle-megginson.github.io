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

let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
canvas.width = GWINDOW_WIDTH;
canvas.height = GWINDOW_HEIGHT;

let paddle = { x: GWINDOW_WIDTH / 2 - PADDLE_WIDTH / 2, y: PADDLE_Y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
let ball = { x: (GWINDOW_WIDTH - BALL_DIAMETER) / 2, y: (GWINDOW_HEIGHT - BALL_DIAMETER) / 2, vx: 0, vy: INITIAL_Y_VELOCITY, radius: BALL_DIAMETER / 2 };
let bricks = [];
let lives = N_BALLS;
let bricksRemaining = N_ROWS * N_COLS;
let ballMoving = false;
let gameOver = false;

// Initialize bricks
const brickColors = ["Red", "Orange", "Green", "Cyan", "Blue"];
let brickX = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
let brickY = TOP_FRACTION * GWINDOW_HEIGHT;

for (let row = 0; row < N_ROWS; row++) {
  let color = brickColors[Math.floor(row / 2)];
  for (let col = 0; col < N_COLS; col++) {
    bricks.push({ x: brickX, y: brickY, width: BRICK_WIDTH, height: BRICK_HEIGHT, color: color });
    brickX += BRICK_WIDTH + BRICK_SEP;
  }
  brickX = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2;
  brickY += BRICK_HEIGHT + BRICK_SEP;
}

// Paddle movement
document.addEventListener("mousemove", function (e) {
  if (!gameOver) {
    paddle.x = Math.max(0, Math.min(e.clientX - canvas.offsetLeft - PADDLE_WIDTH / 2, GWINDOW_WIDTH - PADDLE_WIDTH));
  }
});

// Start ball movement on click
canvas.addEventListener("click", function () {
  if (!ballMoving && !gameOver) {
    ball.vx = Math.random() * (MAX_X_VELOCITY - MIN_X_VELOCITY) + MIN_X_VELOCITY;
    if (Math.random() < 0.5) ball.vx = -ball.vx;
    ballMoving = true;
    gameLoop();
  }
});

// Ball movement logic
function moveBall() {
  if (gameOver) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Collision with walls
  if (ball.x < 0 || ball.x + BALL_DIAMETER > GWINDOW_WIDTH) ball.vx = -ball.vx;
  if (ball.y < 0) ball.vy = -ball.vy;
  if (ball.y + BALL_DIAMETER > GWINDOW_HEIGHT) {
    lives--;
    if (lives > 0) {
      ball.x = (GWINDOW_WIDTH - BALL_DIAMETER) / 2;
      ball.y = (GWINDOW_HEIGHT - BALL_DIAMETER) / 2;
      ballMoving = false;
    } else {
      gameOver = true;
      drawTitle("Game Over");
    }
  }

  // Collision with paddle
  if (ball.y + BALL_DIAMETER > paddle.y && ball.x + BALL_DIAMETER > paddle.x && ball.x < paddle.x + paddle.width) {
    ball.vy = -ball.vy;
    ball.y = paddle.y - BALL_DIAMETER;
  }

  // Collision with bricks
  for (let i = 0; i < bricks.length; i++) {
    let brick = bricks[i];
    if (ball.y < brick.y + brick.height && ball.y + BALL_DIAMETER > brick.y && ball.x < brick.x + brick.width && ball.x + BALL_DIAMETER > brick.x) {
      ball.vy = -ball.vy;
      bricks.splice(i, 1);
      bricksRemaining--;
      if (bricksRemaining === 0) {
        gameOver = true;
        drawTitle("You Win!");
      }
      break;
    }
  }
}

// Draw the game elements
function draw() {
  ctx.clearRect(0, 0, GWINDOW_WIDTH, GWINDOW_HEIGHT);

  // Draw bricks
  for (let brick of bricks) {
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }

  // Draw paddle
  ctx.fillStyle = "black";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x + ball.radius, ball.y + ball.radius, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  // Draw lives
  ctx.font = "16px Arial";
  ctx.fillText("Lives: " + lives, 10, 20);
}

// Game loop
function gameLoop() {
  moveBall();
  draw();
  if (ballMoving) requestAnimationFrame(gameLoop);
}

// Display title text
function drawTitle(title) {
  ctx.font = "36px Times New Roman";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(title, GWINDOW_WIDTH / 2, GWINDOW_HEIGHT / 2);
}

