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
    
    // Calculate exact angle and distance
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    
    // Arrow dimensions - smaller and more subtle
    const arrowHeadLength = squareSize * 0.15;
    const arrowBodyWidth = squareSize * 0.06;
    
    // Calculate precise positioning: start from actual edge of piece, end at exact center
    const pieceRadiusPixels = (squareSize * 0.75) / 2; // Piece is 75% of square size, so radius is 37.5%
    const adjustedFromX = fromX + (pieceRadiusPixels * Math.cos(angle));
    const adjustedFromY = fromY + (pieceRadiusPixels * Math.sin(angle));
    const adjustedToX = toX; // Exact center of destination square
    const adjustedToY = toY;
    
    // Calculate arrow head points
    const headX1 = adjustedToX - arrowHeadLength * Math.cos(angle - Math.PI / 6);
    const headY1 = adjustedToY - arrowHeadLength * Math.sin(angle - Math.PI / 6);
    const headX2 = adjustedToX - arrowHeadLength * Math.cos(angle + Math.PI / 6);
    const headY2 = adjustedToY - arrowHeadLength * Math.sin(angle + Math.PI / 6);

    return {
      fromX: adjustedFromX,
      fromY: adjustedFromY,
      toX: adjustedToX,
      toY: adjustedToY,
      angle,
      arrowBodyWidth,
      headX1,
      headY1,
      headX2,
      headY2
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
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      {/* Arrow body - main line */}
      <line
        x1={arrow.fromX}
        y1={arrow.fromY}
        x2={arrow.toX}
        y2={arrow.toY}
        strokeWidth={arrow.arrowBodyWidth}
        strokeLinecap="round"
        filter={`url(#shadow-${color})`}
        className={cn(
          arrowColors[color],
          color === 'suggested' ? 'opacity-90' : 'opacity-80'
        )}
      />
      
      {/* Arrow head - two angled lines */}
      <line
        x1={arrow.toX}
        y1={arrow.toY}
        x2={arrow.headX1}
        y2={arrow.headY1}
        strokeWidth={arrow.arrowBodyWidth}
        strokeLinecap="round"
        filter={`url(#shadow-${color})`}
        className={cn(
          arrowColors[color],
          color === 'suggested' ? 'opacity-90' : 'opacity-80'
        )}
      />
      <line
        x1={arrow.toX}
        y1={arrow.toY}
        x2={arrow.headX2}
        y2={arrow.headY2}
        strokeWidth={arrow.arrowBodyWidth}
        strokeLinecap="round"
        filter={`url(#shadow-${color})`}
        className={cn(
          arrowColors[color],
          color === 'suggested' ? 'opacity-90' : 'opacity-80'
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
                r={arrow.arrowBodyWidth * 1.5}
                className="fill-red-500 stroke-red-700 stroke-1 opacity-70"
              />
            );
          })}
        </g>
      )}
    </svg>
  );
}