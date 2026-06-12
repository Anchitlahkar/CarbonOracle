import React from 'react';
import { Panel } from './Panel';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  level?: 1 | 2 | 3 | 4;
  compact?: boolean;
  status?: 'success' | 'warning' | 'danger' | 'info' | null;
  trend?: {
    value: number;
    isGood: boolean;
    label?: string;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtext,
  level = 2,
  compact = false,
  status = null,
  trend,
  className = '',
  ...props
}) => {
  return (
    <Panel
      level={level}
      compact={compact}
      status={status}
      className={`flex flex-col justify-between ${className}`}
      {...props}
    >
      <div className="flex flex-col">
        <span className="text-[14px] font-bold tracking-[0.15em] text-text-muted uppercase font-display opacity-80">{title}</span>
        <div className="flex items-baseline mt-1 space-x-1.5">
          <span className={`${compact ? 'text-[24px]' : 'text-3xl'} font-bold font-mono text-text-primary tracking-tighter`}>{value}</span>
          {unit && <span className="text-[14px] text-text-subtle font-mono ml-0.5">{unit}</span>}
        </div>
      </div>
      {(subtext || trend) && (
        <div className="flex items-center justify-between mt-2.5 text-[12px] w-full border-t border-white/[0.04] pt-2 font-mono tracking-tight">
          {subtext && <span className="text-text-muted/60 truncate max-w-[70%]">{subtext}</span>}
          {trend && (
            <span
              className={`font-bold shrink-0 px-1.5 py-0.5 rounded-sm ${
                trend.isGood ? 'text-accent-green bg-accent-green/5' : 'text-accent-red bg-accent-red/5'
              }`}
            >
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
          )}
        </div>
      )}
    </Panel>
  );
};

export default MetricCard;
