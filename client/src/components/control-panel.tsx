import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, BarChart3, RotateCcw, Eraser, RotateCw } from 'lucide-react';
import type { GameState } from '@shared/schema';
import { countPieces } from '@/lib/checkers-logic';

interface ControlPanelProps {
  gameState: GameState;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onReset: () => void;
  onClear: () => void;
  onFlip: () => void;
  onModeChange: (mode: 'setup' | 'play') => void;
}

export function ControlPanel({
  gameState,
  isAnalyzing,
  onAnalyze,
  onReset,
  onClear,
  onFlip,
  onModeChange
}: ControlPanelProps) {
  const pieceCounts = countPieces(gameState.position);

  return (
    <div className="space-y-6">
      {/* Game Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Controls</h3>
        <div className="space-y-3">
          <Button 
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyze Position
              </>
            )}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={onReset}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={onClear}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3"
            >
              <Eraser className="mr-1 h-4 w-4" />
              Clear
            </Button>
          </div>
          
          <Button 
            onClick={onFlip}
            variant="outline"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Flip Board
          </Button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mode</h3>
        <RadioGroup 
          value={gameState.mode} 
          onValueChange={(value: 'setup' | 'play') => onModeChange(value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="setup" id="setup" />
            <Label htmlFor="setup" className="cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Setup Position</div>
                <div className="text-sm text-gray-500">Click to place pieces</div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="play" id="play" />
            <Label htmlFor="play" className="cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Play Game</div>
                <div className="text-sm text-gray-500">Drag pieces to move</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Piece Count */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Piece Count</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-red-500 border border-red-700"></div>
              <span className="text-gray-700">Red</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{pieceCounts.red + pieceCounts.redKings}</div>
              <div className="text-xs text-gray-500">{pieceCounts.redKings} kings</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-900"></div>
              <span className="text-gray-700">Black</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{pieceCounts.black + pieceCounts.blackKings}</div>
              <div className="text-xs text-gray-500">{pieceCounts.blackKings} kings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Move History</h3>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {gameState.moveHistory.length > 0 ? (
            gameState.moveHistory.map((move, index) => (
              <div key={index} className="text-sm text-gray-600 font-mono">
                {move}
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400 italic">No moves yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
