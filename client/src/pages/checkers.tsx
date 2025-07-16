import { useState, useCallback, useEffect } from 'react';
import { CheckersBoard } from '@/components/checkers-board';
import { ControlPanel } from '@/components/control-panel';
import { AnalysisResults } from '@/components/analysis-results';
import { EvaluationBar } from '@/components/evaluation-bar';
import { EngineLines } from '@/components/engine-lines';
import { getInitialPosition, analyzePosition, getLegalMoves, remapPositionToOppositeColorComplex, getLegalMovesWithComplex } from '@/lib/checkers-logic';
import { findBestMoveWithDepth } from '@/lib/checkers-ai';
import type { GameState, Move, AnalysisResult } from '@shared/schema';
import type { BoardPosition } from '@shared/schema';

export default function CheckersPage() {
  const initialPosition = getInitialPosition();
  const [gameState, setGameState] = useState<GameState>({
    position: initialPosition,
    currentPlayer: 'red',
    mode: 'setup',
    evaluation: 0,
    bestMove: null,
    moveHistory: [],
    legalMoves: getLegalMovesWithComplex(initialPosition, 'red', false),
    rules: {
      forceTake: true,
      forceMultipleTakes: true,
    },
    boardOrientation: 'normal',
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string>('Never');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState(4);
  const [hoveredMove, setHoveredMove] = useState<Move | null>(null);
  const [colorComplex, setColorComplex] = useState(false); // false = default, true = opposite
  const [originalPosition, setOriginalPosition] = useState<BoardPosition | null>(null);

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
        return {
          ...prev,
          position: newPosition,
          legalMoves: getLegalMovesWithComplex(newPosition, prev.currentPlayer, colorComplex, prev.rules)
        };
      });
      return;
    }
    // In play mode, do not update legalMoves here (handled in handlePieceMove)
  }, [gameState.mode, gameState.currentPlayer, colorComplex, gameState.rules]);

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
        const legalMoves = getLegalMovesWithComplex(newPosition, nextPlayer, colorComplex, gameState.rules);

        return {
          ...prev,
          position: newPosition,
          currentPlayer: nextPlayer,
          moveHistory: [...prev.moveHistory, `${prev.moveHistory.length + 1}. ${prev.currentPlayer} ${moveNotation}`],
          legalMoves,
        };
      });
    }
  }, [gameState.mode, colorComplex, gameState.rules]);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Use the enhanced AI for deeper analysis with current rules
      const result = findBestMoveWithDepth(gameState.position, gameState.currentPlayer, analysisDepth, colorComplex, gameState.rules);
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
      const fallbackLegalMoves = getLegalMovesWithComplex(gameState.position, gameState.currentPlayer, colorComplex, gameState.rules);
      setAnalysisResult({
        evaluation: 0,
        bestMove: null,
        legalMoves: fallbackLegalMoves,
        explanation: 'Analysis failed.'
      });
      setGameState(prev => ({
        ...prev,
        evaluation: 0,
        bestMove: null,
        legalMoves: fallbackLegalMoves,
      }));
      setLastAnalysisTime(new Date().toLocaleTimeString() + ' (basic)');
    } finally {
      setIsAnalyzing(false);
    }
  }, [gameState.position, gameState.currentPlayer, analysisDepth, gameState.rules, colorComplex]);

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
        const legalMoves = getLegalMovesWithComplex(prev.position, prev.currentPlayer, colorComplex, prev.rules);
        newState.legalMoves = legalMoves;
      }
      return newState;
    });
  }, [colorComplex]);

  const handleDepthChange = useCallback((depth: number) => {
    setAnalysisDepth(depth);
  }, []);

  const handleRulesChange = useCallback((rules: { forceTake: boolean; forceMultipleTakes: boolean }) => {
    setGameState(prev => {
      const newState = { ...prev, rules };
      // Recalculate legal moves with new rules if in play mode
      if (prev.mode === 'play') {
        newState.legalMoves = getLegalMovesWithComplex(prev.position, prev.currentPlayer, colorComplex, rules);
      }
      return newState;
    });
  }, [colorComplex]);

  const handleColorComplexToggle = useCallback(() => {
    setColorComplex(prev => {
      if (!prev) {
        // Going to opposite complex: store original position and remap
        setOriginalPosition(gameState.position);
        setGameState(prevState => ({
          ...prevState,
          position: remapPositionToOppositeColorComplex(prevState.position),
          legalMoves: getLegalMovesWithComplex(remapPositionToOppositeColorComplex(prevState.position), prevState.currentPlayer, true, prevState.rules)
        }));
        return true;
      } else {
        // Going back to default: restore original position
        setGameState(prevState => ({
          ...prevState,
          position: originalPosition || prevState.position,
          legalMoves: getLegalMovesWithComplex(originalPosition || prevState.position, prevState.currentPlayer, false, prevState.rules)
        }));
        return false;
      }
    });
  }, [gameState.position, gameState.currentPlayer, gameState.rules, originalPosition]);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkers Analysis Tool</h1>
        <p className="text-lg text-gray-600">Analyze positions and find the best moves</p>
      </div>

      {/* Main Game Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Game Board and Analysis */}
        <div className="lg:col-span-3 space-y-6">
          {/* Game Board */}
          <CheckersBoard
            position={gameState.position}
            currentPlayer={gameState.currentPlayer}
            mode={gameState.mode}
            legalMoves={gameState.legalMoves}
            onSquareClick={handleSquareClick}
            onPieceMove={handlePieceMove}
            suggestedMove={analysisResult?.bestMove}
            hoveredMove={hoveredMove}
            colorComplex={colorComplex}
          />

          {/* Evaluation Bar */}
          <EvaluationBar evaluation={gameState.evaluation} />

          {/* Analysis Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Position Analysis */}
            <AnalysisResults
              analysisResult={analysisResult}
              lastAnalysisTime={lastAnalysisTime}
              gameState={gameState}
              isAnalyzing={isAnalyzing}
            />

            {/* Engine Lines */}
            <EngineLines
              moveEvaluations={analysisResult?.moveEvaluations || []}
              currentPlayer={gameState.currentPlayer}
              onMoveHover={setHoveredMove}
            />
          </div>
        </div>

        {/* Right Column - Control Panel */}
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
            colorComplex={colorComplex}
            onColorComplexToggle={handleColorComplexToggle}
          />
        </div>
      </div>
    </div>
  );
}
