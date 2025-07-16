import type { BoardPosition, PieceType, Move, AnalysisResult } from '@shared/schema';

export function getInitialPosition(): BoardPosition {
  const position: BoardPosition = {};
  
  // Black pieces (top 3 rows) - only on dark squares
  const blackSquares = [
    'a8', 'c8', 'e8', 'g8',
    'b7', 'd7', 'f7', 'h7',
    'a6', 'c6', 'e6', 'g6'
  ];
  
  // Red pieces (bottom 3 rows) - only on dark squares
  const redSquares = [
    'b3', 'd3', 'f3', 'h3',
    'a2', 'c2', 'e2', 'g2',
    'b1', 'd1', 'f1', 'h1'
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

export function isDarkSquare(square: string, inverted: boolean = false): boolean {
  const [row, col] = getSquareCoordinates(square);
  // Normal: bottom-left (a1) is dark, so (0+0) % 2 === 0 means light, === 1 means dark
  // But we want a1 to be dark, so we need to flip the logic
  const isDark = (row + col) % 2 === 0; // This makes a1 (0,0) dark
  return inverted ? !isDark : isDark;
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
