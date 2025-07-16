import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { BoardPosition, PieceType, Move } from '@shared/schema';
import { isDarkSquare, getSquareCoordinates } from '@/lib/checkers-logic';
import { MoveArrow } from './move-arrow';

interface CheckersBoardProps {
  position: BoardPosition;
  currentPlayer: 'red' | 'black';
  mode: 'setup' | 'play';
  legalMoves: Move[];
  onSquareClick: (square: string) => void;
  onPieceMove: (move: Move) => void;
  suggestedMove?: Move | null;
  hoveredMove?: Move | null;
}

export function CheckersBoard({ 
  position, 
  currentPlayer, 
  mode, 
  legalMoves, 
  onSquareClick, 
  onPieceMove,
  suggestedMove,
  hoveredMove
}: CheckersBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<{ square: string; piece: PieceType } | null>(null);
  const [boardSize, setBoardSize] = useState(400);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardRef.current) {
      const updateBoardSize = () => {
        const rect = boardRef.current!.getBoundingClientRect();
        setBoardSize(rect.width);
      };
      
      updateBoardSize();
      window.addEventListener('resize', updateBoardSize);
      return () => window.removeEventListener('resize', updateBoardSize);
    }
  }, []);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const handleSquareClick = useCallback((square: string) => {
    if (mode === 'setup') {
      onSquareClick(square);
      return;
    }

    if (mode === 'play') {
      const piece = position[square];
      
      if (selectedSquare && selectedSquare !== square) {
        // Try to make a move
        const move = legalMoves.find(m => m.from === selectedSquare && m.to === square);
        if (move) {
          onPieceMove(move);
        }
        setSelectedSquare(null);
      } else if (piece && isCurrentPlayerPiece(piece, currentPlayer)) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  }, [mode, position, selectedSquare, currentPlayer, legalMoves, onSquareClick, onPieceMove]);

  const handleDragStart = useCallback((e: React.DragEvent, square: string) => {
    if (mode !== 'play') return;
    
    const piece = position[square];
    if (piece && isCurrentPlayerPiece(piece, currentPlayer)) {
      setDraggedPiece({ square, piece });
      e.dataTransfer.effectAllowed = 'move';
    }
  }, [mode, position, currentPlayer]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, square: string) => {
    e.preventDefault();
    
    if (!draggedPiece) return;
    
    const move = legalMoves.find(m => m.from === draggedPiece.square && m.to === square);
    if (move) {
      onPieceMove(move);
    }
    
    setDraggedPiece(null);
  }, [draggedPiece, legalMoves, onPieceMove]);

  const getSquareHighlight = useCallback((square: string) => {
    if (selectedSquare === square) return 'ring-4 ring-blue-400 ring-opacity-75';
    return '';
  }, [selectedSquare]);

  const isLegalMoveDestination = useCallback((square: string) => {
    if (!selectedSquare) return false;
    return legalMoves.some(move => move.from === selectedSquare && move.to === square);
  }, [selectedSquare, legalMoves]);

  const renderPiece = (square: string, piece: PieceType) => {
    if (!piece) return null;

    const isKing = piece.includes('king');
    const isRed = piece.includes('red');
    const isSelected = selectedSquare === square;
    const isDragging = draggedPiece?.square === square;

    return (
      <div
        className={cn(
          "w-8 h-8 md:w-12 md:h-12 rounded-full border-2 shadow-lg cursor-grab hover:scale-105 transition-transform flex items-center justify-center",
          isRed ? "bg-red-500 border-red-700" : "bg-gray-800 border-gray-900",
          isSelected && "ring-4 ring-blue-400",
          isDragging && "opacity-50"
        )}
        draggable={mode === 'play' && isCurrentPlayerPiece(piece, currentPlayer)}
        onDragStart={(e) => handleDragStart(e, square)}
      >
        {isKing && (
          <div className={cn(
            "w-4 h-4 md:w-6 md:h-6 rounded-full border",
            isRed ? "bg-red-700 border-red-800" : "bg-gray-600 border-gray-700"
          )} />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Game Board</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{currentPlayer === 'red' ? 'Red' : 'Black'} to move</span>
          <div className={cn(
            "w-3 h-3 rounded-full",
            currentPlayer === 'red' ? "bg-red-500" : "bg-gray-800"
          )} />
        </div>
      </div>
      
      <div 
        ref={boardRef}
        className="aspect-square max-w-lg mx-auto border-4 border-gray-800 rounded-lg overflow-hidden relative"
      >
        {ranks.map((rank) => (
          <div key={rank} className="flex">
            {files.map((file) => {
              const square = `${file}${rank}`;
              const piece = position[square];
              const isDark = isDarkSquare(square);
              const highlighted = getSquareHighlight(square);
              
              return (
                <div
                  key={square}
                  className={cn(
                    "w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer hover:bg-opacity-80 transition-colors relative",
                    isDark ? "bg-gray-400" : "bg-gray-100",
                    highlighted,
                    selectedSquare === square && "bg-blue-200"
                  )}
                  onClick={() => handleSquareClick(square)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, square)}
                >
                  {renderPiece(square, piece)}
                  
                  {/* Legal move indicator */}
                  {isLegalMoveDestination(square) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full opacity-60 shadow-sm" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Move Arrows Overlay */}
        {suggestedMove && (
          <MoveArrow
            move={suggestedMove}
            boardSize={boardSize}
            color="suggested"
          />
        )}
        {hoveredMove && hoveredMove !== suggestedMove && (
          <MoveArrow
            move={hoveredMove}
            boardSize={boardSize}
            color="hovered"
          />
        )}
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500 max-w-lg mx-auto px-2">
        {files.map(file => (
          <span key={file}>{file}</span>
        ))}
      </div>
    </div>
  );
}

function isCurrentPlayerPiece(piece: PieceType, currentPlayer: 'red' | 'black'): boolean {
  if (!piece) return false;
  return (currentPlayer === 'red' && piece.includes('red')) ||
         (currentPlayer === 'black' && piece.includes('black'));
}
