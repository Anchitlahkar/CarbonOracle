import React, { useEffect } from 'react';
import useCarbonStore from '../store/carbonStore';
import { 
  Panel, 
  SectionHeader, 
  StatusPill, 
  Skeleton, 
  PanelError,
  FadeIn
} from '../components/ui';
import { 
  Fingerprint, 
  ShieldAlert,
  Brain,
  Compass
} from 'lucide-react';

export const DNA: React.FC = () => {
  const { 
    isLoading, 
    error, 
    carbonDNAProfile, 
    fetchContext 
  } = useCarbonStore();

  useEffect(() => {
    if (!carbonDNAProfile) {
      fetchContext();
    }
  }, [carbonDNAProfile, fetchContext]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto font-body">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Skeleton className="h-72 lg:col-span-8" />
          <Skeleton className="h-72 lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto pt-12">
        <PanelError message={error} onRetry={fetchContext} />
      </div>
    );
  }

  if (!carbonDNAProfile) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <ShieldAlert className="mx-auto text-accent-amber" size={40} />
        <h3 className="text-[18px] font-bold font-display uppercase tracking-wider text-text-primary">NO PROFILE DATA</h3>
        <p className="text-[16px] text-text-muted">A behavioral carbon profile requires active synchronization.</p>
        <button onClick={fetchContext} className="px-4 py-2.5 rounded bg-accent-green text-bg-primary text-[16px] font-mono font-bold uppercase">
          Sync Profile
        </button>
      </div>
    );
  }

  const { archetype, archetypeConfidence, dimensions, evolution, archetypeEvidence } = carbonDNAProfile;

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 font-body">
      {/* Page Header */}
      <SectionHeader
        title="CARBON DNA REPORT"
        description="AI analysis profiling behavioral markers, consumption habits, and optimization readiness."
        actions={
          <div className="flex items-center space-x-2 text-[12px] font-mono text-text-muted/60">
            <Fingerprint size={14} className="text-accent-blue/60" />
            <span className="uppercase tracking-[0.2em] font-bold">DNA Analysis</span>
          </div>
        }
      />

      {/* Main Grid: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Left dossier panel */}
        <div className="lg:col-span-8 space-y-3.5">
          
          {/* Carbon DNA Report Header panel */}
          <Panel level={1} compact className="relative overflow-hidden p-5 space-y-3 bg-bg-surface/40 border-white/[0.04]">
            <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-white/[0.01] to-transparent pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[12px] font-mono text-text-muted/40 uppercase tracking-[0.25em] font-bold">// ARCHETYPE PROFILE</span>
                <h2 className="text-[24px] font-black font-display text-text-primary tracking-[0.05em] uppercase">
                  {archetype.replace(/([A-Z])/g, ' $1').trim()}
                </h2>
              </div>
              <StatusPill label="DNA REPORT" variant="blue" />
            </div>

            <div className="text-[16px] text-text-muted/90 leading-relaxed font-body font-medium">
              Cognitive behavior patterns mapping systemic readiness, intensity indices, and resistance points. This report reflects dynamic response vectors to optimization interventions.
            </div>

            {/* Matrix details */}
            <div className="grid grid-cols-3 gap-3 pt-3.5 border-t border-white/[0.04] text-[12px] font-mono uppercase tracking-tight">
              <div>
                <span className="text-text-muted/30 block text-[12px] tracking-[0.2em] font-bold mb-1">Match Confidence</span>
                <span className="text-text-primary/80 font-black text-[14px]">{archetypeConfidence}% MATCH</span>
              </div>
              <div>
                <span className="text-text-muted/30 block text-[12px] tracking-[0.2em] font-bold mb-1">Vector Direction</span>
                <span className="text-accent-blue/80 font-black text-[14px] truncate">{evolution.direction.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
              <div>
                <span className="text-text-muted/30 block text-[12px] tracking-[0.2em] font-bold mb-1">Report Status</span>
                <span className="text-accent-green/80 font-black text-[14px]">ACTIVE</span>
              </div>
            </div>
          </Panel>

          {/* Psychological Evidence factors */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 pl-1">
              <Brain size={16} className="text-text-muted/40" />
              <h4 className="text-[14px] font-bold text-text-muted/60 uppercase tracking-[0.2em] font-mono">
                Primary DNA Drivers
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {archetypeEvidence.map((ev, idx) => (
                <Panel key={idx} level={2} compact className="flex flex-col justify-between space-y-3.5 py-3 px-4 bg-bg-surface/30 border-white/[0.03]">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[12px] font-mono text-text-muted/40">
                      <span className="tracking-[0.1em] font-bold uppercase">Signal Vector {idx + 1}</span>
                      <span className="text-accent-blue/60 font-black tracking-tighter">-{ev.contribution}% CORE IMPACT</span>
                    </div>
                    <h5 className="text-[16px] font-bold text-text-primary/90 leading-tight uppercase tracking-tight">{ev.factor}</h5>
                  </div>
                  <p className="text-[16px] text-text-muted/70 leading-relaxed font-medium">{ev.reasoning}</p>
                </Panel>
              ))}
            </div>
          </div>
        </div>

        {/* Right dossier dimensions sidebar */}
        <div className="lg:col-span-4 space-y-3.5">
          <FadeIn delay={0.3}>
          {/* Dimensions meter */}
          <Panel level={2} compact className="space-y-4 p-4 bg-bg-surface/50 border-white/[0.04]">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <h3 className="text-[14px] font-bold text-text-muted/80 uppercase tracking-[0.2em] font-mono">
                Behavioral Dimensions
              </h3>
              <Compass size={16} className="text-text-muted/40" />
            </div>

            <div className="space-y-3.5">
              {[
                { label: 'Intensity', value: dimensions.emissionIntensity, color: 'bg-accent-red' },
                { label: 'Volatility', value: dimensions.behaviorVolatility, color: 'bg-accent-amber' },
                { label: 'Readiness', value: dimensions.optimizationReadiness, color: 'bg-accent-green' },
                { label: 'Resistance', value: dimensions.interventionResistance, color: 'bg-accent-amber' },
                { label: 'Reliability', value: dimensions.forecastReliability, color: 'bg-accent-blue' }
              ].map((dim, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[12px] font-mono tracking-tighter uppercase font-bold">
                    <span className="text-text-muted/50">{dim.label}</span>
                    <span className="text-text-primary/70">{dim.value}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.02] rounded-full overflow-hidden">
                    <div className={`h-full ${dim.color} rounded-full opacity-80`} style={{ width: `${dim.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Shift Potential & projected behavioral shifts */}
          <Panel level={2} compact className="space-y-3.5 p-4 bg-bg-surface/50 border-white/[0.04] mt-3.5">
            <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
              <h3 className="text-[14px] font-bold text-text-muted/80 uppercase tracking-[0.2em] font-mono">
                Cognitive Shift
              </h3>
              <span className="text-[12px] font-mono bg-accent-blue/5 border border-accent-blue/20 text-accent-blue/70 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest">
                {evolution.direction}
              </span>
            </div>

            <p className="text-[16px] text-text-muted/80 leading-relaxed font-body font-medium italic">
              "{evolution.reasoning}"
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/[0.03] font-mono text-[12px] uppercase tracking-tighter font-bold">
              <div>
                <span className="text-text-muted/30 block mb-1">30d Project</span>
                <span className={`text-[14px] font-black ${evolution.projected30dChangePercent < 0 ? 'text-accent-green/80' : 'text-accent-red/80'}`}>
                  {evolution.projected30dChangePercent > 0 ? '+' : ''}{evolution.projected30dChangePercent}%
                </span>
              </div>
              <div>
                <span className="text-text-muted/30 block mb-1">90d Project</span>
                <span className={`text-[14px] font-black ${evolution.projected90dChangePercent < 0 ? 'text-accent-green/80' : 'text-accent-red/80'}`}>
                  {evolution.projected90dChangePercent > 0 ? '+' : ''}{evolution.projected90dChangePercent}%
                </span>
              </div>
            </div>

            {/* Target projection shift */}
            <div className="p-3.5 bg-bg-card/50 border border-white/[0.03] rounded-sm space-y-1 font-mono text-[14px] mt-2">
              <span className="text-[12px] text-text-muted/40 block uppercase tracking-[0.2em] font-bold mb-1">Probable Shift Target</span>
              <div className="flex justify-between items-center text-text-primary/90 font-black tracking-tight">
                <span className="uppercase text-[16px] truncate max-w-[150px]">{evolution.futureProjection.projectedArchetype.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-accent-blue/80">{(evolution.futureProjection.probability * 100).toFixed(0)}% PROB</span>
              </div>
            </div>
          </Panel>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default DNA;
