import { useState, useCallback, useEffect } from 'react';
import { CheckersBoard } from '@/components/checkers-board';
import { ControlPanel } from '@/components/control-panel';
import { AnalysisResults } from '@/components/analysis-results';
import { EvaluationBar } from '@/components/evaluation-bar';
import { EngineLines } from '@/components/engine-lines';
import { getInitialPosition, analyzePosition, getLegalMoves } from '@/lib/checkers-logic';
import { findBestMoveWithDepth } from '@/lib/checkers-ai';
import type { GameState, Move, AnalysisResult } from '@shared/schema';

export default function CheckersPage() {
  const initialPosition = getInitialPosition();
  const [gameState, setGameState] = useState<GameState>({
    position: initialPosition,
    currentPlayer: 'red',
    mode: 'setup',
    evaluation: 0,
    bestMove: null,
    moveHistory: [],
    legalMoves: getLegalMoves(initialPosition, 'red'),
    rules: {
      forceTake: true,
      forceMultipleTakes: true,
    },
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string>('Never');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState(4);
  const [hoveredMove, setHoveredMove] = useState<Move | null>(null);

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
        
        const nextPlayer = prev.currentPlayer === 'red' ? 'black' : 'red';
        const legalMoves = getLegalMoves(newPosition, nextPlayer, gameState.rules);
        
        return {
          ...prev,
          position: newPosition,
          currentPlayer: nextPlayer,
          moveHistory: [...prev.moveHistory, `${prev.moveHistory.length + 1}. ${prev.currentPlayer} ${moveNotation}`],
          legalMoves,
        };
      });
    }
  }, [gameState.mode]);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Use the enhanced AI for deeper analysis with current rules
      const result = findBestMoveWithDepth(gameState.position, gameState.currentPlayer, analysisDepth, gameState.rules);
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
      // Fallback to basic analysis if advanced analysis fails
      const fallbackResult = analyzePosition(gameState.position, gameState.currentPlayer, gameState.rules);
      setAnalysisResult(fallbackResult);
      setGameState(prev => ({
        ...prev,
        evaluation: fallbackResult.evaluation,
        bestMove: fallbackResult.bestMove ? `${fallbackResult.bestMove.from} → ${fallbackResult.bestMove.to}` : null,
        legalMoves: fallbackResult.legalMoves,
      }));
      setLastAnalysisTime(new Date().toLocaleTimeString() + ' (basic)');
    } finally {
      setIsAnalyzing(false);
    }
  }, [gameState.position, gameState.currentPlayer, analysisDepth, gameState.rules]);

  // Auto-evaluate position when it changes (this fixes the timing issue)
  useEffect(() => {
    if (gameState.mode === 'play') {
      // Delay auto-analysis slightly to allow UI to update
      const timeoutId = setTimeout(() => {
        handleAnalyze();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.position, gameState.currentPlayer, gameState.rules]);

  const handleReset = useCallback(() => {
    const resetPosition = getInitialPosition();
    setGameState({
      position: resetPosition,
      currentPlayer: 'red',
      mode: gameState.mode,
      evaluation: 0,
      bestMove: null,
      moveHistory: [],
      legalMoves: gameState.mode === 'play' ? getLegalMoves(resetPosition, 'red', gameState.rules) : [],
      rules: gameState.rules,
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
    setGameState(prev => {
      const newState = { ...prev, mode };
      if (mode === 'play') {
        // Calculate legal moves when switching to play mode with current rules
        const legalMoves = getLegalMoves(prev.position, prev.currentPlayer, prev.rules);
        newState.legalMoves = legalMoves;
      }
      return newState;
    });
  }, []);

  const handleDepthChange = useCallback((depth: number) => {
    setAnalysisDepth(depth);
  }, []);

  const handleRulesChange = useCallback((rules: { forceTake: boolean; forceMultipleTakes: boolean }) => {
    setGameState(prev => {
      const newState = { ...prev, rules };
      // Recalculate legal moves with new rules if in play mode
      if (prev.mode === 'play') {
        newState.legalMoves = getLegalMoves(prev.position, prev.currentPlayer, rules);
      }
      return newState;
    });
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkers Analysis Tool</h1>
        <p className="text-lg text-gray-600">Analyze positions and find the best moves</p>
      </div>

      {/* Main Game Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Game Board Section */}
        <div className="lg:col-span-3">
          <CheckersBoard
            position={gameState.position}
            currentPlayer={gameState.currentPlayer}
            mode={gameState.mode}
            legalMoves={gameState.legalMoves}
            onSquareClick={handleSquareClick}
            onPieceMove={handlePieceMove}
            suggestedMove={analysisResult?.bestMove}
            hoveredMove={hoveredMove}
          />
          
          {/* Evaluation Bar - directly under board */}
          <div className="mt-6">
            <EvaluationBar evaluation={gameState.evaluation} />
          </div>
        </div>

        {/* Control Panel Section */}
        <div>
          <ControlPanel
            gameState={gameState}
            isAnalyzing={isAnalyzing}
            analysisDepth={analysisDepth}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            onClear={handleClear}
            onFlip={handleFlip}
            onModeChange={handleModeChange}
            onDepthChange={setAnalysisDepth}
            onRulesChange={handleRulesChange}
          />
        </div>


      </div>

      {/* Analysis Results - underneath everything */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Position Analysis */}
        <div>
          <AnalysisResults
            analysisResult={analysisResult}
            lastAnalysisTime={lastAnalysisTime}
            gameState={gameState}
            isAnalyzing={isAnalyzing}
          />
        </div>
        
        {/* Engine Lines */}
        <div>
          <EngineLines
            moveEvaluations={analysisResult?.moveEvaluations || []}
            currentPlayer={gameState.currentPlayer}
            onMoveHover={setHoveredMove}
          />
        </div>
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
