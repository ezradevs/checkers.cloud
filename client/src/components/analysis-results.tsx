import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AnalysisResult, GameState } from '@shared/schema';

interface AnalysisResultsProps {
  analysisResult: AnalysisResult | null;
  lastAnalysisTime: string;
  gameState: GameState;
}

export function AnalysisResults({ 
  analysisResult, 
  lastAnalysisTime, 
  gameState 
}: AnalysisResultsProps) {
  const getEvaluationText = (evaluation: number) => {
    if (evaluation > 3) return "Red has a strong advantage";
    if (evaluation > 1) return "Red is slightly ahead";
    if (evaluation > -1) return "Position is roughly equal";
    if (evaluation > -3) return "Black is slightly ahead";
    return "Black has a strong advantage";
  };

  const getEvaluationColor = (evaluation: number) => {
    if (Math.abs(evaluation) <= 1) return "text-gray-600";
    return evaluation > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Position Analysis</h2>
        <div className="text-sm text-gray-500">Last analyzed: {lastAnalysisTime}</div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Position Evaluation */}
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 mb-2">Position Evaluation</div>
          <div className={cn("text-3xl font-bold mb-2", getEvaluationColor(gameState.evaluation))}>
            {gameState.evaluation > 0 ? '+' : ''}{gameState.evaluation}
          </div>
          <div className="text-sm text-gray-600">
            {getEvaluationText(gameState.evaluation)}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Score calculation based on piece values
          </div>
        </div>

        {/* Best Move */}
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 mb-2">Best Move</div>
          {analysisResult?.bestMove ? (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="font-semibold text-blue-900 mb-1">
                {gameState.currentPlayer === 'red' ? 'Red' : 'Black'} {analysisResult.bestMove.from} → {analysisResult.bestMove.to}
              </div>
              <div className="text-sm text-blue-700">
                {analysisResult.bestMove.captures && analysisResult.bestMove.captures.length > 0 ? 
                  `Captures ${analysisResult.bestMove.captures.length} piece(s)` : 
                  'Positional move'
                }
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500">
                Click "Analyze" to see best move
              </div>
            </div>
          )}
        </div>

        {/* Move Explanation */}
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 mb-2">Why This Move?</div>
          <div className="text-sm text-gray-700 text-left">
            {analysisResult?.explanation || "Analysis will explain the reasoning behind the recommended move."}
          </div>
        </div>
      </div>

      {/* Legal Moves Preview */}
      {analysisResult && analysisResult.legalMoves.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Legal Moves</h3>
            <span className="text-sm text-gray-500">
              {analysisResult.legalMoves.length} moves available
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {analysisResult.legalMoves.slice(0, 14).map((move, index) => {
              const isBestMove = analysisResult.bestMove && 
                move.from === analysisResult.bestMove.from && 
                move.to === analysisResult.bestMove.to;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg p-2 text-center cursor-pointer transition-colors",
                    isBestMove 
                      ? "bg-blue-50 hover:bg-blue-100 border border-blue-200" 
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium",
                    isBestMove ? "text-blue-700" : "text-gray-700"
                  )}>
                    {move.from}→{move.to}
                  </div>
                  {move.captures && move.captures.length > 0 && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      x{move.captures.length}
                    </Badge>
                  )}
                  {move.promotion && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      ♔
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
