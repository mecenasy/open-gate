'use client';

interface StepBudgetProps {
  label: string;
  current: number;
  max: number;
}

export function StepBudget({ label, current, max }: StepBudgetProps) {
  const ratio = max > 0 ? Math.min(1, current / max) : 0;
  const exhausted = current >= max && max > 0;
  return (
    <div className="text-xs flex items-center gap-2">
      <span className="text-muted">{label}:</span>
      <span className={['font-mono', exhausted ? 'text-amber-400' : 'text-text'].join(' ')}>
        {current} / {max}
      </span>
      <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
        <div
          className={[
            'h-full transition-all',
            exhausted ? 'bg-amber-500' : ratio >= 0.8 ? 'bg-amber-500' : 'bg-blue-500',
          ].join(' ')}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  );
}
