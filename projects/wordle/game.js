// Wordle Game JavaScript Implementation

const N_ROWS = 6;
const N_COLS = 5;
const CORRECT_COLOR = "#66BB66";
const PRESENT_COLOR = "#CCBB66";
const MISSING_COLOR = "#999999";
const UNKNOWN_COLOR = "#FFFFFF";
const BOARD_WIDTH = 500;
const BOARD_HEIGHT = 700;
const SQUARE_SIZE = 60;
const SQUARE_SEP = 5;
const KEY_WIDTH = 40;
const KEY_HEIGHT = 60;
const KEY_XSEP = 5;
const KEY_YSEP = 7;

// Word List (Simplified for demonstration, you can replace this with your own list)
const ENGLISH_WORDS = ["apple", "grape", "peach", "lemon", "mango"]; // Add more words here

// Initialize the Game
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = BOARD_WIDTH;
canvas.height = BOARD_HEIGHT;

// Helper Functions
function drawGrid(colors = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous board

    for (let row = 0; row < N_ROWS; row++) {
        for (let col = 0; col < N_COLS; col++) {
            const x = col * (SQUARE_SIZE + SQUARE_SEP);
            const y = row * (SQUARE_SIZE + SQUARE_SEP);
            const color = (colors[row] && colors[row][col]) || UNKNOWN_COLOR;

            ctx.fillStyle = color;
            ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
            ctx.strokeStyle = "black";
            ctx.strokeRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
}

function drawKeyboard() {
    const keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE"]
    ];

    const keyboardDiv = document.getElementById("keyboard");
    keyboardDiv.innerHTML = "";
    keyboard.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        row.forEach(key => {
            const keyBtn = document.createElement("button");
            keyBtn.textContent = key;
            keyBtn.style.width = `${KEY_WIDTH}px`;
            keyBtn.style.height = `${KEY_HEIGHT}px`;
            keyBtn.style.margin = `${KEY_YSEP}px ${KEY_XSEP}px`;
            keyBtn.onclick = () => handleKeyPress(key);
            rowDiv.appendChild(keyBtn);
        });
        keyboardDiv.appendChild(rowDiv);
    });
}

function getRandomWord() {
    return ENGLISH_WORDS[Math.floor(Math.random() * ENGLISH_WORDS.length)];
}

function checkWord(typedWord, correctWord) {
    let result = [];
    for (let i = 0; i < typedWord.length; i++) {
        if (typedWord[i] === correctWord[i]) {
            result.push(CORRECT_COLOR);
        } else if (correctWord.includes(typedWord[i])) {
            result.push(PRESENT_COLOR);
        } else {
            result.push(MISSING_COLOR);
        }
    }
    return result;
}

// Game Logic
let currentRow = 0;
let currentCol = 0;
let selectedWord = getRandomWord().toLowerCase();
let typedWord = "";

function handleKeyPress(key) {
    if (key === "ENTER") {
        if (typedWord.length === 5 && ENGLISH_WORDS.includes(typedWord)) {
            const colors = checkWord(typedWord, selectedWord);
            guessHistory[currentRow] = colors;
            drawGrid(guessHistory); // Update the board

            if (typedWord === selectedWord) {
                setTimeout(() => alert("Congratulations! You guessed the word!"), 200);
            } else {
                typedWord = "";
                currentRow++;
                currentCol = 0;
                if (currentRow >= N_ROWS) {
                    setTimeout(() => alert(`Game Over! The word was ${selectedWord}`), 200);
                }
            }
        } else {
            alert("Invalid word. Try again!");
        }
    } else if (key === "DELETE") {
        typedWord = typedWord.slice(0, -1);
        drawGrid(guessHistory); // Update board when deleting
    } else if (typedWord.length < 5) {
        typedWord += key.toLowerCase();
        drawGrid(guessHistory); // Show updated board
    }
}

let guessHistory = Array.from({ length: N_ROWS }, () => Array(N_COLS).fill(UNKNOWN_COLOR));

// Initialize
drawGrid();
drawKeyboard();

