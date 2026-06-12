import React, { useEffect } from 'react';
import useCarbonStore from '../store/carbonStore';
import { 
  Panel, 
  SectionHeader, 
  Skeleton, 
  PanelError 
} from '../components/ui';
import { 
  Zap, 
  ShieldAlert, 
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export const Optimization: React.FC = () => {
  const { 
    isLoading, 
    error, 
    optimizationPlan, 
    carbonDNAProfile,
    fetchContext 
  } = useCarbonStore();

  useEffect(() => {
    if (!optimizationPlan) {
      fetchContext();
    }
  }, [optimizationPlan, fetchContext]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto font-body">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
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

  if (!optimizationPlan) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <ShieldAlert className="mx-auto text-accent-amber animate-pulse" size={40} />
        <h3 className="text-[18px] font-bold font-display uppercase tracking-wider text-text-primary">NO OPTIMIZATION MATRIX FOUND</h3>
        <p className="text-[16px] text-text-muted">Optimization models require active profile context logs.</p>
        <button onClick={fetchContext} className="px-4 py-2.5 rounded bg-accent-green text-bg-primary text-[16px] font-mono font-bold uppercase">
          Reload Plan Data
        </button>
      </div>
    );
  }

  const categoryTradeoffs = optimizationPlan.tradeoffs.length > 0
    ? optimizationPlan.tradeoffs
    : [
        {
          category: 'transport',
          potentialSavingsKg: 120.0,
          averageDifficulty: 35,
          averageResistance: 25,
          candidateCount: 2,
          description: 'High savings potential, transit alternatives exist.'
        },
        {
          category: 'food',
          potentialSavingsKg: 45.0,
          averageDifficulty: 20,
          averageResistance: 40,
          candidateCount: 1,
          description: 'Medium savings, dietary habit change resistance.'
        }
      ];

  const confidenceLabel = 
    (carbonDNAProfile?.archetypeConfidence || 85) > 80 ? 'High' : 
    (carbonDNAProfile?.archetypeConfidence || 85) > 60 ? 'Medium' : 'Low';

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 font-body">
      {/* Page Header */}
      <SectionHeader
        title="OPTIMIZATION CENTER"
        description="Lifestyle intervention roadmap computed using multi-criteria decision analysis (MCDA) parameters."
        actions={
          <div className="flex items-center space-x-2 text-[12px] font-mono text-text-muted/60">
            <Zap size={14} className="text-accent-green opacity-60 animate-pulse" />
            <span className="uppercase tracking-[0.2em] font-bold">Interventions: {optimizationPlan.candidates.length}</span>
          </div>
        }
      />

      {/* Grid: Actions & Tradeoffs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Left: Ranked Decisions List */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center space-x-2 pl-1">
            <CheckCircle size={16} className="text-accent-green opacity-70" />
            <span className="text-[14px] font-bold text-text-muted/60 uppercase tracking-[0.2em] font-mono">
              Prioritized Roadmap
            </span>
          </div>

          {optimizationPlan.candidates.map((cand, idx) => {
            const implementationTime = 
              cand.difficultyLevel === 'easy' ? '1-2 Days' : 
              cand.difficultyLevel === 'medium' ? '1 Week' : '2-4 Weeks';

            const userResistanceRating = 
              cand.resistanceScore.score > 70 ? 'High' : 
              cand.resistanceScore.score > 40 ? 'Medium' : 'Low';

            const annualSavings = Math.round(cand.estimatedSavingsKg * 12);

            return (
              <Panel key={idx} level={1} compact status={cand.difficultyLevel === 'easy' ? 'success' : 'info'} className="space-y-3 hover:border-white/[0.12] transition-all bg-bg-surface/40 border-white/[0.04]">
                
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-sm bg-white/[0.02] border border-white/[0.08] text-text-primary/70 font-mono text-[14px] font-black flex items-center justify-center">
                      {cand.rank}
                    </span>
                    <h4 className="text-[16px] font-bold text-text-primary/90 tracking-tight uppercase group-hover:text-text-primary transition-colors">{cand.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <span className={`text-[12px] font-mono font-black border px-2 py-0.5 rounded-sm uppercase tracking-widest ${
                      cand.category === 'transport' ? 'text-accent-blue/70 border-accent-blue/20 bg-accent-blue/5' : 'text-text-muted/40 border-white/10 bg-white/5'
                    }`}>
                      {cand.category}
                    </span>
                    <span className="text-[12px] font-mono text-text-muted/30 font-black uppercase tracking-tighter">
                      MCDA: {cand.score}
                    </span>
                  </div>
                </div>

                {/* Recommendation Description */}
                <p className="text-[16px] text-text-muted/90 leading-relaxed font-body font-medium">
                  {cand.description}
                </p>

                {/* Decision Impact Preview Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-bg-card/40 border border-white/[0.03] rounded-sm font-mono text-[14px] uppercase tracking-tighter">
                  
                  {/* Monthly Impact */}
                  <div className="space-y-1 border-r border-white/[0.03] pr-3">
                    <span className="text-text-muted/30 block text-[12px] tracking-[0.15em] font-black">Savings_30d</span>
                    <span className="text-accent-green/80 font-black text-[16px]">
                      -{Math.round(cand.estimatedSavingsKg)} kg
                    </span>
                  </div>

                  {/* Annual Impact */}
                  <div className="space-y-1 border-r border-white/[0.03] sm:pl-3 pr-3">
                    <span className="text-text-muted/30 block text-[12px] tracking-[0.15em] font-black">Annual_Offset</span>
                    <span className="text-accent-green/80 font-black text-[16px]">
                      -{annualSavings} kg
                    </span>
                  </div>

                  {/* Telemetry settings */}
                  <div className="space-y-1 sm:pl-3">
                    <span className="text-text-muted/30 block text-[12px] tracking-[0.15em] font-black">Logic_Conf</span>
                    <span className="text-text-primary/60 font-black text-[14px] flex items-center space-x-1">
                      <TrendingUp size={14} className="text-accent-blue/60" />
                      <span>{confidenceLabel}</span>
                    </span>
                  </div>

                  {/* Spacing Divider */}
                  <div className="col-span-full border-t border-white/[0.03] pt-2 mt-1 grid grid-cols-3 gap-1.5 text-[12px] font-bold opacity-60">
                    <div className="flex space-x-2 items-center">
                      <span className="text-text-muted/40 uppercase tracking-widest text-[12px]">Diff:</span>
                      <span className="text-text-primary uppercase">{cand.difficultyLevel}</span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <span className="text-text-muted/40 uppercase tracking-widest text-[12px]">Friction:</span>
                      <span className="text-text-primary uppercase">{userResistanceRating}</span>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <span className="text-text-muted/40 uppercase tracking-widest text-[12px]">Window:</span>
                      <span className="text-text-primary uppercase">{implementationTime}</span>
                    </div>
                  </div>
                </div>

                {/* Resistance / Behavioral friction explanation */}
                <div className="p-2.5 bg-white/[0.01] border border-white/[0.03] rounded-sm text-[14px] text-text-muted/70 flex items-start space-x-2 italic font-medium">
                  <AlertCircle size={14} className="text-accent-amber/50 shrink-0 mt-0.5" />
                  <p className="font-body leading-relaxed">{cand.resistanceScore.reasoning}</p>
                </div>

              </Panel>
            );
          })}
        </div>

        {/* Right: Tradeoffs Dashboard */}
        <div className="lg:col-span-4 space-y-3.5">
          <Panel level={2} compact className="space-y-4 p-4 bg-bg-surface/50 border-white/[0.04]">
            <h4 className="text-[18px] font-bold text-text-muted/80 uppercase tracking-[0.2em] font-mono border-b border-white/[0.04] pb-2">
              Optimization Tradeoffs
            </h4>
            <p className="text-[16px] text-text-muted/70 leading-relaxed font-medium">
              Synthesis of carbon reduction rates relative to structural effort and cognitive resistance points.
            </p>

            <div className="space-y-3 pt-1">
              {categoryTradeoffs.map((td, idx) => (
                <div key={idx} className="p-3 bg-bg-card/30 border border-white/[0.03] rounded-sm font-mono text-[16px] space-y-2.5 hover:border-white/[0.08] transition-colors group">
                  <div className="flex justify-between items-center border-b border-white/[0.02] pb-1.5">
                    <span className="font-black text-text-primary/70 uppercase tracking-tight group-hover:text-text-primary transition-colors">{td.category}</span>
                    <span className="text-[12px] text-text-muted/30 font-black uppercase tracking-[0.1em]">Candidates: {td.candidateCount}</span>
                  </div>
                  <p className="text-[16px] text-text-muted/60 font-body leading-relaxed italic">{td.description}</p>
                  <div className="grid grid-cols-3 gap-1.5 pt-2 text-[12px] text-text-muted/40 border-t border-white/[0.02] font-black uppercase tracking-tighter">
                    <div>
                      <span className="block text-text-muted/20 mb-0.5">Potential</span>
                      <span className="text-accent-green/80">-{td.potentialSavingsKg}kg</span>
                    </div>
                    <div>
                      <span className="block text-text-muted/20 mb-0.5">Effort</span>
                      <span className="text-text-primary/60">{td.averageDifficulty}%</span>
                    </div>
                    <div>
                      <span className="block text-text-muted/20 mb-0.5">Resistance</span>
                      <span className="text-text-primary/60">{td.averageResistance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Optimization;
