import { evaluatePosition, getLegalMoves, analyzePosition, getSquareCoordinates } from './checkers-logic';
import type { BoardPosition, Move, AnalysisResult } from '@shared/schema';

export function minimax(
  position: BoardPosition, 
  depth: number, 
  maximizingPlayer: boolean, 
  player: 'red' | 'black',
  alpha: number = -Infinity,
  beta: number = Infinity,
  rules: { forceTake: boolean; forceMultipleTakes: boolean } = { forceTake: true, forceMultipleTakes: true }
): number {
  if (depth === 0) {
    return evaluatePositionAdvanced(position);
  }
  
  const moves = getLegalMoves(position, player, rules);
  
  if (moves.length === 0) {
    // No moves available - game over
    return maximizingPlayer ? -10000 : 10000;
  }
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newPosition = makeMove(position, move);
      const evaluation = minimax(newPosition, depth - 1, false, player === 'red' ? 'black' : 'red', alpha, beta, rules);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break; // Alpha-beta pruning
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newPosition = makeMove(position, move);
      const evaluation = minimax(newPosition, depth - 1, true, player === 'red' ? 'black' : 'red', alpha, beta, rules);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break; // Alpha-beta pruning
      }
    }
    return minEval;
  }
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

// Advanced position evaluation with multiple factors
function evaluatePositionAdvanced(position: BoardPosition): number {
  let score = 0;
  let redPieces = 0, blackPieces = 0;
  let redKings = 0, blackKings = 0;
  let redBackRank = 0, blackBackRank = 0;
  let redCenter = 0, blackCenter = 0;
  let redEdge = 0, blackEdge = 0;
  
  Object.entries(position).forEach(([square, piece]) => {
    if (!piece) return;
    
    const [row, col] = getSquareCoordinates(square);
    const isRed = piece.includes('red');
    const isKing = piece.includes('king');
    
    // Basic piece values
    if (isRed) {
      if (isKing) {
        redKings++;
        score += 300; // Kings are very valuable
      } else {
        redPieces++;
        score += 100; // Regular pieces
      }
    } else {
      if (isKing) {
        blackKings++;
        score -= 300;
      } else {
        blackPieces++;
        score -= 100;
      }
    }
    
    // Positional bonuses
    if (!isKing) {
      // Advancement bonus for regular pieces
      if (isRed) {
        score += (row) * 10; // Red moves up (higher row numbers)
      } else {
        score -= (7 - row) * 10; // Black moves down (lower row numbers)
      }
    }
    
    // Center control bonus
    if (col >= 2 && col <= 5 && row >= 2 && row <= 5) {
      if (isRed) {
        redCenter++;
        score += 20;
      } else {
        blackCenter++;
        score -= 20;
      }
    }
    
    // Edge penalty (pieces on edges are less mobile)
    if (col === 0 || col === 7) {
      if (isRed) {
        redEdge++;
        score -= 10;
      } else {
        blackEdge++;
        score += 10;
      }
    }
    
    // Back rank protection (keeping pieces on back rank)
    if ((isRed && row === 0) || (!isRed && row === 7)) {
      if (isRed) {
        redBackRank++;
        score += 15;
      } else {
        blackBackRank++;
        score -= 15;
      }
    }
  });
  
  // King ratio bonus
  const totalRed = redPieces + redKings;
  const totalBlack = blackPieces + blackKings;
  
  if (totalRed > 0) {
    score += (redKings / totalRed) * 50;
  }
  if (totalBlack > 0) {
    score -= (blackKings / totalBlack) * 50;
  }
  
  // Mobility evaluation
  const redMobility = getLegalMoves(position, 'red').length;
  const blackMobility = getLegalMoves(position, 'black').length;
  score += (redMobility - blackMobility) * 5;
  
  return Math.round(score);
}

export function findBestMoveWithDepth(
  position: BoardPosition, 
  player: 'red' | 'black', 
  depth: number = 4,
  rules: { forceTake: boolean; forceMultipleTakes: boolean } = { forceTake: true, forceMultipleTakes: true }
): AnalysisResult {
  const legalMoves = getLegalMoves(position, player, rules);
  const evaluation = evaluatePositionAdvanced(position);
  
  if (legalMoves.length === 0) {
    return {
      evaluation,
      bestMove: null,
      legalMoves: [],
      explanation: "No legal moves available."
    };
  }
  
  let bestMove: Move | null = null;
  let bestScore = player === 'red' ? -Infinity : Infinity;
  let moveEvaluations: Array<{move: Move, score: number}> = [];
  
  // Sort moves to improve alpha-beta pruning (captures first)
  const sortedMoves = legalMoves.sort((a, b) => {
    const aCaptureValue = (a.captures?.length || 0) * 100 + (a.promotion ? 50 : 0);
    const bCaptureValue = (b.captures?.length || 0) * 100 + (b.promotion ? 50 : 0);
    return bCaptureValue - aCaptureValue;
  });
  
  sortedMoves.forEach(move => {
    const newPosition = makeMove(position, move);
    const score = minimax(newPosition, depth - 1, player === 'black', player === 'red' ? 'black' : 'red', -Infinity, Infinity, rules);
    
    moveEvaluations.push({move, score});
    
    if ((player === 'red' && score > bestScore) || 
        (player === 'black' && score < bestScore)) {
      bestScore = score;
      bestMove = move;
    }
  });
  
  const explanation = getAdvancedMoveExplanation(bestMove, evaluation, bestScore, moveEvaluations, position);
  
  // Add ranking to move evaluations
  const rankedEvaluations = moveEvaluations
    .sort((a, b) => player === 'red' ? b.score - a.score : a.score - b.score)
    .map((evaluation, index) => ({ ...evaluation, rank: index + 1 }));
  
  return {
    evaluation,
    bestMove,
    legalMoves,
    explanation,
    moveEvaluations: rankedEvaluations
  };
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

function getAdvancedMoveExplanation(
  bestMove: Move | null, 
  currentEval: number, 
  bestScore: number, 
  moveEvaluations: Array<{move: Move, score: number}>,
  position: BoardPosition
): string {
  if (!bestMove) {
    return "No legal moves available.";
  }
  
  const totalPieces = Object.values(position).filter(p => p).length;
  const isEndgame = totalPieces <= 8;
  
  // Capture moves
  if (bestMove.captures && bestMove.captures.length > 0) {
    if (bestMove.captures.length > 1) {
      return `Excellent! This double/triple jump captures ${bestMove.captures.length} pieces, giving you a decisive material advantage.`;
    }
    return `This capture eliminates an opponent piece and ${isEndgame ? 'brings you closer to victory' : 'improves your material advantage'}.`;
  }
  
  // Promotion moves
  if (bestMove.promotion) {
    return `Promoting to a king dramatically increases this piece's power and mobility - kings can move in all directions!`;
  }
  
  // Analyze the score difference
  const scoreDiff = Math.abs(bestScore - currentEval);
  
  if (scoreDiff > 200) {
    return `This move creates a significant tactical advantage, potentially setting up future captures or strong positioning.`;
  }
  
  if (scoreDiff > 100) {
    return `This positional move improves your piece placement and limits your opponent's options.`;
  }
  
  // Check if it's a defensive move
  const opponentMoves = getLegalMoves(position, currentEval > 0 ? 'black' : 'red');
  const threatenedPieces = opponentMoves.filter(move => move.captures && move.captures.length > 0);
  
  if (threatenedPieces.length > 0) {
    return `This defensive move protects your pieces while maintaining good positioning for counter-attacks.`;
  }
  
  // Endgame vs midgame strategy
  if (isEndgame) {
    return `In the endgame, this move focuses on king activity and controlling key squares to secure victory.`;
  }
  
  return `This strategic move improves your piece coordination and prepares for future tactical opportunities.`;
}
