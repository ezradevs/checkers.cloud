import { useState, useCallback } from 'react';
import { CheckersBoard } from '@/components/checkers-board';
import { ControlPanel } from '@/components/control-panel';
import { AnalysisResults } from '@/components/analysis-results';
import { getInitialPosition, analyzePosition } from '@/lib/checkers-logic';
import type { GameState, Move, AnalysisResult } from '@shared/schema';

export default function CheckersPage() {
  const [gameState, setGameState] = useState<GameState>({
    position: getInitialPosition(),
    currentPlayer: 'red',
    mode: 'setup',
    evaluation: 0,
    bestMove: null,
    moveHistory: [],
    legalMoves: [],
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string>('Never');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSquareClick = useCallback((square: string) => {
    if (gameState.mode === 'setup') {
      setGameState(prev => {
        const newPosition = { ...prev.position };
        if (newPosition[square]) {
          // Remove piece if one exists
          delete newPosition[square];
        } else {
          // Place piece based on current player
          newPosition[square] = prev.currentPlayer;
        }
        return { ...prev, position: newPosition };
      });
    }
  }, [gameState.mode]);

  const handlePieceMove = useCallback((move: Move) => {
    if (gameState.mode === 'play') {
      setGameState(prev => {
        const newPosition = { ...prev.position };
        const piece = newPosition[move.from];
        
        // Move piece
        newPosition[move.to] = piece;
        delete newPosition[move.from];
        
        // Handle captures
        if (move.captures) {
          move.captures.forEach(capturedSquare => {
            delete newPosition[capturedSquare];
          });
        }
        
        // Handle king promotion
        if (move.promotion) {
          if (piece === 'red') newPosition[move.to] = 'red-king';
          if (piece === 'black') newPosition[move.to] = 'black-king';
        }
        
        const moveNotation = `${move.from}-${move.to}${move.captures ? 'x' + move.captures.join('x') : ''}`;
        
        return {
          ...prev,
          position: newPosition,
          currentPlayer: prev.currentPlayer === 'red' ? 'black' : 'red',
          moveHistory: [...prev.moveHistory, `${prev.moveHistory.length + 1}. ${prev.currentPlayer} ${moveNotation}`],
        };
      });
    }
  }, [gameState.mode]);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = analyzePosition(gameState.position, gameState.currentPlayer);
      setAnalysisResult(result);
      setGameState(prev => ({
        ...prev,
        evaluation: result.evaluation,
        bestMove: result.bestMove ? `${result.bestMove.from} → ${result.bestMove.to}` : null,
        legalMoves: result.legalMoves,
      }));
      setLastAnalysisTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [gameState.position, gameState.currentPlayer]);

  const handleReset = useCallback(() => {
    setGameState({
      position: getInitialPosition(),
      currentPlayer: 'red',
      mode: gameState.mode,
      evaluation: 0,
      bestMove: null,
      moveHistory: [],
      legalMoves: [],
    });
    setAnalysisResult(null);
    setLastAnalysisTime('Never');
  }, [gameState.mode]);

  const handleClear = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      position: {},
      evaluation: 0,
      bestMove: null,
      moveHistory: [],
      legalMoves: [],
    }));
    setAnalysisResult(null);
    setLastAnalysisTime('Never');
  }, []);

  const handleFlip = useCallback(() => {
    // In a real implementation, this would flip the board view
    console.log('Board flip not implemented yet');
  }, []);

  const handleModeChange = useCallback((mode: 'setup' | 'play') => {
    setGameState(prev => ({ ...prev, mode }));
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkers Analysis Tool</h1>
        <p className="text-lg text-gray-600">Analyze positions and find the best moves</p>
      </div>

      {/* Main Game Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Board Section */}
        <div className="lg:col-span-2">
          <CheckersBoard
            position={gameState.position}
            currentPlayer={gameState.currentPlayer}
            mode={gameState.mode}
            legalMoves={gameState.legalMoves}
            onSquareClick={handleSquareClick}
            onPieceMove={handlePieceMove}
          />
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-1">
          <ControlPanel
            gameState={gameState}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            onClear={handleClear}
            onFlip={handleFlip}
            onModeChange={handleModeChange}
          />
        </div>
      </div>

      {/* Analysis Results */}
      <div className="mt-8">
        <AnalysisResults
          analysisResult={analysisResult}
          lastAnalysisTime={lastAnalysisTime}
          gameState={gameState}
        />
      </div>

      {/* Help Section */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-info-circle text-blue-600 mr-2"></i>
            How to Use
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900 mb-1">Setup Mode</div>
              <div className="text-gray-700">Click on empty squares to place pieces. Click on pieces to remove them.</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">Play Mode</div>
              <div className="text-gray-700">Drag pieces to make moves. Only legal moves are allowed.</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">Analysis</div>
              <div className="text-gray-700">Click "Analyze" to see position evaluation and best moves.</div>
            </div>
            <div>
              <div className="font-medium text-gray-900 mb-1">Scoring</div>
              <div className="text-gray-700">Regular pieces = 1 point, Kings = 2 points. Positive favors Red.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
