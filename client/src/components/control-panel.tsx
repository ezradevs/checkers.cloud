import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, BarChart3, RotateCcw, Eraser, RotateCw, Settings, Shield } from 'lucide-react';
import type { GameState } from '@shared/schema';
import { countPieces } from '@/lib/checkers-logic';

interface ControlPanelProps {
  gameState: GameState;
  isAnalyzing: boolean;
  analysisDepth: number;
  onAnalyze: () => void;
  onReset: () => void;
  onClear: () => void;
  onFlip: () => void;
  onModeChange: (mode: 'setup' | 'play') => void;
  onDepthChange: (depth: number) => void;
  onRulesChange: (rules: { forceTake: boolean; forceMultipleTakes: boolean }) => void;
  onOrientationChange: (orientation: 'normal' | 'inverted') => void;
  colorComplex: boolean;
  onColorComplexToggle: () => void;
}

export function ControlPanel({
  gameState,
  isAnalyzing,
  analysisDepth,
  onAnalyze,
  onReset,
  onClear,
  onFlip,
  onModeChange,
  onDepthChange,
  onRulesChange,
  onOrientationChange,
  colorComplex,
  onColorComplexToggle
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

      {/* Analysis Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Analysis Settings
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="depth-select" className="text-sm font-medium text-gray-700 mb-2 block">
              Search Depth (Engine Strength)
            </Label>
            <Select value={analysisDepth?.toString() || "4"} onValueChange={(value) => onDepthChange(parseInt(value))}>
              <SelectTrigger id="depth-select">
                <SelectValue placeholder="Select depth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Beginner (Depth 2) - Fast</SelectItem>
                <SelectItem value="3">Intermediate (Depth 3) - Balanced</SelectItem>
                <SelectItem value="4">Advanced (Depth 4) - Strong</SelectItem>
                <SelectItem value="5">Expert (Depth 5) - Strongest</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500 mt-1">
              Higher depth = stronger play but slower analysis
            </div>
          </div>
        </div>
      </div>

      {/* Game Rules */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Game Rules
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="force-take" className="text-sm font-medium">
                Force Take Rule
              </Label>
              <div className="text-xs text-gray-500">
                Must capture when possible
              </div>
            </div>
            <Switch
              id="force-take"
              checked={gameState.rules.forceTake}
              onCheckedChange={(checked) =>
                onRulesChange({ ...gameState.rules, forceTake: checked })
              }
            />
          </div>
          
          {gameState.rules.forceTake && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="force-multiple" className="text-sm font-medium">
                  Force Maximum Captures
                </Label>
                <div className="text-xs text-gray-500">
                  Must take longest sequence available
                </div>
              </div>
              <Switch
                id="force-multiple"
                checked={gameState.rules.forceMultipleTakes}
                onCheckedChange={(checked) =>
                  onRulesChange({ ...gameState.rules, forceMultipleTakes: checked })
                }
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="color-complex" className="text-sm font-medium">
                Switch Colour Complex
              </Label>
              <div className="text-xs text-gray-500">
                Shift playable squares (dark squares move by one)
              </div>
            </div>
            <Switch
              id="color-complex"
              checked={colorComplex}
              onCheckedChange={onColorComplexToggle}
            />
          </div>
        </div>
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
