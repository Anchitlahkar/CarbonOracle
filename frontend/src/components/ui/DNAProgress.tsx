import React from 'react';

interface DNAProgressProps {
  label: string;
  value: number; // 0 to 100
  color?: 'green' | 'blue' | 'amber' | 'red';
  className?: string;
}

export const DNAProgress: React.FC<DNAProgressProps> = ({
  label,
  value,
  color = 'blue',
  className = '',
}) => {
  const barColors = {
    green: 'bg-accent-green',
    blue: 'bg-accent-blue',
    amber: 'bg-accent-amber',
    red: 'bg-accent-red',
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex justify-between text-[14px] font-mono">
        <span className="text-text-muted uppercase tracking-wider">{label}</span>
        <span className="text-text-primary font-bold">{value}%</span>
      </div>
      <div className="h-3 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.02]">
        <div
          className={`h-full rounded-full ${barColors[color]} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default DNAProgress;
