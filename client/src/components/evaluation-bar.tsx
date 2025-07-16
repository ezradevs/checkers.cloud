import { cn } from '@/lib/utils';

interface EvaluationBarProps {
  evaluation: number;
  className?: string;
}

export function EvaluationBar({ evaluation, className }: EvaluationBarProps) {
  // Convert evaluation to percentage (clamped between -1000 and 1000)
  const clampedEval = Math.max(-1000, Math.min(1000, evaluation));
  const percentage = ((clampedEval + 1000) / 2000) * 100;
  
  // Determine evaluation text and color
  const getEvaluationText = (evalValue: number) => {
    if (Math.abs(evalValue) > 500) return Math.abs(evalValue) > 800 ? 'Winning' : 'Advantage';
    if (Math.abs(evalValue) > 200) return 'Better';
    if (Math.abs(evalValue) > 50) return 'Slightly Better';
    return 'Equal';
  };

  const getEvaluationColor = (evalValue: number) => {
    if (evalValue > 500) return 'text-red-700';
    if (evalValue > 200) return 'text-red-600';
    if (evalValue > 50) return 'text-red-500';
    if (evalValue < -500) return 'text-gray-700';
    if (evalValue < -200) return 'text-gray-600';
    if (evalValue < -50) return 'text-gray-500';
    return 'text-gray-800';
  };

  const player = evaluation >= 0 ? 'Red' : 'Black';
  const absEval = Math.abs(evaluation);

  return (
    <div className={cn("bg-white rounded-xl shadow-lg p-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Position Evaluation</h3>
        <div className={cn("text-sm font-medium", getEvaluationColor(evaluation))}>
          {player}: {getEvaluationText(absEval)}
        </div>
      </div>
      
      {/* Evaluation Bar */}
      <div className="relative w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
        {/* Black side (left) */}
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-gray-800 to-gray-600 transition-all duration-300"
          style={{ width: `${100 - percentage}%` }}
        />
        
        {/* Red side (right) */}
        <div 
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 to-red-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Center line */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white transform -translate-x-0.5" />
        
        {/* Evaluation indicator */}
        <div 
          className="absolute top-1/2 w-2 h-6 bg-white border-2 border-gray-400 rounded-sm transform -translate-y-1/2 -translate-x-1 transition-all duration-300 shadow-md"
          style={{ left: `${percentage}%` }}
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>Black</span>
        <span className="font-medium">
          {evaluation > 0 ? `+${evaluation}` : evaluation}
        </span>
        <span>Red</span>
      </div>
    </div>
  );
}