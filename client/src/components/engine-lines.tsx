import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Move } from '@shared/schema';

interface MoveEvaluation {
  move: Move;
  score: number;
  rank: number;
}

interface EngineLinesProps {
  moveEvaluations: MoveEvaluation[];
  currentPlayer: 'red' | 'black';
  onMoveHover?: (move: Move | null) => void;
  className?: string;
}

export function EngineLines({ 
  moveEvaluations, 
  currentPlayer, 
  onMoveHover,
  className 
}: EngineLinesProps) {
  if (!moveEvaluations.length) {
    return (
      <div className={cn("bg-white rounded-xl shadow-lg p-6", className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engine Analysis</h3>
        <div className="text-center text-gray-500 py-8">
          No moves analyzed yet. Click "Analyze Position" to see engine lines.
        </div>
      </div>
    );
  }

  // Sort moves by score (best first for current player)
  const sortedMoves = [...moveEvaluations].sort((a, b) => {
    return currentPlayer === 'red' ? b.score - a.score : a.score - b.score;
  });

  const getMoveQuality = (rank: number) => {
    switch (rank) {
      case 1: return { label: 'Best', color: 'bg-green-100 text-green-800 border-green-200' };
      case 2: return { label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 3: return { label: 'OK', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      default: return { label: 'Poor', color: 'bg-red-100 text-red-800 border-red-200' };
    }
  };

  const formatMoveNotation = (move: Move) => {
    let notation = `${move.from}-${move.to}`;
    if (move.captures && move.captures.length > 0) {
      notation += ` (takes ${move.captures.length})`;
    }
    if (move.promotion) {
      notation += ' =K';
    }
    return notation;
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-lg p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engine Analysis</h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {sortedMoves.slice(0, 6).map((evaluation, index) => {
          const rank = index + 1;
          const quality = getMoveQuality(rank);
          const scoreDisplay = evaluation.score > 0 ? `+${evaluation.score}` : evaluation.score.toString();
          
          return (
            <div
              key={`${evaluation.move.from}-${evaluation.move.to}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
              onMouseEnter={() => onMoveHover?.(evaluation.move)}
              onMouseLeave={() => onMoveHover?.(null)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">#{rank}</span>
                  <Badge variant="outline" className={quality.color}>
                    {quality.label}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {formatMoveNotation(evaluation.move)}
                  </div>
                  {evaluation.move.captures && evaluation.move.captures.length > 1 && (
                    <div className="text-xs text-gray-500">
                      Multiple capture: {evaluation.move.captures.join(' → ')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className={cn(
                  "text-sm font-medium",
                  evaluation.score > 0 ? "text-red-600" : "text-gray-600"
                )}>
                  {scoreDisplay}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {moveEvaluations.length > 6 && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Showing top 6 moves of {moveEvaluations.length} analyzed
        </div>
      )}
    </div>
  );
}