import React from 'react';
import { Panel } from './Panel';
import { Sparkles } from 'lucide-react';

interface IntelligenceBriefProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  badge?: string;
  narrative: string;
  bulletPoints?: string[];
  forecastConfidence?: 'Low' | 'Medium' | 'High';
  behaviorFreshness?: string;
  modelIntegrity?: number;
  level?: 1 | 2 | 3 | 4;
  status?: 'success' | 'warning' | 'danger' | 'info' | null;
}

export const IntelligenceBrief: React.FC<IntelligenceBriefProps> = ({
  title = "Intelligence Briefing",
  badge,
  narrative,
  bulletPoints = [],
  forecastConfidence,
  behaviorFreshness,
  modelIntegrity,
  level = 1,
  status = 'info',
  className = '',
  ...props
}) => {
  // Highlights text like "6% this week" or "Transportation" or "transit"
  const renderFormattedNarrative = (text: string) => {
    const keywords = /(improved \d+%\s*(?:this\s+week)?|\d+%\s*reduction|\d+\s*kg\s*CO₂e|\d+,\d+\s*vehicle\s*km|Transportation|Food|Energy|Shopping|High|Medium|Low|daily\s+emissions|optimization\s+pathway|aggressive\s+pathway)/gi;
    
    if (!text) return '';
    const parts = text.split(keywords);
    
    return parts.map((part, index) => {
      if (part.match(keywords)) {
        return (
          <span key={index} className="text-text-primary font-semibold bg-white/5 px-1.5 py-0.5 rounded-sm border border-white/5 font-mono text-[14px] tracking-tight">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Panel level={level} status={status} className={`relative flex flex-col justify-between ${className}`} {...props}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-accent-blue" />
            <h3 className="text-[18px] font-bold text-text-primary uppercase tracking-widest font-display">
              {title}
            </h3>
          </div>
          {badge && (
            <span className="text-[12px] font-mono bg-accent-blue/5 border border-accent-blue/20 text-accent-blue/80 px-2 py-0.5 rounded-sm uppercase font-bold tracking-tighter">
              {badge}
            </span>
          )}
        </div>

        {/* Narrative Paragraph */}
        <p className="text-[16px] text-text-muted/90 leading-relaxed font-body font-normal">
          {renderFormattedNarrative(narrative)}
        </p>

        {/* Bullet Points */}
        {bulletPoints.length > 0 && (
          <ul className="mt-3.5 space-y-2.5 border-t border-white/[0.03] pt-2.5">
            {bulletPoints.map((point, idx) => (
              <li key={idx} className="flex items-start text-[16px] text-text-muted font-body">
                <span className="inline-block w-2 h-2 rounded-full bg-accent-blue/60 mt-2 mr-2.5 shrink-0" />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Telemetry Footer */}
      {(forecastConfidence || behaviorFreshness || modelIntegrity !== undefined) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-2.5 border-t border-white/[0.04] text-[12px] text-text-subtle font-mono uppercase tracking-tight">
          {forecastConfidence && (
            <div className="flex items-center space-x-1.5">
              <span className="opacity-60">Confidence:</span>
              <span className={`font-bold ${
                forecastConfidence === 'High' ? 'text-accent-green' :
                forecastConfidence === 'Medium' ? 'text-accent-amber' :
                'text-accent-red'
              }`}>{forecastConfidence}</span>
            </div>
          )}

          {behaviorFreshness && (
            <div className="flex items-center space-x-1.5 border-l border-white/5 pl-4">
              <span className="opacity-60">Freshness:</span>
              <span className="text-text-primary/70">{behaviorFreshness}</span>
            </div>
          )}

          {modelIntegrity !== undefined && (
            <div className="flex items-center space-x-1.5 border-l border-white/5 pl-4">
              <span className="opacity-60">Integrity:</span>
              <span className="text-accent-blue font-bold">{modelIntegrity}%</span>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
};

export default IntelligenceBrief;
