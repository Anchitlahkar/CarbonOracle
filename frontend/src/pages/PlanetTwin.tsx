import React, { useState, useEffect, useMemo } from 'react';
import useCarbonStore from '../store/carbonStore';
import { 
  Panel, 
  SectionHeader, 
  PanelError,
  IntelligenceBrief,
  PremiumLoader
} from '../components/ui';
import PlanetTwinScene from '../components/3d/PlanetTwinScene';
import { 
  Compass, 
  ShieldAlert,
  Globe,
  Trees,
  Thermometer,
  Shield,
  Gauge,
  Activity,
  Car,
  Database
} from 'lucide-react';

type ScenarioMode = 'current' | 'optimized' | 'aggressive';

export const PlanetTwin: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioMode>('current');
  const { 
    isLoading, 
    error, 
    planetTwinProfile, 
    fetchContext 
  } = useCarbonStore();

  useEffect(() => {
    if (!planetTwinProfile) {
      fetchContext();
    }
  }, [planetTwinProfile, fetchContext]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <PremiumLoader label="SIMULATING PLANETARY DYNAMICS..." />
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

  if (!planetTwinProfile) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <ShieldAlert className="mx-auto text-accent-amber animate-pulse" size={40} />
        <h3 className="text-[18px] font-bold font-display uppercase tracking-wider text-text-primary">PROFILE SYNC ERROR</h3>
        <p className="text-[16px] text-text-muted">Planet twin simulations require active profile context.</p>
        <button onClick={fetchContext} className="px-4 py-2.5 rounded bg-accent-green text-bg-primary text-[16px] font-mono font-bold uppercase">
          Sync Profile
        </button>
      </div>
    );
  }

  const activeWorld = 
    scenario === 'current' ? planetTwinProfile.currentWorld :
    scenario === 'optimized' ? planetTwinProfile.optimizedWorld :
    planetTwinProfile.aggressiveWorld;

  const currentAnnualTons = (planetTwinProfile.currentWorld.trajectory.annualEmissionsKg / 1000).toFixed(2);
  const optimizedAnnualTons = (planetTwinProfile.optimizedWorld.trajectory.annualEmissionsKg / 1000).toFixed(2);

  // Compute Delta Text & Value
  const deltaValue = useMemo(() => {
    if (scenario === 'current') return '0% Drift';
    if (scenario === 'optimized') return `-${planetTwinProfile.comparativeAnalysis.reductionVsCurrentPercent}% Offset`;
    
    const aggressiveReductionPercent = Math.round(
      ((planetTwinProfile.currentWorld.trajectory.annualEmissionsKg - planetTwinProfile.aggressiveWorld.trajectory.annualEmissionsKg) / 
       planetTwinProfile.currentWorld.trajectory.annualEmissionsKg) * 100
    );
    return `-${aggressiveReductionPercent}% Recovery`;
  }, [scenario, planetTwinProfile]);

  const currentAnnualTonsVal = (activeWorld.trajectory.annualEmissionsKg / 1000).toFixed(2);

  // Construct Dynamic Narrative Intelligence Text
  const narrativeText = `At your current trajectory, annual emissions are projected to reach ${currentAnnualTons} tons CO₂e. Following the optimization pathway reduces emissions by ${planetTwinProfile.comparativeAnalysis.reductionVsCurrentPercent}%, down to ${optimizedAnnualTons} tons CO₂e. The aggressive pathway reduces emissions by ${Math.round(((planetTwinProfile.currentWorld.trajectory.annualEmissionsKg - planetTwinProfile.aggressiveWorld.trajectory.annualEmissionsKg) / planetTwinProfile.currentWorld.trajectory.annualEmissionsKg) * 100)}%, equivalent to removing ${planetTwinProfile.aggressiveWorld.impact.vehicleEquivalentKm.toLocaleString()} vehicle kilometers annually.`;

  const bulletPoints = [
    `Atmospheric Concentration: Carbon levels project at ${scenario === 'current' ? '418' : scenario === 'optimized' ? '385' : '360'} PPM.`,
    `Forest Offset Equivalent: Demands ${activeWorld.impact.treesRequiredForOffset.toLocaleString()} reforestation hectares.`,
    `Overshoot Index: Global adoption would require ${activeWorld.earthEquivalent.earthsRequired.toFixed(1)} Earths to sustain.`
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-3.5 font-body">
      {/* 1. Page Header */}
      <SectionHeader 
        title="PLANETARY DYNAMICS"
        description="Empirical projection modeling carbon reduction pathways to support operational decisions."
        actions={
          <div className="flex items-center space-x-2 text-[12px] font-mono text-text-muted/60">
            <span className="uppercase tracking-[0.2em] font-bold">Model Validation: <strong className="text-accent-green/60">Verified</strong></span>
          </div>
        }
      />

      {/* 2. Top Layer: Scenario Selector */}
      <Panel level={2} compact className="py-2 px-3.5 flex flex-wrap items-center justify-between gap-3 bg-bg-surface/60 border-white/[0.03]">
        <div className="flex items-center space-x-2.5">
          <Gauge className="w-4 h-4 text-accent-blue opacity-70" />
          <span className="text-[14px] font-bold text-text-muted/60 uppercase tracking-[0.2em] font-mono">
            Simulation Scenario Mode
          </span>
        </div>
        <div className="flex bg-bg-card/40 border border-white/[0.04] rounded-sm p-1 space-x-1 font-mono text-[14px]">
          <button
            onClick={() => setScenario('current')}
            className={`px-4 py-2 rounded-sm transition-all duration-200 font-bold uppercase tracking-tight ${
              scenario === 'current' ? 'bg-accent-red text-white shadow-[0_0_15px_-5px_#FF3366]' : 'text-text-muted/40 hover:text-text-primary/70'
            }`}
          >
            Current Trajectory
          </button>
          <button
            onClick={() => setScenario('optimized')}
            className={`px-4 py-2 rounded-sm transition-all duration-200 font-bold uppercase tracking-tight ${
              scenario === 'optimized' ? 'bg-accent-blue text-white shadow-[0_0_15px_-5px_#00D4FF]' : 'text-text-muted/40 hover:text-text-primary/70'
            }`}
          >
            Optimized Pathway
          </button>
          <button
            onClick={() => setScenario('aggressive')}
            className={`px-4 py-2 rounded-sm transition-all duration-200 font-bold uppercase tracking-tight ${
              scenario === 'aggressive' ? 'bg-accent-green text-bg-primary shadow-[0_0_15px_-5px_#00FF87]' : 'text-text-muted/40 hover:text-text-primary/70'
            }`}
          >
            Aggressive Recovery
          </button>
        </div>
      </Panel>

      {/* 3. Center Section: 3D Globe + Key Delta (Hero Area) & Right Telemetry Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Globe Visualization Area */}
        <Panel level={1} className="lg:col-span-8 relative flex flex-col justify-between min-h-[360px] p-4 overflow-hidden">
          {/* Subtle scanner effect overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.02] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[size:100%_4px]" />
          
          <div className="absolute top-3.5 left-3.5 z-20 flex items-center space-x-2 bg-bg-surface/40 backdrop-blur-md px-2.5 py-1.5 border border-white/[0.04] rounded-sm">
            <Globe className="text-accent-blue animate-spin-slow w-4 h-4" />
            <span className="text-[12px] font-mono text-text-muted/70 uppercase tracking-[0.2em] font-bold">
              Empirical Evidence Layer
            </span>
          </div>

          {/* Floating Key Delta (Hero Visual) */}
          <div className="absolute top-3.5 right-3.5 z-20 bg-bg-card/80 border border-white/[0.08] px-2.5 py-1.5 rounded-sm flex flex-col text-right backdrop-blur-md font-mono">
            <span className="text-[12px] text-text-muted/40 uppercase tracking-[0.2em] font-bold">Target Offset</span>
            <span className={`text-[16px] font-black tracking-tight uppercase ${
              scenario === 'current' ? 'text-accent-red/80' : scenario === 'optimized' ? 'text-accent-blue/80' : 'text-accent-green/80'
            }`}>
              {deltaValue}
            </span>
          </div>

          {/* Center 3D Canvas */}
          <div className="flex-1 flex items-center justify-center relative">
            <PlanetTwinScene scenario={scenario} />
            {/* Compass overlay */}
            <div className="absolute bottom-4 right-4 flex flex-col items-center opacity-20 pointer-events-none">
              <Compass className="w-8 h-8 text-text-muted" />
              <span className="text-[12px] font-mono mt-1">AXIS_Y_LOCKED</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] font-mono text-text-muted/30 pt-2 border-t border-white/[0.04] uppercase tracking-[0.15em] relative z-20">
            <span>Atmospheric density: <strong className="text-text-muted/60">{(scenario === 'current' ? 0.55 : scenario === 'optimized' ? 0.4 : 0.25) * 100}%</strong></span>
            <span>Biosphere: <strong className="text-text-muted/60">Stable</strong></span>
            <span>Status: <strong className="text-text-muted/60">Validated</strong></span>
          </div>
        </Panel>

        {/* Right Section: Divergence Metrics */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-2.5">
          {/* Annual Emissions */}
          <Panel level={2} compact className="flex items-center justify-between h-fit py-2.5 border-white/[0.03]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-sm bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-text-muted/40 group-hover:text-text-primary transition-colors">
                <Activity size={16} />
              </div>
              <div>
                <span className="text-[14px] font-mono text-text-muted/40 block uppercase tracking-widest font-bold">Annual Footprint</span>
              </div>
            </div>
            <span className="text-[18px] font-mono font-black text-text-primary/90">
              {currentAnnualTonsVal} <span className="text-[12px] text-text-muted/40 font-bold uppercase">t CO₂e</span>
            </span>
          </Panel>

          {/* Temp Impact */}
          <Panel level={2} compact className="flex items-center justify-between h-fit py-2.5 border-white/[0.03]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-sm bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-text-muted/40">
                <Thermometer size={16} />
              </div>
              <div>
                <span className="text-[14px] font-mono text-text-muted/40 block uppercase tracking-widest font-bold">Thermal Drift</span>
              </div>
            </div>
            <span className={`text-[18px] font-mono font-black ${
              scenario === 'current' ? 'text-accent-red/80' : scenario === 'optimized' ? 'text-accent-blue/80' : 'text-accent-green/80'
            }`}>
              +{scenario === 'current' ? '2.1' : scenario === 'optimized' ? '1.7' : '1.3'}°C
            </span>
          </Panel>

          {/* Atmospheric concentration */}
          <Panel level={2} compact className="flex items-center justify-between h-fit py-2.5 border-white/[0.03]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-sm bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-text-muted/40">
                <Database size={16} />
              </div>
              <div>
                <span className="text-[14px] font-mono text-text-muted/40 block uppercase tracking-widest font-bold">Carbon Density</span>
              </div>
            </div>
            <span className="text-[18px] font-mono font-black text-text-primary/90">
              {scenario === 'current' ? '418' : scenario === 'optimized' ? '385' : '360'} <span className="text-[12px] text-text-muted/40 font-bold uppercase">PPM</span>
            </span>
          </Panel>

          {/* Forest Offset */}
          <Panel level={2} compact className="flex items-center justify-between h-fit py-2.5 border-white/[0.03]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-sm bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-text-muted/40">
                <Trees size={16} />
              </div>
              <div>
                <span className="text-[14px] font-mono text-text-muted/40 block uppercase tracking-widest font-bold">Forest Area</span>
              </div>
            </div>
            <span className="text-[18px] font-mono font-black text-text-primary/90">
              {activeWorld.impact.treesRequiredForOffset.toLocaleString()} <span className="text-[12px] text-text-muted/40 font-bold uppercase">HA</span>
            </span>
          </Panel>

          {/* Vehicle Reduction */}
          <Panel level={2} compact className="flex items-center justify-between h-fit py-2.5 border-white/[0.03]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-sm bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-text-muted/40">
                <Car size={16} />
              </div>
              <div>
                <span className="text-[14px] font-mono text-text-muted/40 block uppercase tracking-widest font-bold">Vehicle Offset</span>
              </div>
            </div>
            <span className="text-[18px] font-mono font-black text-text-primary/90">
              {(activeWorld.impact.vehicleEquivalentKm / 1000).toFixed(1)}k <span className="text-[12px] text-text-muted/40 font-bold uppercase">KM</span>
            </span>
          </Panel>

          {/* Earth Overshoot */}
          <Panel level={2} compact className="flex items-center justify-between h-fit py-2.5 border-white/[0.03]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-sm bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-text-muted/40">
                <Shield size={16} />
              </div>
              <div>
                <span className="text-[14px] font-mono text-text-muted/40 block uppercase tracking-widest font-bold">Earth Index</span>
              </div>
            </div>
            <span className={`text-[18px] font-mono font-black ${
              activeWorld.earthEquivalent.earthsRequired > 1.5 ? 'text-accent-amber/80' : 'text-accent-green/80'
            }`}>
              {activeWorld.earthEquivalent.earthsRequired.toFixed(1)} <span className="text-[12px] text-text-muted/40 font-bold uppercase">EARTHS</span>
            </span>
          </Panel>
        </div>
      </div>

      {/* 4. Bottom Layer: Narrative Intelligence Report */}
      <IntelligenceBrief 
        title={`Intelligence Report: ${activeWorld.name}`}
        badge="SIMULATION COMPLETED"
        narrative={narrativeText}
        bulletPoints={bulletPoints}
        forecastConfidence="High"
        behaviorFreshness="Active"
        modelIntegrity={94}
        level={3}
        status={scenario === 'current' ? 'danger' : scenario === 'optimized' ? 'info' : 'success'}
      />
    </div>
  );
};

export default PlanetTwin;
