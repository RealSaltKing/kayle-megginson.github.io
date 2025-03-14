from pgl import GWindow, GOval, GRect, GLabel
import random

# Constants
GWINDOW_WIDTH = 360
GWINDOW_HEIGHT = 600
N_ROWS = 10
N_COLS = 10
BRICK_ASPECT_RATIO = 4 / 1
BRICK_TO_BALL_RATIO = 3 / 1
BRICK_TO_PADDLE_RATIO = 2 / 3
BRICK_SEP = 2
TOP_FRACTION = 0.1
BOTTOM_FRACTION = 0.05
N_BALLS = 3
TIME_STEP = 10
INITIAL_Y_VELOCITY = 3.0
MIN_X_VELOCITY = 1.0
MAX_X_VELOCITY = 3.0

# Derived Constants
BRICK_WIDTH = (GWINDOW_WIDTH - (N_COLS + 1) * BRICK_SEP) / N_COLS
BRICK_HEIGHT = BRICK_WIDTH / BRICK_ASPECT_RATIO
PADDLE_WIDTH = BRICK_WIDTH / BRICK_TO_PADDLE_RATIO
PADDLE_HEIGHT = BRICK_HEIGHT / BRICK_TO_PADDLE_RATIO
PADDLE_Y = (1 - BOTTOM_FRACTION) * GWINDOW_HEIGHT - PADDLE_HEIGHT
BALL_DIAMETER = BRICK_WIDTH / BRICK_TO_BALL_RATIO

def breakout():
    """The main program for the Breakout game."""
    gw = GWindow(GWINDOW_WIDTH, GWINDOW_HEIGHT)

    # Sets up the colored bricks
    brick_colors = ["Red", "Orange", "Green", "Cyan", "Blue"]
    brick_x = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2
    brick_y = TOP_FRACTION * GWINDOW_HEIGHT

    for row in range(N_ROWS):
        color = brick_colors[row // 2]
        for col in range(N_COLS):
            brick = GRect(BRICK_WIDTH, BRICK_HEIGHT)
            brick.set_filled(True)
            brick.set_color(color)
            gw.add(brick, brick_x, brick_y)
            brick_x += BRICK_WIDTH + BRICK_SEP
        brick_x = (GWINDOW_WIDTH - N_COLS * (BRICK_WIDTH + BRICK_SEP)) / 2
        brick_y += BRICK_HEIGHT + BRICK_SEP

    # Stores lives and bricks_remaining as global variables
    lives = N_BALLS
    bricks_remaining = N_ROWS * N_COLS

    def move_paddle(event):
        x = event.get_x() - paddle.get_width() / 2
        y = paddle.get_location().get_y()

        # Ensure the paddle stays within the screen boundaries
        x = max(0, min(x, gw.get_width() - paddle.get_width()))

        paddle.set_location(x, y)

    # Set up for the paddle and movement of paddle
    paddle = GRect(PADDLE_WIDTH, PADDLE_HEIGHT)
    paddle.set_filled(True)
    paddle.set_color("Black")
    gw.add(paddle, GWINDOW_WIDTH / 2 - PADDLE_WIDTH / 2, PADDLE_Y)

    gw.add_event_listener("mousemove", move_paddle)

    # Create the ball and set up the initial position of ball
    ball = GOval(BALL_DIAMETER, BALL_DIAMETER)
    ball.set_filled(True)
    ball.set_color("Black")
    gw.add(ball, (GWINDOW_WIDTH - BALL_DIAMETER) / 2, (GWINDOW_HEIGHT - BALL_DIAMETER) / 2)

    # Set up ball Velocity
    gw.vx = random.uniform(MIN_X_VELOCITY, MAX_X_VELOCITY)
    if random.uniform(0, 1) < 0.5:
        gw.vx = -gw.vx
    gw.vy = INITIAL_Y_VELOCITY


    # Add a variable to track if the ball is moving
    ball_moving = False

    def mouse_click(event):
        nonlocal ball_moving
        if not ball_moving:
            # Change vy to be positive so the ball moves downward
            gw.vy = abs(gw.vy)
            gw.set_interval(move_ball, TIME_STEP)
            ball_moving = True

    gw.add_event_listener("click", mouse_click)

    game_over = False

    def move_ball():
        nonlocal ball_moving
        nonlocal game_over

        if game_over:
            # Return early if the game is over
            return

        if ball_moving:
            nonlocal lives, bricks_remaining
            ball.move(gw.vx, gw.vy)

        # Check for collisions with the window boundaries
        if ball.get_x() < 0 or ball.get_x() + BALL_DIAMETER > GWINDOW_WIDTH:
            gw.vx = -gw.vx  # Bounce off left or right wall
        if ball.get_y() < 0:
            gw.vy = -gw.vy  # Bounce off top wall
        elif ball.get_y() + BALL_DIAMETER > GWINDOW_HEIGHT:
            # Ball hits the bottom wall
            lives -= 1
            if lives > 0:
                # Respawn the ball
                ball.set_location((GWINDOW_WIDTH - BALL_DIAMETER) / 2, (GWINDOW_HEIGHT - BALL_DIAMETER) / 2)
                # Wait for a click to start
                ball_moving = False
            else:
                # Game over
                draw_title(gw, "Game Over")
                game_over = True

        # Check for collisions with other objects
        collider = get_colliding_object(ball, gw)

        if collider == paddle:
            # Bounce off the paddle
            gw.vy = -gw.vy
            # Make sure the ball is above the paddle to prevent clipping
            ball.set_location(ball.get_x(), paddle.get_y() - BALL_DIAMETER)
        elif collider is not None:
            # Bounce off a brick
            gw.vy = -gw.vy 
            gw.remove(collider)
              # Remove the brick
            bricks_remaining -= 1

        # Check for winning condition (no bricks left)
        if bricks_remaining == 0:
            draw_title(gw, "You Win!")
            game_over = True

        # Add a condition to stop the game when all lives are lost
        if lives == 0:
            draw_title(gw, "Game Over")
            game_over = True

def get_colliding_object(ball, gw):
    # Coordinates of the four corners of the ball
    x1 = ball.get_x()
    y1 = ball.get_y()
    x2 = x1 + BALL_DIAMETER
    y2 = y1
    x3 = x1
    y3 = y1 + BALL_DIAMETER
    x4 = x2
    y4 = y3

    # Check for collisions with each corner
    for x, y in [(x1, y1), (x2, y2), (x3, y3), (x4, y4)]:
        colliding_obj = gw.get_element_at(x, y)
        if colliding_obj is not None:
            # Return the colliding object
            return colliding_obj 
        
    # No collision detected
    return None 

def draw_title(gw, title_text):
    title_label = GLabel(title_text)
    title_label.setFont("italic bold 36px 'times new roman'")
    title_label.setColor("black")
    title_label.setLocation((GWINDOW_WIDTH - title_label.getWidth()) / 2, GWINDOW_HEIGHT / 2 + title_label.getAscent())
    gw.add(title_label)

# Startup code
if __name__ == "__main__":
    breakout()