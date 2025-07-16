import { evaluatePosition, getLegalMoves, analyzePosition } from './checkers-logic';
import type { BoardPosition, Move, AnalysisResult } from '@shared/schema';

export function minimax(
  position: BoardPosition, 
  depth: number, 
  maximizingPlayer: boolean, 
  player: 'red' | 'black'
): number {
  if (depth === 0) {
    return evaluatePosition(position);
  }
  
  const moves = getLegalMoves(position, player);
  
  if (moves.length === 0) {
    // No moves available - game over
    return maximizingPlayer ? -1000 : 1000;
  }
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    moves.forEach(move => {
      const newPosition = makeMove(position, move);
      const eval = minimax(newPosition, depth - 1, false, player === 'red' ? 'black' : 'red');
      maxEval = Math.max(maxEval, eval);
    });
    return maxEval;
  } else {
    let minEval = Infinity;
    moves.forEach(move => {
      const newPosition = makeMove(position, move);
      const eval = minimax(newPosition, depth - 1, true, player === 'red' ? 'black' : 'red');
      minEval = Math.min(minEval, eval);
    });
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

export function findBestMoveWithDepth(
  position: BoardPosition, 
  player: 'red' | 'black', 
  depth: number = 2
): AnalysisResult {
  const legalMoves = getLegalMoves(position, player);
  const evaluation = evaluatePosition(position);
  
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
  
  legalMoves.forEach(move => {
    const newPosition = makeMove(position, move);
    const score = minimax(newPosition, depth - 1, player === 'black', player === 'red' ? 'black' : 'red');
    
    if ((player === 'red' && score > bestScore) || 
        (player === 'black' && score < bestScore)) {
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
