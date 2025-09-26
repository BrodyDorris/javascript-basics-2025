// --- Game State and Initialization ---
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

// Piece Unicode characters
const pieces = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

// Initial board setup
let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let turn = 'white';
let selectedSquare = null;

// --- Helper Functions ---
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'white-square' : 'black-square');
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.classList.add('piece');
                pieceElement.classList.add(isWhite(piece) ? 'white' : 'black');
                pieceElement.textContent = pieces[piece];
                square.appendChild(pieceElement);
            }
            square.addEventListener('click', handleSquareClick);
            boardElement.appendChild(square);
        }
    }
}

function updateStatus() {
    statusElement.textContent = `${turn.charAt(0).toUpperCase() + turn.slice(1)} to move`;
}

// --- User Interaction ---
function handleSquareClick(event) {
    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = board[row][col];

    if (selectedSquare) {
        // If same square is clicked, deselect
        if (selectedSquare.row === row && selectedSquare.col === col) {
            selectedSquare.element.classList.remove('selected');
            selectedSquare = null;
            return;
        }

        // Attempt a move
        const start = { row: selectedSquare.row, col: selectedSquare.col };
        const end = { row, col };
        if (isValidMove(start, end, board)) {
            makeMove(start, end);
            selectedSquare.element.classList.remove('selected');
            selectedSquare = null;
            turn = turn === 'white' ? 'black' : 'white';
            renderBoard();
            updateStatus();
            // Trigger AI move if it's black's turn
            if (turn === 'black') {
                setTimeout(makeAIMove, 500); // Delay for better UX
            }
        } else {
            // Invalid move, deselect current selection and possibly select new piece
            selectedSquare.element.classList.remove('selected');
            selectedSquare = null;
            if (piece && (isWhite(piece) && turn === 'white' || !isWhite(piece) && turn === 'black')) {
                square.classList.add('selected');
                selectedSquare = { row, col, piece, element: square };
            }
        }
    } else {
        // No piece selected, try to select one
        if (piece && (isWhite(piece) && turn === 'white' || !isWhite(piece) && turn === 'black')) {
            square.classList.add('selected');
            selectedSquare = { row, col, piece, element: square };
        }
    }
}

// --- Game Logic ---
function isWhite(piece) {
    return piece && piece === piece.toUpperCase();
}

function isValidMove(start, end, currentBoard) {
    const piece = currentBoard[start.row][start.col];
    if (!piece) return false; // No piece at start

    const startRow = start.row;
    const startCol = start.col;
    const endRow = end.row;
    const endCol = end.col;

    // Boundary check
    if (endRow < 0 || endRow > 7 || endCol < 0 || endCol > 7) return false;

    const endPiece = currentBoard[endRow][endCol];
    // Cannot capture your own piece
    if (endPiece && isWhite(piece) === isWhite(endPiece)) return false;

    // Note: This simplified logic does NOT check for moving into or out of check.
    // Implementing this correctly requires a much more complex function to:
    // 1. Temporarily make the move.
    // 2. Find the King's position.
    // 3. Check if the King's square is attacked by the opponent's pieces.
    // 4. Undo the temporary move.

    switch (piece.toLowerCase()) {
        case 'p': return validatePawnMove(start, end, currentBoard);
        case 'r': return validateRookMove(start, end, currentBoard);
        case 'n': return validateKnightMove(start, end);
        case 'b': return validateBishopMove(start, end, currentBoard);
        case 'q': return validateRookMove(start, end, currentBoard) || validateBishopMove(start, end, currentBoard);
        case 'k': return validateKingMove(start, end);
    }
    return false;
}

function validatePawnMove(start, end, currentBoard) {
    const piece = currentBoard[start.row][start.col];
    const isWhitePiece = isWhite(piece);
    const direction = isWhitePiece ? -1 : 1; // White moves up (decreasing row), Black moves down (increasing row)
    const startRow = isWhitePiece ? 6 : 1; // White starts on row 6, Black on row 1

    const dRow = end.row - start.row;
    const dCol = end.col - start.col;
    const endPiece = currentBoard[end.row][end.col];

    // Standard single-square forward move
    if (dCol === 0 && dRow === direction && !endPiece) {
        return true;
    }
    // Initial two-square forward move
    if (dCol === 0 && dRow === 2 * direction && start.row === startRow && !endPiece && !currentBoard[start.row + direction][start.col]) {
        return true;
    }
    // Captures
    if (Math.abs(dCol) === 1 && dRow === direction && endPiece && isWhite(piece) !== isWhite(endPiece)) {
        return true;
    }
    // Note: En passant logic is not implemented here for brevity.
    return false;
}

function validateRookMove(start, end, currentBoard) {
    // Must move either horizontally or vertically
    if (start.row !== end.row && start.col !== end.col) return false;

    // Check for obstacles
    if (start.row === end.row) { // Horizontal move
        const step = Math.sign(end.col - start.col);
        for (let col = start.col + step; col !== end.col; col += step) {
            if (currentBoard[start.row][col]) return false; // Obstacle found
        }
    } else { // Vertical move
        const step = Math.sign(end.row - start.row);
        for (let row = start.row + step; row !== end.row; row += step) {
            if (currentBoard[row][start.col]) return false; // Obstacle found
        }
    }
    return true;
}

function validateKnightMove(start, end) {
    const dRow = Math.abs(end.row - start.row);
    const dCol = Math.abs(end.col - start.col);
    // Knight moves in an L-shape: 2 squares in one direction, 1 square perpendicular
    return (dRow === 2 && dCol === 1) || (dRow === 1 && dCol === 2);
}

function validateBishopMove(start, end, currentBoard) {
    // Must move diagonally
    if (Math.abs(end.row - start.row) !== Math.abs(end.col - start.col)) return false;

    // Check for obstacles
    const dRow = Math.sign(end.row - start.row);
    const dCol = Math.sign(end.col - start.col);
    for (let i = 1; i < Math.abs(end.row - start.row); i++) {
        if (currentBoard[start.row + i * dRow][start.col + i * dCol]) {
            return false; // Obstacle found
        }
    }
    return true;
}

function validateKingMove(start, end) {
    const dRow = Math.abs(end.row - start.row);
    const dCol = Math.abs(end.col - start.col);
    // King can move one square in any direction
    return dRow <= 1 && dCol <= 1;
    // Note: Castling logic is not implemented here for brevity.
}

function makeMove(start, end) {
    // Basic move: simply relocate the piece.
    board[end.row][end.col] = board[start.row][start.col];
    board[start.row][start.col] = null;
    // Note: Pawn promotion logic is not implemented here for brevity.
}


// --- AI Logic ---
// Values used for evaluation and capture ordering
const PIECE_VALUES = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
};

// Piece-Square Tables (Simplified) - Bonus/malus depending on square positions.
// These tables are for white pieces; for black, the indices are mirrored (7-row)
const PAWN_TABLE = [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0
];

const KNIGHT_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20, 0, 5, 5, 0,-20,-40,
    -30, 5, 10, 15, 15, 10, 5,-30,
    -30, 0, 15, 20, 20, 15, 0,-30,
    -30, 5, 15, 20, 20, 15, 5,-30,
    -30, 0, 10, 15, 15, 10, 0,-30,
    -40,-20, 0, 0, 0, 0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10, 0, 0, 0, 0, 0, 0,-10,
    -10, 0, 5, 10, 10, 5, 0,-10,
    -10, 5, 5, 10, 10, 5, 5,-10,
    -10, 0, 10, 10, 10, 10, 0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10, 5, 0, 0, 0, 0, 5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0,-5,
    -5, 0, 0, 0, 0, 0, 0,-5,
    -5, 0, 0, 0, 0, 0, 0,-5,
    -5, 0, 0, 0, 0, 0, 0,-5,
    -5, 0, 0, 0, 0, 0, 0,-5,
    0, 0, 0, 5, 5, 0, 0, 0
];

const QUEEN_TABLE = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10, 0, 0, 0, 0, 0, 0,-10,
    -10, 0, 5, 5, 5, 5, 0,-10,
    -5, 0, 5, 5, 5, 5, 0,-5,
    0, 0, 5, 5, 5, 5, 0,-5,
    -10, 5, 5, 5, 5, 5, 0,-10,
    -10, 0, 5, 0, 0, 0, 0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE_MIDDLE = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20
];

const PIECE_SQUARE_TABLES = {
    'p': PAWN_TABLE, 'n': KNIGHT_TABLE, 'b': BISHOP_TABLE,
    'r': ROOK_TABLE, 'q': QUEEN_TABLE, 'k': KING_TABLE_MIDDLE,
    'P': PAWN_TABLE, 'N': KNIGHT_TABLE, 'B': BISHOP_TABLE,
    'R': ROOK_TABLE, 'Q': QUEEN_TABLE, 'K': KING_TABLE_MIDDLE
};

function getPSTIndex(row, col, isWhitePiece) {
    // For white pieces, PST index corresponds directly to board position (0-63).
    // For black pieces, PST is mirrored vertically, so row 0 for black piece is row 7 for table etc.
    return isWhitePiece ? (7 - row) * 8 + col : row * 8 + col;
}

function evaluateBoard(currentBoard) {
    let score = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = currentBoard[row][col];
            if (piece) {
                const isWhitePiece = isWhite(piece);
                const pieceValue = PIECE_VALUES[piece];
                const pstTable = PIECE_SQUARE_TABLES[piece];
                const pstIndex = getPSTIndex(row, col, isWhitePiece);
                const positionalBonus = pstTable ? pstTable[pstIndex] : 0;

                // White pieces add to the score, black pieces subtract from it.
                if (isWhitePiece) {
                    score += pieceValue + positionalBonus;
                } else {
                    score -= pieceValue + positionalBonus;
                }
            }
        }
    }
    return score;
}

// Function to make a temporary move on a copied board state
function makeTempMove(tempBoard, start, end) {
    const newBoard = tempBoard.map(arr => [...arr]); // Deep copy of the board
    newBoard[end.row][end.col] = newBoard[start.row][start.col];
    newBoard[start.row][start.col] = null;
    return newBoard;
}

function getPossibleMovesForColor(color, currentBoard) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = currentBoard[row][col];
            // Check if the piece belongs to the current color
            if (piece && ((color === 'white' && isWhite(piece)) || (color === 'black' && !isWhite(piece)))) {
                for (let endRow = 0; endRow < 8; endRow++) {
                    for (let endCol = 0; endCol < 8; endCol++) {
                        const start = { row, col };
                        const end = { row: endRow, col: endCol };
                        if (isValidMove(start, end, currentBoard)) {
                            const capturedPiece = currentBoard[end.row][end.col];
                            moves.push({
                                start,
                                end,
                                isCapture: capturedPiece !== null,
                                captureValue: capturedPiece ? PIECE_VALUES[capturedPiece] : 0
                            });
                        }
                    }
                }
            }
        }
    }

    // Sort moves: captures first, then by value of captured piece
    // This move ordering helps Alpha-Beta Pruning be more efficient.
    moves.sort((a, b) => {
        if (a.isCapture && !b.isCapture) return -1; // a is capture, b is not: a comes first
        if (!a.isCapture && b.isCapture) return 1;  // b is capture, a is not: b comes first
        return b.captureValue - a.captureValue;     // Both captures or both non-captures: sort by value
    });

    return moves;
}

// Minimax algorithm with Alpha-Beta Pruning
function minimax(currentBoard, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0) {
        return evaluateBoard(currentBoard);
    }

    const moves = getPossibleMovesForColor(isMaximizingPlayer ? 'black' : 'white', currentBoard);

    // If no moves, consider it a terminal state (e.g., checkmate or stalemate, but not fully implemented)
    if (moves.length === 0) {
        return evaluateBoard(currentBoard); // Return current board evaluation
    }

    if (isMaximizingPlayer) { // AI is black (maximizing its score)
        let maxEval = -Infinity;
        for (const move of moves) {
            const newBoard = makeTempMove(currentBoard, move.start, move.end);
            const evaluation = minimax(newBoard, depth - 1, alpha, beta, false); // Next turn is minimizing
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) { // Alpha-beta pruning
                break;
            }
        }
        return maxEval;
    } else { // Opponent is white (minimizing AI's score)
        let minEval = Infinity;
        for (const move of moves) {
            const newBoard = makeTempMove(currentBoard, move.start, move.end);
            const evaluation = minimax(newBoard, depth - 1, alpha, beta, true); // Next turn is maximizing
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) { // Alpha-beta pruning
                break;
            }
        }
        return minEval;
    }
}

// Function to find the best move using minimax search
function findBestMove(currentBoard, color, depth) {
    let bestScore = color === 'black' ? -Infinity : Infinity;
    let bestMove = null;
    const moves = getPossibleMovesForColor(color, currentBoard);

    // AI is black (maximizing player)
    for (const move of moves) {
        const newBoard = makeTempMove(currentBoard, move.start, move.end);
        // Call minimax for the opponent (minimizing player)
        const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
}

function makeAIMove() {
    const AI_SEARCH_DEPTH = 3; // Adjust for difficulty: higher depth = better AI, slower calculation
    const bestMove = findBestMove(board, 'black', AI_SEARCH_DEPTH);
    if (bestMove) {
        makeMove(bestMove.start, bestMove.end);
        turn = 'white';
        renderBoard();
        updateStatus();
    } else {
        console.warn("AI found no valid moves. Likely checkmate or stalemate, but not fully implemented.");
        // A complete game would detect checkmate/stalemate here.
    }
}

// --- Initial setup ---
renderBoard();
updateStatus();
