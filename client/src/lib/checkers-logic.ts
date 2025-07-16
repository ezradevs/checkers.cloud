import type { BoardPosition, PieceType, Move, AnalysisResult } from '@shared/schema';

export function getInitialPosition(): BoardPosition {
  const position: BoardPosition = {};

  // Black pieces (top 3 rows) - only on dark squares (flipped pattern)
  const blackSquares = [
    'b8', 'd8', 'f8', 'h8',
    'a7', 'c7', 'e7', 'g7',
    'b6', 'd6', 'f6', 'h6'
  ];

  // Red pieces (bottom 3 rows) - only on dark squares (flipped pattern)
  const redSquares = [
    'a1', 'c1', 'e1', 'g1',
    'b2', 'd2', 'f2', 'h2',
    'a3', 'c3', 'e3', 'g3'
  ];

  blackSquares.forEach(square => {
    position[square] = 'black';
  });

  redSquares.forEach(square => {
    position[square] = 'red';
  });

  return position;
}

export function getSquareCoordinates(square: string): [number, number] {
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = parseInt(square[1]) - 1;
  return [row, col];
}

export function getSquareFromCoordinates(row: number, col: number): string {
  if (row < 0 || row > 7 || col < 0 || col > 7) return '';
  return String.fromCharCode('a'.charCodeAt(0) + col) + (row + 1);
}

export function isValidSquare(square: string): boolean {
  if (square.length !== 2) return false;
  const [row, col] = getSquareCoordinates(square);
  return row >= 0 && row <= 7 && col >= 0 && col <= 7;
}

/**
 * Remap a BoardPosition to the opposite color complex.
 * Shifts all pieces by one column, wrapping around, and only to valid dark squares in the new complex.
 * Used when toggling the color complex (dark squares shift by one).
 */
export function remapPositionToOppositeColorComplex(position: BoardPosition): BoardPosition {
  const newPosition: BoardPosition = {};
  for (const [square, piece] of Object.entries(position)) {
    const [row, col] = getSquareCoordinates(square);
    // Shift column by +1 (wrap around 0-7)
    const newCol = (col + 1) % 8;
    const newSquare = getSquareFromCoordinates(row, newCol);
    // Only place on valid dark squares in the new complex
    if (isDarkSquare(newSquare, true)) { // true = opposite complex
      newPosition[newSquare] = piece;
    }
  }
  return newPosition;
}

// Update isDarkSquare to accept a colorComplex argument
export function isDarkSquare(square: string, colorComplex: boolean = false): boolean {
  const [row, col] = getSquareCoordinates(square);
  // colorComplex=false: bottom-left (a1) is dark, (row+col)%2===0 is dark
  // colorComplex=true: bottom-left (a1) is light, so (row+col)%2===1 is dark
  return colorComplex ? (row + col) % 2 === 1 : (row + col) % 2 === 0;
}

export function getLegalMoves(
  position: BoardPosition,
  player: 'red' | 'black',
  rules: { forceTake: boolean; forceMultipleTakes: boolean } = { forceTake: true, forceMultipleTakes: true }
): Move[] {
  const moves: Move[] = [];

  Object.entries(position).forEach(([square, piece]) => {
    if (!piece) return;

    const isPlayerPiece = (player === 'red' && (piece === 'red' || piece === 'red-king')) ||
      (player === 'black' && (piece === 'black' || piece === 'black-king'));

    if (!isPlayerPiece) return;

    const pieceMoves = getPieceMovesAndCaptures(position, square, piece);
    moves.push(...pieceMoves);
  });

  // Check if there are any capture moves available
  const captureMoves = moves.filter(move => move.captures && move.captures.length > 0);

  // Apply force-take rule if enabled
  if (rules.forceTake && captureMoves.length > 0) {
    if (rules.forceMultipleTakes) {
      // Find the moves with the maximum number of captures
      const maxCaptures = Math.max(...captureMoves.map(move => move.captures?.length || 0));
      return captureMoves.filter(move => (move.captures?.length || 0) === maxCaptures);
    }
    return captureMoves;
  }

  return moves;
}

function getPieceMovesAndCaptures(position: BoardPosition, square: string, piece: PieceType): Move[] {
  if (!piece) return [];

  const [row, col] = getSquareCoordinates(square);
  const moves: Move[] = [];
  const isKing = piece.includes('king');
  const isRed = piece.includes('red');

  // Direction multipliers for movement
  const directions = isKing ? [-1, 1] : [isRed ? 1 : -1];

  directions.forEach(rowDir => {
    [-1, 1].forEach(colDir => {
      // Check for simple moves
      const newRow = row + rowDir;
      const newCol = col + colDir;
      const newSquare = getSquareFromCoordinates(newRow, newCol);

      if (isValidSquare(newSquare) && isDarkSquare(newSquare) && !position[newSquare]) {
        const promotion = shouldPromote(piece, newSquare);
        moves.push({ from: square, to: newSquare, promotion });
      }

      // Check for captures
      const captureRow = row + rowDir * 2;
      const captureCol = col + colDir * 2;
      const captureSquare = getSquareFromCoordinates(captureRow, captureCol);
      const jumpedSquare = getSquareFromCoordinates(row + rowDir, col + colDir);

      if (isValidSquare(captureSquare) && isDarkSquare(captureSquare) &&
        !position[captureSquare] && position[jumpedSquare] &&
        isOpponentPiece(piece, position[jumpedSquare])) {

        const promotion = shouldPromote(piece, captureSquare);
        const move: Move = {
          from: square,
          to: captureSquare,
          captures: [jumpedSquare],
          promotion
        };

        // Check for multiple jumps
        const multiJumpMoves = findMultipleJumps(position, move, piece);
        moves.push(...multiJumpMoves);
      }
    });
  });

  return moves;
}

function findMultipleJumps(position: BoardPosition, initialMove: Move, piece: PieceType): Move[] {
  const tempPosition = { ...position };

  // Apply the initial move
  tempPosition[initialMove.to] = piece;
  delete tempPosition[initialMove.from];
  if (initialMove.captures) {
    initialMove.captures.forEach(square => delete tempPosition[square]);
  }

  // Look for additional jumps from the new position
  const additionalJumps = getPieceMovesAndCaptures(tempPosition, initialMove.to, piece)
    .filter(move => move.captures && move.captures.length > 0);

  if (additionalJumps.length === 0) {
    return [initialMove];
  }

  // Recursively find all possible multi-jump sequences
  const allMultiJumps: Move[] = [];
  additionalJumps.forEach(jump => {
    const extendedMove: Move = {
      from: initialMove.from,
      to: jump.to,
      captures: [...(initialMove.captures || []), ...(jump.captures || [])],
      promotion: jump.promotion || initialMove.promotion
    };

    const furtherJumps = findMultipleJumps(tempPosition,
      { from: initialMove.to, to: jump.to, captures: jump.captures, promotion: jump.promotion },
      piece);

    furtherJumps.forEach(furtherJump => {
      allMultiJumps.push({
        from: initialMove.from,
        to: furtherJump.to,
        captures: [...(initialMove.captures || []), ...(furtherJump.captures || [])],
        promotion: furtherJump.promotion || initialMove.promotion
      });
    });
  });

  return allMultiJumps.length > 0 ? allMultiJumps : [initialMove];
}

function isOpponentPiece(piece: PieceType, otherPiece: PieceType): boolean {
  if (!piece || !otherPiece) return false;
  const isRedPiece = piece.includes('red');
  const isOtherRed = otherPiece.includes('red');
  return isRedPiece !== isOtherRed;
}

function shouldPromote(piece: PieceType, toSquare: string): boolean {
  if (!piece || piece.includes('king')) return false;
  const [row] = getSquareCoordinates(toSquare);
  return (piece.includes('red') && row === 7) || (piece.includes('black') && row === 0);
}

export function evaluatePosition(position: BoardPosition): number {
  let score = 0;

  Object.values(position).forEach(piece => {
    if (!piece) return;

    if (piece === 'red') score += 1;
    else if (piece === 'red-king') score += 2;
    else if (piece === 'black') score -= 1;
    else if (piece === 'black-king') score -= 2;
  });

  return score;
}

export function analyzePosition(
  position: BoardPosition,
  currentPlayer: 'red' | 'black',
  rules: { forceTake: boolean; forceMultipleTakes: boolean } = { forceTake: true, forceMultipleTakes: true }
): AnalysisResult {
  const evaluation = evaluatePosition(position);
  const legalMoves = getLegalMoves(position, currentPlayer, rules);

  let bestMove: Move | null = null;
  let bestScore = currentPlayer === 'red' ? -Infinity : Infinity;

  // Simple 1-ply analysis
  legalMoves.forEach(move => {
    const tempPosition = makeMove(position, move);
    const score = evaluatePosition(tempPosition);

    if ((currentPlayer === 'red' && score > bestScore) ||
      (currentPlayer === 'black' && score < bestScore)) {
      bestScore = score;
      bestMove = move;
    }
  });

  const explanation = getBestMoveExplanation(bestMove, evaluation, bestScore);

  return {
    evaluation,
    bestMove,
    legalMoves,
    explanation
  };
}

function makeMove(position: BoardPosition, move: Move): BoardPosition {
  const newPosition = { ...position };
  const piece = newPosition[move.from];

  newPosition[move.to] = move.promotion ?
    (piece?.includes('red') ? 'red-king' : 'black-king') : piece;
  delete newPosition[move.from];

  if (move.captures) {
    move.captures.forEach(square => delete newPosition[square]);
  }

  return newPosition;
}

function getBestMoveExplanation(bestMove: Move | null, currentEval: number, newEval: number): string {
  if (!bestMove) {
    return "No legal moves available.";
  }

  if (bestMove.captures && bestMove.captures.length > 0) {
    return `This move captures ${bestMove.captures.length} opponent piece(s), improving your position significantly.`;
  }

  if (bestMove.promotion) {
    return "This move promotes your piece to a king, giving it much greater mobility and power.";
  }

  const improvement = Math.abs(newEval - currentEval);
  if (improvement > 1) {
    return "This move significantly improves your position by advancing toward the center and creating threats.";
  }

  return "This move maintains good position control and prepares for future tactical opportunities.";
}

export function countPieces(position: BoardPosition): { red: number; redKings: number; black: number; blackKings: number } {
  const counts = { red: 0, redKings: 0, black: 0, blackKings: 0 };

  Object.values(position).forEach(piece => {
    if (piece === 'red') counts.red++;
    else if (piece === 'red-king') counts.redKings++;
    else if (piece === 'black') counts.black++;
    else if (piece === 'black-king') counts.blackKings++;
  });

  return counts;
}

// New: getLegalMovesWithComplex
export function getLegalMovesWithComplex(
  position: BoardPosition,
  player: 'red' | 'black',
  colorComplex: boolean,
  rules: { forceTake: boolean; forceMultipleTakes: boolean } = { forceTake: true, forceMultipleTakes: true }
): Move[] {
  const moves: Move[] = [];
  Object.entries(position).forEach(([square, piece]) => {
    if (!piece) return;
    const isPlayerPiece = (player === 'red' && (piece === 'red' || piece === 'red-king')) ||
      (player === 'black' && (piece === 'black' || piece === 'black-king'));
    if (!isPlayerPiece) return;
    const pieceMoves = getPieceMovesAndCapturesWithComplex(position, square, piece, colorComplex);
    moves.push(...pieceMoves);
  });
  const captureMoves = moves.filter(move => move.captures && move.captures.length > 0);
  if (rules.forceTake && captureMoves.length > 0) {
    if (rules.forceMultipleTakes) {
      const maxCaptures = Math.max(...captureMoves.map(move => move.captures?.length || 0));
      return captureMoves.filter(move => (move.captures?.length || 0) === maxCaptures);
    }
    return captureMoves;
  }
  return moves;
}

function getPieceMovesAndCapturesWithComplex(position: BoardPosition, square: string, piece: PieceType, colorComplex: boolean): Move[] {
  if (!piece) return [];
  const [row, col] = getSquareCoordinates(square);
  const moves: Move[] = [];
  const isKing = piece.includes('king');
  const isRed = piece.includes('red');
  const directions = isKing ? [-1, 1] : [isRed ? 1 : -1];
  directions.forEach(rowDir => {
    [-1, 1].forEach(colDir => {
      const newRow = row + rowDir;
      const newCol = col + colDir;
      const newSquare = getSquareFromCoordinates(newRow, newCol);
      if (isValidSquare(newSquare) && isDarkSquare(newSquare, colorComplex) && !position[newSquare]) {
        const promotion = shouldPromote(piece, newSquare);
        moves.push({ from: square, to: newSquare, promotion });
      }
      const captureRow = row + rowDir * 2;
      const captureCol = col + colDir * 2;
      const captureSquare = getSquareFromCoordinates(captureRow, captureCol);
      const jumpedSquare = getSquareFromCoordinates(row + rowDir, col + colDir);
      if (
        isValidSquare(captureSquare) &&
        isDarkSquare(captureSquare, colorComplex) &&
        !position[captureSquare] && position[jumpedSquare] &&
        isOpponentPiece(piece, position[jumpedSquare])
      ) {
        const promotion = shouldPromote(piece, captureSquare);
        const move: Move = {
          from: square,
          to: captureSquare,
          captures: [jumpedSquare],
          promotion
        };
        const multiJumpMoves = findMultipleJumpsWithComplex(position, move, piece, colorComplex);
        moves.push(...multiJumpMoves);
      }
    });
  });
  return moves;
}

function findMultipleJumpsWithComplex(position: BoardPosition, initialMove: Move, piece: PieceType, colorComplex: boolean): Move[] {
  const tempPosition = { ...position };
  tempPosition[initialMove.to] = piece;
  delete tempPosition[initialMove.from];
  if (initialMove.captures) {
    initialMove.captures.forEach(square => delete tempPosition[square]);
  }
  const additionalJumps = getPieceMovesAndCapturesWithComplex(tempPosition, initialMove.to, piece, colorComplex)
    .filter(move => move.captures && move.captures.length > 0);
  if (additionalJumps.length === 0) {
    return [initialMove];
  }
  const allMultiJumps: Move[] = [];
  additionalJumps.forEach(jump => {
    const extendedMove: Move = {
      from: initialMove.from,
      to: jump.to,
      captures: [...(initialMove.captures || []), ...(jump.captures || [])],
      promotion: jump.promotion || initialMove.promotion
    };
    const furtherJumps = findMultipleJumpsWithComplex(tempPosition,
      { from: initialMove.to, to: jump.to, captures: jump.captures, promotion: jump.promotion },
      piece, colorComplex);
    furtherJumps.forEach(furtherJump => {
      allMultiJumps.push({
        from: initialMove.from,
        to: furtherJump.to,
        captures: [...(initialMove.captures || []), ...(furtherJump.captures || [])],
        promotion: furtherJump.promotion || initialMove.promotion
      });
    });
  });
  return allMultiJumps.length > 0 ? allMultiJumps : [initialMove];
}
