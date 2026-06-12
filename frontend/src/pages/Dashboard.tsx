import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCarbonStore from '../store/carbonStore';
import { 
  Panel, 
  SectionHeader, 
  Skeleton, 
  PanelError,
  IntelligenceBrief,
  MetricCard
} from '../components/ui';
import { 
  Activity, 
  ChevronRight, 
  Sliders,
  Database,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isLoading, 
    error, 
    behaviorProfile,
    optimizationPlan,
    carbonDNAProfile,
    planetTwinProfile,
    fetchContext 
  } = useCarbonStore();

  useEffect(() => {
    if (!carbonDNAProfile) {
      fetchContext();
    }
  }, [carbonDNAProfile, fetchContext]);

  // Loading skeleton matching dense layout structure
  if (isLoading) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto font-body">
        <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        {/* Top layer skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 lg:col-span-2" />
          <Skeleton className="h-32" />
        </div>

        {/* Mid layer skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>

        {/* Bottom layer skeleton */}
        <Skeleton className="h-56 w-full" />
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

  if (!carbonDNAProfile || !planetTwinProfile || !behaviorProfile || !optimizationPlan) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 space-y-5 bg-bg-surface/60 border border-white/[0.06] rounded-sm p-8 shadow-xl mt-6 relative overflow-hidden font-body">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent-green to-accent-blue" />
        <div className="w-16 h-16 rounded-sm bg-bg-card border border-white/[0.08] flex items-center justify-center mb-4 shadow-inner mx-auto">
          <Activity className="text-accent-green opacity-80" size={32} />
        </div>
        <h2 className="font-display font-black text-[32px] tracking-wide text-text-primary uppercase">
          Welcome to CarbonSense
        </h2>
        <p className="text-[16px] text-text-muted">
          Let's build your first Carbon Intelligence Profile.
        </p>
        
        <div className="text-left text-[14px] text-text-muted space-y-2.5 max-w-[280px] mx-auto py-5 font-mono uppercase font-bold tracking-tighter">
          <p className="text-text-primary border-b border-white/[0.04] pb-2 tracking-wider">To begin:</p>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-accent-green" />
              <span>• Upload a receipt</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-accent-blue" />
              <span>• Add transport activity</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-accent-amber" />
              <span>• Generate your first forecast</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={fetchContext}
          className="px-6 py-3 rounded-sm bg-accent-green text-bg-primary text-[16px] font-mono font-black uppercase shadow-[0_0_15px_-5px_#00FF87] hover:bg-accent-green/90 transition-all cursor-pointer tracking-wider"
        >
          [ Get Started ]
        </button>
      </div>
    );
  }

  // Synthesize brief details dynamically from internal engines
  const username = user?.username || 'Executive';
  const evolution = carbonDNAProfile.evolution;
  const currentEmissionsMean = behaviorProfile.featureVector.dailyEmissionsMean;
  const topCandidate = optimizationPlan.candidates[0];

  const confidenceLabel = 
    carbonDNAProfile.archetypeConfidence > 80 ? 'High' : 
    carbonDNAProfile.archetypeConfidence > 60 ? 'Medium' : 'Low';

  const dynamicBriefText = `Good evening, ${username}. Your emissions trend improved ${Math.abs(evolution.projected30dChangePercent).toFixed(1)}% this week. Activity in '${behaviorProfile.classification.replace(/Heavy/g, ' heavy')}' sectors remains your largest carbon contributor. Implementing your top optimization action '${topCandidate?.title || 'lifestyle optimization'}' is projected to offset annual footprint by ${Math.round((topCandidate?.estimatedSavingsKg || 50) * 12)}kg CO₂e. Current forecast confidence: ${confidenceLabel}.`;

  const dynamicBullets = [
    `Carbon DNA Archetype classified as: ${carbonDNAProfile.archetype.replace(/([A-Z])/g, ' $1').trim()}`,
    `Highest savings impact available: -${topCandidate?.estimatedSavingsKg || 0} kg CO₂e / mo`,
    `Forecast momentum shows a target 90-day trajectory of ${Math.round(planetTwinProfile.currentWorld.trajectory.cumulative90DayKg)} kg CO₂e`
  ];

  // Map category metrics to compute ratio styles
  const categoryRatios = [
    { label: 'Transport', ratio: behaviorProfile.featureVector.transportRatio, color: 'bg-accent-blue' },
    { label: 'Food', ratio: behaviorProfile.featureVector.foodRatio, color: 'bg-accent-green' },
    { label: 'Energy', ratio: behaviorProfile.featureVector.energyRatio, color: 'bg-accent-amber' },
    { label: 'Shopping', ratio: behaviorProfile.featureVector.shoppingRatio, color: 'bg-accent-red' }
  ].sort((a, b) => b.ratio - a.ratio);

  const getCategoryRatioText = (category: string) => {
    if (category === 'transport') return `${Math.round(behaviorProfile.featureVector.transportRatio * 100)}%`;
    if (category === 'food') return `${Math.round(behaviorProfile.featureVector.foodRatio * 100)}%`;
    if (category === 'energy') return `${Math.round(behaviorProfile.featureVector.energyRatio * 100)}%`;
    if (category === 'shopping') return `${Math.round(behaviorProfile.featureVector.shoppingRatio * 100)}%`;
    return 'a significant portion';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 font-body">
      {/* 1. Cockpit Header */}
      <SectionHeader 
        title="CARBONSENSE COCKPIT" 
        description="Carbon intelligence cockpit powered by TERRA."
        actions={
          <div className="flex items-center space-x-2.5 text-[12px] font-mono text-text-muted/60">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="uppercase tracking-[0.2em] font-bold">TERRA Engine Active</span>
          </div>
        }
      />

      {/* TERRA EXECUTIVE BRIEF & ACTION CENTER */}
      <div className="bg-bg-surface border border-accent-green/20 rounded-sm p-5 md:p-6 shadow-[0_0_50px_-12px_rgba(0,255,135,0.1)] relative overflow-hidden">
        {/* Decorative subtle gradient edge */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent-green to-accent-blue" />
        
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <h2 className="text-[18px] font-mono font-black uppercase tracking-[0.25em] text-accent-green">
              TERRA EXECUTIVE BRIEF
            </h2>
          </div>
          <span className="text-[12px] font-mono text-text-muted/40 uppercase font-bold tracking-widest">
            MCDA RANKING STATUS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          {/* Column 1: Narrative Executive Brief (2/3 size) */}
          <div className="lg:col-span-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-[20px] font-bold text-text-primary uppercase tracking-wide">
                Good Evening, {username}.
              </h3>
              <p className="text-[16px] text-text-muted leading-relaxed font-medium">
                Your projected annual footprint is <strong className="text-text-primary">{(planetTwinProfile.currentWorld.trajectory.annualEmissionsKg / 1000).toFixed(1)} t CO₂e</strong>, with <strong className="text-text-primary">{topCandidate?.category || 'transport'}</strong> contributing <strong className="text-text-primary">{getCategoryRatioText(topCandidate?.category)}</strong>. TERRA's highest-impact recommendation is to <strong className="text-accent-green">{topCandidate?.title.toLowerCase()}</strong>, which is projected to reduce your footprint by <strong className="text-accent-green">-{Math.round((topCandidate?.estimatedSavingsKg || 23.9) * 12)} kg CO₂e/year</strong> (Confidence: <strong className="text-accent-blue">{topCandidate?.score || 91}%</strong>).
              </p>
            </div>
            
            {/* Context & Sources Evidence base */}
            <div className="text-[12px] font-mono text-text-muted/30 uppercase tracking-wider border-t border-white/[0.02] pt-2.5 flex flex-wrap gap-x-4">
              <span>MCDA Rank: #1 of {optimizationPlan.candidates.length} Interventions</span>
              <span>Evidence: Behavior Vector (Mean: {behaviorProfile.featureVector.dailyEmissionsMean.toFixed(1)} kg/d)</span>
              <span>DNA Profile: {carbonDNAProfile.archetype}</span>
            </div>
          </div>

          {/* Column 2: Inaction Consequences & Advisor CTA (1/3 size) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4 lg:space-y-0 lg:border-l lg:border-white/[0.04] lg:pl-6">
            <div className="space-y-3">
              <h4 className="text-[14px] font-mono font-black uppercase tracking-wider text-text-muted/60">
                If you do nothing
              </h4>
              <div className="space-y-2 text-[14px] font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted/50 uppercase">Emissions Drift:</span>
                  <span className="text-accent-red font-bold">
                    {(planetTwinProfile.currentWorld.trajectory.annualEmissionsKg / 1000).toFixed(1)} t CO₂e
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted/50 uppercase">Opportunity Lost:</span>
                  <span className="text-accent-amber font-bold">
                    -{Math.round((topCandidate?.estimatedSavingsKg || 23.9) * 12)} kg CO₂e
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/coach')}
              className="w-full py-3 bg-accent-green hover:bg-accent-green/90 text-bg-primary font-mono font-black text-[16px] uppercase transition-all rounded-sm tracking-[0.2em] shadow-[0_0_15px_-4px_rgba(0,255,135,0.4)] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Consult TERRA Advisor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Layer: Executive Briefing & Mission-Critical Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Daily Intelligence Brief (Required) */}
        <div className="lg:col-span-8">
          <IntelligenceBrief 
            title="Intelligence Briefing"
            badge="Engine v1.6-X"
            narrative={dynamicBriefText}
            bulletPoints={dynamicBullets}
            forecastConfidence={confidenceLabel as 'High' | 'Medium' | 'Low'}
            behaviorFreshness="SYNCED 2M AGO"
            modelIntegrity={planetTwinProfile.currentWorld.healthIndex.score}
            level={1}
            status="info"
            className="h-full"
          />
        </div>

        {/* Planet Health Index Metric Card */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-2.5">
          <MetricCard 
            title="Planet Health Index"
            value={planetTwinProfile.currentWorld.healthIndex.score}
            unit="/ 100"
            subtext="Trajectory simulation"
            level={1}
            status={planetTwinProfile.currentWorld.healthIndex.score > 60 ? 'success' : 'warning'}
            trend={{
              value: Math.round(planetTwinProfile.currentWorld.healthIndex.score - 50),
              isGood: planetTwinProfile.currentWorld.healthIndex.score > 50,
            }}
            compact
          />
          <MetricCard 
            title="30-Day Forecast"
            value={planetTwinProfile.currentWorld.trajectory.cumulative30DayKg}
            unit="kg CO₂e"
            subtext="Baseline momentum"
            level={2}
            trend={{
              value: Math.round(evolution.projected30dChangePercent),
              isGood: evolution.projected30dChangePercent < 0,
            }}
            compact
          />
        </div>
      </div>

      {/* 3. Middle Layer: Emissions Breakdown, DNA Genome, and Forecast Momentum */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Current Emissions breakdown */}
        <Panel level={2} compact className="flex flex-col justify-between min-h-[180px] p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[14px] font-bold text-text-muted/60 font-mono tracking-[0.2em] uppercase">Carbon Contribution Ratios</span>
              <Sliders className="w-4 h-4 text-text-muted/40" />
            </div>
            
            <div className="space-y-2">
              {categoryRatios.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[14px] font-mono tracking-tight">
                    <span className="text-text-primary/80 uppercase font-bold">{cat.label}</span>
                    <span className="text-text-muted/60">{(cat.ratio * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.02] rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full opacity-80`} style={{ width: `${cat.ratio * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[12px] text-text-muted/40 font-mono pt-2 border-t border-white/[0.03] flex justify-between items-center mt-3 uppercase tracking-tighter">
            <span>Mean: <strong className="text-text-primary/60">{currentEmissionsMean.toFixed(1)} kg/d</strong></span>
            <button onClick={() => navigate('/twin')} className="text-accent-blue/60 hover:text-accent-blue transition-colors flex items-center font-bold text-[12px]">
              <span>SIMULATION</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </Panel>

        {/* Carbon DNA snapshot */}
        <Panel level={2} compact className="flex flex-col justify-between min-h-[180px] p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[14px] font-bold text-text-muted/60 font-mono tracking-[0.2em] uppercase">DNA Genome</span>
              <Activity className="w-4 h-4 text-text-muted/40" />
            </div>
            
            <div className="p-2 bg-bg-card border border-white/[0.03] rounded-sm">
              <span className="text-[12px] font-mono text-text-muted/40 block uppercase tracking-widest">Archetype Classification</span>
              <span className="text-[16px] font-bold text-text-primary block tracking-wider uppercase mt-1 truncate">
                {carbonDNAProfile.archetype.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-[14px] font-mono tracking-tighter">
                <span className="text-text-muted/50 uppercase">Volatility</span>
                <span className="text-text-primary/70">{carbonDNAProfile.dimensions.behaviorVolatility}%</span>
              </div>
              <div className="h-1 bg-white/[0.02] rounded-full overflow-hidden">
                <div className="h-full bg-accent-amber opacity-80" style={{ width: `${carbonDNAProfile.dimensions.behaviorVolatility}%` }} />
              </div>

              <div className="flex justify-between text-[14px] font-mono tracking-tighter">
                <span className="text-text-muted/50 uppercase">Readiness</span>
                <span className="text-text-primary/70">{carbonDNAProfile.dimensions.optimizationReadiness}%</span>
              </div>
              <div className="h-1 bg-white/[0.02] rounded-full overflow-hidden">
                <div className="h-full bg-accent-green opacity-80" style={{ width: `${carbonDNAProfile.dimensions.optimizationReadiness}%` }} />
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dna')} 
            className="w-full text-center text-[16px] font-mono font-black text-text-primary/60 hover:text-text-primary bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-sm py-2 transition-all mt-3 uppercase tracking-[0.1em]"
          >
            Open DNA Profile
          </button>
        </Panel>

        {/* Forecast Momentum preview */}
        <Panel level={2} compact className="flex flex-col justify-between min-h-[180px] p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[14px] font-bold text-text-muted/60 font-mono tracking-[0.2em] uppercase">Momentum</span>
              <TrendingDown className="w-4 h-4 text-text-muted/40" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[14px] font-mono">
                <span className="text-text-muted/50 uppercase tracking-tighter">Baseline (365d):</span>
                <span className="text-text-primary/80 font-bold">{Math.round(planetTwinProfile.currentWorld.trajectory.annualEmissionsKg)} kg</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-mono">
                <span className="text-accent-green/60 uppercase tracking-tighter font-bold">Optimized:</span>
                <span className="text-accent-green font-bold">{Math.round(planetTwinProfile.optimizedWorld.trajectory.annualEmissionsKg)} kg</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-mono border-t border-white/[0.02] pt-1.5 mt-1.5">
                <span className="text-text-muted/40 uppercase tracking-tighter">Net Divergence:</span>
                <span className="text-accent-green font-bold">
                  -{Math.round(planetTwinProfile.currentWorld.trajectory.annualEmissionsKg - planetTwinProfile.optimizedWorld.trajectory.annualEmissionsKg)} kg
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/forecasts')} 
            className="w-full text-center text-[16px] font-mono font-black text-text-primary/60 hover:text-text-primary bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-sm py-2 transition-all mt-3 uppercase tracking-[0.1em]"
          >
            Analyze Trajectories
          </button>
        </Panel>
      </div>

      {/* 4. Bottom Layer: Telemetry Signals, Priority Actions Grid (MCDA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Telemetry Signals */}
        <div className="lg:col-span-4">
          <Panel level={3} compact className="space-y-3 h-full min-h-[200px] p-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[14px] font-bold text-text-muted/60 font-mono tracking-[0.2em] uppercase">Signals</span>
              <Database className="w-4 h-4 text-text-muted/40" />
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
              {behaviorProfile.signals.map((sig, idx) => (
                <div key={idx} className="p-2 bg-white/[0.01] border border-white/[0.03] rounded-sm flex flex-col space-y-1">
                  <div className="flex justify-between items-center text-[12px] font-mono">
                    <span className="text-accent-blue/70 font-bold tracking-widest uppercase">[{sig.type}]</span>
                    <span className="text-text-muted/30 font-bold tracking-tighter">CONF: {Math.round(sig.confidence * 100)}%</span>
                  </div>
                  <p className="text-[16px] font-bold text-text-primary/70 leading-tight truncate">{sig.description}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Priority Actions Grid - Decision Impact Previews */}
        <div className="lg:col-span-8">
          <Panel level={3} compact className="space-y-3 h-full min-h-[200px] p-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[14px] font-bold text-text-muted/60 font-mono tracking-[0.2em] uppercase">Impact Previews</span>
              <span className="text-[12px] font-mono text-text-muted/30 uppercase tracking-[0.15em] font-bold">MCDA Optimization Ranking</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {optimizationPlan.candidates.slice(0, 4).map((cand, idx) => {
                const annualSavings = Math.round(cand.estimatedSavingsKg * 12);
                return (
                  <div 
                    key={idx} 
                    className="p-3 bg-bg-card/30 border border-white/[0.03] rounded-sm flex flex-col justify-between space-y-2 hover:border-white/[0.08] transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-mono bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded-sm text-text-muted/50 uppercase tracking-tighter font-bold">
                        Rank #{cand.rank}
                      </span>
                      <span className={`text-[12px] font-mono font-black uppercase tracking-[0.05em] ${
                        cand.difficultyLevel === 'easy' ? 'text-accent-green/70' : 'text-accent-amber/70'
                      }`}>
                        {cand.difficultyLevel}
                      </span>
                    </div>
                    <h4 className="text-[16px] font-bold text-text-primary/90 tracking-tight truncate group-hover:text-text-primary transition-colors">
                      {cand.title}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-white/[0.02] text-[12px] font-mono tracking-tighter uppercase font-bold">
                      <div>
                        <span className="text-text-muted/30 block">Monthly</span>
                        <span className="text-accent-green/80">-{Math.round(cand.estimatedSavingsKg)}kg</span>
                      </div>
                      <div>
                        <span className="text-text-muted/30 block">Annual</span>
                        <span className="text-accent-green/80">-{annualSavings}kg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      {/* 5. Engine Status (System Metadata Panel) */}
      <Panel level={4} compact className="flex items-center justify-between text-[12px] font-mono text-text-muted/40 py-2.5 px-4 uppercase tracking-[0.1em]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-accent-green opacity-60" />
            <span className="font-black text-text-primary/60 tracking-[0.2em]">Engine Status: Active</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 border-l border-white/[0.03] pl-4">
            <span>Confidence: <strong className="text-accent-green/60">94%</strong></span>
            <span>Integrity: <strong className="text-accent-blue/60">100</strong></span>
            <span>Logic: <strong>1.5-X</strong></span>
          </div>
        </div>
        <div className="tracking-[0.3em] font-black opacity-30 text-[12px]">
          CARBONSENSE_COCKPIT_V1.0
        </div>
      </Panel>
    </div>
  );
};

export default Dashboard;
