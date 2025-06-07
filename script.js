// --- Game Configuration ---
const NUM_ROWS = 6;
const NUM_COLS = 7;
const WIN_LENGTH = 4; // Number of consecutive discs for a win

// --- Game State Variables ---
let board = []; // 2D array representing the game board (e.g., 0 for empty, 1 for Player 1, 2 for Player 2)
let currentPlayer = 1; // Start with Player 1
let gameOver = false;

// --- DOM Elements ---
const currentPlayerDisplay = document.getElementById('player-display');
const gameBoardElement = document.querySelector('.game-board'); // Assuming the HTML div with class "game-board"
const resetButton = document.getElementById('reset-button');

// --- Player Colors (for JS logic, also mirrored in CSS) ---
const playerColors = {
    1: '#FF0000', // Red
    2: '#0000FF', // Blue
    // Add more if you want more players
    // 3: '#FFFF00', // Yellow
    // 4: '#008000'  // Green
};

// --- Initialization Function ---
function initializeBoard() {
    // Reset game state
    board = Array(NUM_ROWS).fill(0).map(() => Array(NUM_COLS).fill(0));
    currentPlayer = 1;
    gameOver = false;

    // Clear previous board cells from DOM
    gameBoardElement.innerHTML = '';

    // Create and append cells to the DOM
    for (let r = 0; r < NUM_ROWS; r++) {
        for (let c = 0; c < NUM_COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r; // Store row index as data attribute
            cell.dataset.col = c; // Store column index as data attribute

            // Add a click listener to each cell (or to the column, which is often better for Connect 4)
            // For simplicity, we'll listen on the board and determine the column from event target
            // We'll add the event listener to the gameBoardElement later, as it's more efficient.

            gameBoardElement.appendChild(cell);
        }
    }

    // Update display for the initial turn
    currentPlayerDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    currentPlayerDisplay.style.color = playerColors[currentPlayer];
}

// --- Event Handlers ---

// Handles a click anywhere on the game board
function handleBoardClick(event) {
    if (gameOver) {
        return; // Do nothing if the game is over
    }

    // Determine which column was clicked
    let clickedCell = event.target;
    // Ensure we clicked on a cell, not the board background directly
    if (!clickedCell.classList.contains('cell')) {
        // If the click was on the gap or board background, try to find a parent cell
        clickedCell = clickedCell.closest('.cell');
        if (!clickedCell) return; // If no cell was clicked, exit
    }

    const clickedCol = parseInt(clickedCell.dataset.col); // Get the column index

    dropDisc(clickedCol);
}

// --- Game Logic Functions ---

function dropDisc(col) {
    // Find the lowest empty spot in the clicked column
    let rowToPlace = -1;
    for (let r = NUM_ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) { // Assuming '0' means empty
            rowToPlace = r;
            break;
        }
    }

    if (rowToPlace === -1) {
        // Column is full
        alert("Column is full! Please choose another column, Bahadur!"); // Hyderabad-themed alert
        return;
    }

    // Place the current player's disc on the logical board
    board[rowToPlace][col] = currentPlayer;

    // Update the DOM to show the disc
    // Select the specific cell element
    const cellElement = gameBoardElement.querySelector(`.cell[data-row="${rowToPlace}"][data-col="${col}"]`);
    cellElement.classList.add(`player-${currentPlayer}`); // Add the player's color class

    // Check for win or draw conditions
    if (checkWin(rowToPlace, col)) {
        currentPlayerDisplay.textContent = `Player ${currentPlayer} has achieved a glorious victory, like conquering Charminar!`;
        currentPlayerDisplay.style.color = playerColors[currentPlayer];
        gameOver = true;
    } else if (checkDraw()) {
        currentPlayerDisplay.textContent = "The game ends in a stalemate, a test of endurance worthy of Golconda Fort's walls!";
        currentPlayerDisplay.style.color = '#3CB371'; // Neutral draw color
        gameOver = true;
    } else {
        // Switch player and update display for next turn
        currentPlayer = currentPlayer === 1 ? 2 : 1; // Toggles between 1 and 2
        // If you had more players:
        // currentPlayer = (currentPlayer % playerColors.length) + 1; // Cycles through 1, 2, 3, 4

        currentPlayerDisplay.textContent =`Player ${currentPlayer}'s Turn`;
        currentPlayerDisplay.style.color = `playerColors[currentPlayer]`;
    }
}

// Helper function to check a line in a specific direction
// dr: delta row (change in row), dc: delta col (change in column)
function checkDirection(startRow, startCol, dr, dc, player) {
    let count = 0;
    for (let i = 0; i < WIN_LENGTH; i++) {
        const r = startRow + i * dr;
        const c = startCol + i * dc;

        // Check bounds and if the disc belongs to the current player
        if (r >= 0 && r < NUM_ROWS &&
            c >= 0 && c < NUM_COLS &&
            board[r][c] === player) {
            count++;
        } else {
            break; // Break if line is interrupted or out of bounds
        }
    }
    return count;
}


// Check for a win condition at the given row and column (the last dropped disc)
function checkWin(row, col) {
    const player = board[row][col]; // The player who just made the move

    // Check horizontally (from this disc, extend left and right)
    // Count right from the dropped disc
    let horizontalCount = checkDirection(row, col, 0, 1, player);
    // Count left (excluding the dropped disc itself from this count)
    horizontalCount += checkDirection(row, col, 0, -1, player) - 1; // -1 to avoid double-counting the origin disc
    if (horizontalCount >= WIN_LENGTH) return true;

    // Check vertically (only downwards for Connect 4)
    // A vertical win can only occur by stacking downwards.
    let verticalCount = checkDirection(row, col, 1, 0, player);
    if (verticalCount >= WIN_LENGTH) return true;

    // Check diagonal (top-left to bottom-right: '\' )
    // Count down-right
    let diag1Count = checkDirection(row, col, 1, 1, player);
    // Count up-left
    diag1Count += checkDirection(row, col, -1, -1, player) - 1;
    if (diag1Count >= WIN_LENGTH) return true;

    // Check diagonal (top-right to bottom-left: '/' )
    // Count down-left
    let diag2Count = checkDirection(row, col, 1, -1, player);
    // Count up-right
    diag2Count += checkDirection(row, col, -1, 1, player) - 1;
    if (diag2Count >= WIN_LENGTH) return true;

    return false; // No win found
}


// Check for a draw condition
function checkDraw() {
    // If game is already won, it's not a draw.
    if (gameOver) return false;

    // Iterate through the entire board. If any empty spot (0) is found, it's not a draw.
    for (let r = 0; r < NUM_ROWS; r++) {
        for (let c = 0; c < NUM_COLS; c++) {
            if (board[r][c] === 0) {
                return false; // Found an empty cell, so not a draw yet
            }
        }
    }
    return true; // No empty cells found, and no win occurred, so it's a draw
}

// --- Event Listeners ---

// Initialize the board when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeBoard);

// Add click listener to the entire game board for disc drops
// This is more efficient than adding to each cell
gameBoardElement.addEventListener('click', handleBoardClick);

// Add click listener for the reset button
resetButton.addEventListener('click', initializeBoard);

// Optional: Add hover effect for columns (visual feedback)
// This makes the whole column highlight when hovered over
gameBoardElement.addEventListener('mouseover', (event) => {
    if (gameOver) return;
    let target = event.target.closest('.cell');
    if (target) {
        const col = parseInt(target.dataset.col);
        for (let r = 0; r < NUM_ROWS; r++) {
            const cell = gameBoardElement.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
            if (cell) cell.classList.add('column-hover');
        }
    }
});

gameBoardElement.addEventListener('mouseout', (event) => {
    if (gameOver) return;
    let target = event.target.closest('.cell');
    if (target) {
        const col = parseInt(target.dataset.col);
        for (let r = 0; r < NUM_ROWS; r++) {
            const cell = gameBoardElement.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
            if (cell) cell.classList.remove('column-hover');
        }
    }
});