// Breakout Game in JavaScript

document.addEventListener("DOMContentLoaded", () => {
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
    const INITIAL_Y_VELOCITY = 3.0;
    const MIN_X_VELOCITY = 1.0;
    const MAX_X_VELOCITY = 3.0;

    const BRICK_WIDTH = (GWINDOW_WIDTH - (N_COLS + 1) * BRICK_SEP) / N_COLS;
    const BRICK_HEIGHT = BRICK_WIDTH / BRICK_ASPECT_RATIO;
    const PADDLE_WIDTH = BRICK_WIDTH / BRICK_TO_PADDLE_RATIO;
    const PADDLE_HEIGHT = BRICK_HEIGHT / BRICK_TO_PADDLE_RATIO;
    const PADDLE_Y = (1 - BOTTOM_FRACTION) * GWINDOW_HEIGHT - PADDLE_HEIGHT;
    const BALL_DIAMETER = BRICK_WIDTH / BRICK_TO_BALL_RATIO + 1; // Increased hitbox by 1 unit

    const gameContainer = document.getElementById("game-container");
    gameContainer.innerHTML = ""; // Clears any existing game instances

    const canvas = document.createElement("canvas");
    canvas.width = GWINDOW_WIDTH;
    canvas.height = GWINDOW_HEIGHT;
    gameContainer.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let bricks = [];
    let ball = { x: GWINDOW_WIDTH / 2, y: GWINDOW_HEIGHT / 2, vx: 0, vy: INITIAL_Y_VELOCITY, radius: BALL_DIAMETER / 2 };
    let paddle = { x: GWINDOW_WIDTH / 2 - PADDLE_WIDTH / 2, y: PADDLE_Y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
    let lives = N_BALLS;
    let bricksRemaining = N_ROWS * N_COLS;
    let ballMoving = false;
    let gameOver = false;

    function setupBricks() {
        const colors = ["Red", "Orange", "Green", "Cyan", "Blue"];
        let y = TOP_FRACTION * GWINDOW_HEIGHT;
        for (let row = 0; row < N_ROWS; row++) {
            let color = colors[Math.floor(row / 2)];
            for (let col = 0; col < N_COLS; col++) {
                let x = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2 + col * (BRICK_WIDTH + BRICK_SEP);
                bricks.push({ x, y, width: BRICK_WIDTH, height: BRICK_HEIGHT, color });
            }
            y += BRICK_HEIGHT + BRICK_SEP;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bricks.forEach(brick => {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        });

        ctx.fillStyle = "black";
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function moveBall() {
        if (!ballMoving || gameOver) return;

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > GWINDOW_WIDTH) ball.vx *= -1;
        if (ball.y - ball.radius < 0) ball.vy *= -1;
        if (ball.y + ball.radius > GWINDOW_HEIGHT) {
            lives--;
            if (lives > 0) {
                ball.x = GWINDOW_WIDTH / 2;
                ball.y = GWINDOW_HEIGHT / 2;
                ballMoving = false;
            } else {
                gameOver = true;
                alert("Game Over");
            }
        }

        if (
            ball.x + ball.radius > paddle.x &&
            ball.x - ball.radius < paddle.x + paddle.width &&
            ball.y + ball.radius > paddle.y
        ) {
            ball.vy *= -1;
            ball.y = paddle.y - ball.radius;
        }

        bricks = bricks.filter(brick => {
            if (
                ball.x + ball.radius > brick.x &&
                ball.x - ball.radius < brick.x + brick.width &&
                ball.y - ball.radius < brick.y + brick.height &&
                ball.y + ball.radius > brick.y
            ) {
                ball.vy *= -1;
                bricksRemaining--;
                return false;
            }
            return true;
        });

        if (bricksRemaining === 0) {
            gameOver = true;
            alert("You Win!");
        }
    }

    function gameLoop() {
        moveBall();
        draw();
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener("mousemove", event => {
        let x = event.clientX - canvas.getBoundingClientRect().left - paddle.width / 2;
        paddle.x = Math.max(0, Math.min(x, GWINDOW_WIDTH - paddle.width));
    });

    document.addEventListener("click", () => {
        if (!ballMoving) {
            ballMoving = true;
            ball.vx = Math.random() * (MAX_X_VELOCITY - MIN_X_VELOCITY) + MIN_X_VELOCITY;
            if (Math.random() < 0.5) ball.vx *= -1;
        }
    });

    setupBricks();
    gameLoop();
});
