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
    const arrowHeadSize = squareSize * 0.15;
    const arrowBodyWidth = squareSize * 0.08;
    
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
    suggested: 'stroke-purple-600 fill-purple-600',
    hovered: 'stroke-orange-500 fill-orange-500'
  };

  return (
    <svg 
      className={cn("absolute inset-0 pointer-events-none", className)}
      width={boardSize} 
      height={boardSize}
      style={{ zIndex: 10 }}
    >
      <defs>
        <marker
          id={`arrowhead-${color}`}
          markerWidth="10"
          markerHeight="7"
          refX="8"
          refY="3.5"
          orient="auto"
          className={arrowColors[color]}
        >
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      
      {/* Arrow body */}
      <line
        x1={arrow.fromX}
        y1={arrow.fromY}
        x2={arrow.toX}
        y2={arrow.toY}
        strokeWidth={arrow.arrowBodyWidth}
        markerEnd={`url(#arrowhead-${color})`}
        className={cn(
          "drop-shadow-sm",
          arrowColors[color],
          color === 'suggested' ? 'opacity-90' : 'opacity-75'
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