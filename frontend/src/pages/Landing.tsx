import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Cpu, Globe } from 'lucide-react';
import useCarbonStore from '../store/carbonStore';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useCarbonStore();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-between overflow-x-hidden selection:bg-accent-green/30 font-body relative">
      {/* Subtle grid background overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Header */}
      <header className="border-b border-white/[0.04] bg-bg-primary/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="text-accent-green opacity-80" size={20} />
            <span className="font-display font-black text-[16px] tracking-[0.25em] text-text-primary">
              CARBONSENSE
            </span>
            <span className="text-[12px] font-mono text-text-muted/40 uppercase tracking-[0.1em] border-l border-white/10 pl-2">
              Powered by TERRA
            </span>
          </div>
          <button
            onClick={handleStart}
            className="px-4 py-2 rounded-sm border border-white/[0.08] hover:border-accent-blue/40 hover:text-text-primary hover:bg-accent-blue/5 text-text-muted/80 font-mono text-[16px] font-bold transition-all uppercase tracking-widest cursor-pointer"
          >
            {user ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-sm border border-accent-blue/10 bg-accent-blue/5 text-accent-blue text-[14px] font-mono mb-8 uppercase font-bold tracking-[0.2em] shadow-[inset_0_0_15px_-5px_rgba(0,212,255,0.2)]">
          <span className="animate-pulse">●</span>
          <span>AI CARBON INTELLIGENCE COCKPIT</span>
        </div>

        <h1 className="text-[48px] md:text-[64px] font-display font-black tracking-tighter mb-6 leading-[1.1] text-text-primary uppercase drop-shadow-lg">
          CarbonSense<br />
          <span className="text-accent-green bg-clip-text text-transparent bg-gradient-to-r from-accent-green to-[#00D4FF]">
            Powered by TERRA
          </span>
        </h1>

        <p className="text-text-muted/80 max-w-2xl text-[16px] md:text-[18px] font-body leading-relaxed mb-8 font-medium">
          An AI Carbon Intelligence Assistant that structures behavioral patterns, projects emissions, and builds automated reduction roadmaps.
        </p>

        {/* Feature Checkmarks List for 5-Second Clarity */}
        <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-3 mb-10 text-[14px] font-mono uppercase tracking-wider text-text-primary/90">
          <div className="flex items-center space-x-2">
            <span className="text-accent-green font-bold">✓</span>
            <span>Analyzes Behavior</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-accent-green font-bold">✓</span>
            <span>Forecasts Future Emissions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-accent-green font-bold">✓</span>
            <span>Builds Reduction Plans</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-accent-green font-bold">✓</span>
            <span>Explains Climate Impact</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3 rounded-sm bg-accent-green text-bg-primary font-mono font-black text-[16px] uppercase transition-all hover:bg-accent-green/90 cursor-pointer tracking-[0.2em] shadow-[0_0_20px_-5px_#00FF87]"
          >
            Get Started
          </button>
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3 rounded-sm bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.2] text-text-primary/80 hover:text-text-primary font-mono font-bold text-[16px] transition-all uppercase tracking-[0.2em] cursor-pointer"
          >
            Explore Demo
          </button>
        </div>

        {/* Pillars / Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-20">
          <div className="p-6 rounded-sm bg-bg-surface/50 border border-white/[0.04] hover:border-white/[0.1] transition-all text-left space-y-3.5 shadow-lg">
            <Cpu className="text-accent-blue opacity-80" size={24} />
            <h3 className="text-[18px] font-display font-black text-text-primary uppercase tracking-tight">Unified Behavior Intelligence</h3>
            <p className="text-[16px] text-text-muted/70 font-body leading-relaxed font-medium">
              Integrates OCR grocery scans, travel registries, and residential power utility data to establish a precise behavioral DNA carbon model.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-bg-surface/50 border border-white/[0.04] hover:border-white/[0.1] transition-all text-left space-y-3.5 shadow-lg">
            <Activity className="text-accent-green opacity-80" size={24} />
            <h3 className="text-[18px] font-display font-black text-text-primary uppercase tracking-tight">Autonomous Decision Models</h3>
            <p className="text-[16px] text-text-muted/70 font-body leading-relaxed font-medium">
              Ranks carbon interventions using Multi-Criteria Decision Analysis (MCDA), evaluating cost, friction, and environmental payoff.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-bg-surface/50 border border-white/[0.04] hover:border-white/[0.1] transition-all text-left space-y-3.5 shadow-lg">
            <Globe className="text-accent-amber opacity-80" size={24} />
            <h3 className="text-[18px] font-display font-black text-text-primary uppercase tracking-tight">Planetary Consequence Mapping</h3>
            <p className="text-[16px] text-text-muted/70 font-body leading-relaxed font-medium">
              Simulates long-term atmospheric carbon drift, forest equivalent absorption, and Earth overshoot index outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.02] bg-bg-surface/80 py-6 text-center text-[12px] text-text-muted/40 font-mono uppercase tracking-[0.25em] font-bold">
        <p>© 2026 CarbonSense. Powered by TERRA AI Carbon Intelligence.</p>
      </footer>
    </div>
  );
};
export default Landing;
