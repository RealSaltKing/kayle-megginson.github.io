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

// Word List
const ENGLISH_WORDS = ["apple", "a", "grads"];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = BOARD_WIDTH;
canvas.height = BOARD_HEIGHT;

// Game State
let currentRow = 0;
let currentCol = 0;
let selectedWord = getRandomWord().toLowerCase();
let typedWord = "";
let guessHistory = Array.from({ length: N_ROWS }, () => Array(N_COLS).fill(UNKNOWN_COLOR));
let guessLetters = Array.from({ length: N_ROWS }, () => Array(N_COLS).fill(""));
let keyColors = {}; // Track keyboard colors

// Debugging: Show selected word
console.log("Selected Word:", selectedWord);

function drawGrid(colors = [], letters = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridWidth = N_COLS * (SQUARE_SIZE + SQUARE_SEP) - SQUARE_SEP;
    const gridHeight = N_ROWS * (SQUARE_SIZE + SQUARE_SEP) - SQUARE_SEP;

    const startX = (canvas.width - gridWidth) / 2;  // Center horizontally
    const startY = 50;  // Slight offset from the top for better balance

    for (let row = 0; row < N_ROWS; row++) {
        for (let col = 0; col < N_COLS; col++) {
            const x = startX + col * (SQUARE_SIZE + SQUARE_SEP);
            const y = startY + row * (SQUARE_SIZE + SQUARE_SEP);

            const color = (colors[row] && colors[row][col]) ? colors[row][col] : UNKNOWN_COLOR;
            const letter = (letters[row] && letters[row][col]) ? letters[row][col] : "";

            ctx.fillStyle = color;
            ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
            ctx.strokeStyle = "black";
            ctx.strokeRect(x, y, SQUARE_SIZE, SQUARE_SIZE);

            ctx.fillStyle = "black";
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(letter.toUpperCase(), x + SQUARE_SIZE / 2, y + SQUARE_SIZE / 2);
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
            keyBtn.style.width = key === "ENTER" || key === "DELETE" ? `${KEY_WIDTH * 2.5}px` : `${KEY_WIDTH}px`;
            keyBtn.style.height = key === "ENTER" || key === "DELETE" ? `${KEY_HEIGHT * 1}px` : `${KEY_HEIGHT}px`;
            keyBtn.style.margin = `${KEY_YSEP}px ${KEY_XSEP}px`;
            keyBtn.style.backgroundColor = keyColors[key.toLowerCase()] || "lightgray";
            keyBtn.onclick = () => handleKeyPress(key);
            rowDiv.appendChild(keyBtn);
        });
        keyboardDiv.appendChild(rowDiv);
    });
}

function getRandomWord() {
    // Filter words to only include those with exactly 5 characters
    const fiveLetterWords = ENGLISH_WORDS.filter(word => word.length === 5);
    
    // Randomly select a word from the filtered list
    return fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
}
function checkWord(typedWord, correctWord) {
    let result = Array(5).fill(MISSING_COLOR);

    let correctLetters = correctWord.split("");
    let typedLetters = typedWord.split("");

    // Mark correct positions first
    for (let i = 0; i < 5; i++) {
        if (typedLetters[i] === correctLetters[i]) {
            result[i] = CORRECT_COLOR;
            correctLetters[i] = null; // Mark letter as used
            typedLetters[i] = null; 
        }
    }

    // Mark present letters
    for (let i = 0; i < 5; i++) {
        if (typedLetters[i] && correctLetters.includes(typedLetters[i])) {
            result[i] = PRESENT_COLOR;
            correctLetters[correctLetters.indexOf(typedLetters[i])] = null; 
        }
    }

    return result;
}

function updateKeyboardColors(typedWord, colors) {
    for (let i = 0; i < typedWord.length; i++) {
        let letter = typedWord[i].toLowerCase();

        if (colors[i] === CORRECT_COLOR) {
            keyColors[letter] = CORRECT_COLOR;
        } else if (colors[i] === PRESENT_COLOR && keyColors[letter] !== CORRECT_COLOR) {
            keyColors[letter] = PRESENT_COLOR;
        } else if (!keyColors[letter]) {
            keyColors[letter] = MISSING_COLOR;
        }
    }
}

// Handle Key Press
function handleKeyPress(key) {
    if (key === "ENTER") {
        if (typedWord.length === 5) {
            if (ENGLISH_WORDS.includes(typedWord)) {
                const colors = checkWord(typedWord, selectedWord);
                guessHistory[currentRow] = colors;
                updateKeyboardColors(typedWord, colors);
                drawGrid(guessHistory, guessLetters);
                drawKeyboard();

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
                // Handle invalid word (skip storing it in the grid)
                alert("Invalid word. Try again!");

                // Clear current row from the grid since the guess is invalid
                typedWord = "";
                guessLetters[currentRow] = Array(N_COLS).fill(""); // Clear the invalid guess
                currentCol = 0;

                drawGrid(guessHistory, guessLetters); // Redraw grid without the invalid word
                drawKeyboard();
            }
        }
    } else if (key === "DELETE") {
        if (currentCol > 0) {
            currentCol--;
            typedWord = typedWord.slice(0, -1);
            guessLetters[currentRow][currentCol] = "";
        }
        drawGrid(guessHistory, guessLetters);
    } else if (typedWord.length < 5) {
        guessLetters[currentRow][currentCol] = key.toLowerCase();
        typedWord += key.toLowerCase();
        currentCol++;
        drawGrid(guessHistory, guessLetters);
    }
}





// Initialize
drawGrid();
drawKeyboard();
