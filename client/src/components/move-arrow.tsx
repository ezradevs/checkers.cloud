import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getSquareCoordinates } from '@/lib/checkers-logic';
import type { Move } from '@shared/schema';

interface MoveArrowProps {
  move: Move;
  boardSize: number;
  color?: 'suggested' | 'hovered';
  className?: string;
}

export function MoveArrow({ move, boardSize, color = 'suggested', className }: MoveArrowProps) {
  const arrow = useMemo(() => {
    const [fromRow, fromCol] = getSquareCoordinates(move.from);
    const [toRow, toCol] = getSquareCoordinates(move.to);
    
    // Convert to SVG coordinates (board is 8x8, so each square is boardSize/8)
    const squareSize = boardSize / 8;
    const fromX = (fromCol + 0.5) * squareSize;
    const fromY = (7 - fromRow + 0.5) * squareSize; // Flip Y for screen coordinates
    const toX = (toCol + 0.5) * squareSize;
    const toY = (7 - toRow + 0.5) * squareSize;
    
    // Calculate arrow properties
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    
    // Arrow head size
    const arrowHeadSize = squareSize * 0.2;
    const arrowBodyWidth = squareSize * 0.12;
    
    // Adjust start and end points to not overlap pieces
    const pieceRadius = squareSize * 0.3;
    const adjustedFromX = fromX + (pieceRadius * Math.cos(angle));
    const adjustedFromY = fromY + (pieceRadius * Math.sin(angle));
    const adjustedToX = toX - (pieceRadius * Math.cos(angle));
    const adjustedToY = toY - (pieceRadius * Math.sin(angle));
    
    return {
      fromX: adjustedFromX,
      fromY: adjustedFromY,
      toX: adjustedToX,
      toY: adjustedToY,
      angle,
      arrowHeadSize,
      arrowBodyWidth
    };
  }, [move.from, move.to, boardSize]);

  const arrowColors = {
    suggested: 'stroke-purple-500 fill-purple-500',
    hovered: 'stroke-orange-400 fill-orange-400'
  };

  return (
    <svg 
      className={cn("absolute inset-0 pointer-events-none", className)}
      width={boardSize} 
      height={boardSize}
      style={{ zIndex: 10 }}
    >
      <defs>
        <filter id={`shadow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
        <marker
          id={`arrowhead-${color}`}
          markerWidth="12"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          className={arrowColors[color]}
        >
          <polygon points="0 0, 12 5, 0 10" />
        </marker>
      </defs>
      
      {/* Arrow body with enhanced styling */}
      <line
        x1={arrow.fromX}
        y1={arrow.fromY}
        x2={arrow.toX}
        y2={arrow.toY}
        strokeWidth={arrow.arrowBodyWidth}
        strokeLinecap="round"
        markerEnd={`url(#arrowhead-${color})`}
        filter={`url(#shadow-${color})`}
        className={cn(
          arrowColors[color],
          color === 'suggested' ? 'opacity-95' : 'opacity-85'
        )}
      />
      
      {/* Capture indicator */}
      {move.captures && move.captures.length > 0 && (
        <g>
          {move.captures.map((captureSquare, index) => {
            const [captureRow, captureCol] = getSquareCoordinates(captureSquare);
            const captureX = (captureCol + 0.5) * (boardSize / 8);
            const captureY = (7 - captureRow + 0.5) * (boardSize / 8);
            return (
              <circle
                key={index}
                cx={captureX}
                cy={captureY}
                r={arrow.arrowBodyWidth}
                className="fill-red-500 stroke-red-700 stroke-2 opacity-80"
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}