import React from 'react';
import { Panel } from './Panel';
import { TrendingDown } from 'lucide-react';

export interface ForecastPeriod {
  label: string; // e.g. "30d Horizon", "90d Horizon", "365d Horizon"
  baselineKg: number;
  momentumKg: number;
  optimizedKg: number;
  confidence: number; // e.g. 0.85
}

interface ForecastStripProps extends React.HTMLAttributes<HTMLDivElement> {
  periods: ForecastPeriod[];
  level?: 1 | 2 | 3 | 4;
}

export const ForecastStrip: React.FC<ForecastStripProps> = ({
  periods,
  level = 3,
  className = '',
  ...props
}) => {
  return (
    <Panel level={level} className={`w-full ${className}`} {...props}>
      <div className="flex items-center space-x-2 mb-3">
        <TrendingDown className="w-5 h-5 text-accent-green" />
        <span className="text-[18px] font-bold text-text-muted/70 uppercase tracking-[0.1em] font-display">
          Multi-Horizon Momentum Forecast
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {periods.map((period, index) => {
          const savingsPercent = Math.max(0, Math.round(((period.momentumKg - period.optimizedKg) / (period.momentumKg || 1)) * 100));
          return (
            <div 
              key={index}
              className="bg-bg-card/40 border border-white/[0.04] rounded-sm p-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[14px] uppercase font-mono tracking-tighter text-text-subtle">
                <span>{period.label}</span>
                <span className="text-accent-blue font-bold opacity-80">Conf: {Math.round(period.confidence * 100)}%</span>
              </div>

              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-[24px] font-bold font-mono text-text-primary tracking-tighter">
                  {Math.round(period.optimizedKg)}
                </span>
                <span className="text-[14px] font-mono text-text-muted/60 lowercase">kg CO₂e</span>
                {savingsPercent > 0 && (
                  <span className="text-[12px] font-mono text-accent-green bg-accent-green/5 border border-accent-green/10 px-1.5 py-0.5 rounded-sm ml-auto font-bold">
                    -{savingsPercent}% path
                  </span>
                )}
              </div>

              {/* Stacked pathway indicators */}
              <div className="space-y-1.5 text-[12px] font-mono border-t border-white/[0.03] pt-2 mt-2 uppercase tracking-tighter">
                <div className="flex justify-between">
                  <span className="text-text-subtle/50">Baseline:</span>
                  <span className="text-text-muted/80">{Math.round(period.baselineKg)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-subtle/50">Momentum:</span>
                  <span className="text-text-muted/80">{Math.round(period.momentumKg)} kg</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-accent-green/80">Optimized:</span>
                  <span className="text-accent-green">{Math.round(period.optimizedKg)} kg</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export default ForecastStrip;
