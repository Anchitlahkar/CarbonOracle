import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Cpu, GitFork } from 'lucide-react';
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
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-between overflow-x-hidden selection:bg-accent-green selection:text-bg-primary">
      {/* Header */}
      <header className="border-b border-bg-card/40 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="text-accent-green" size={24} />
            <span className="font-display font-black text-lg tracking-wider bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">
              CARBONSENSE X
            </span>
          </div>
          <button
            onClick={handleStart}
            className="px-4 py-2 rounded-lg bg-bg-surface border border-accent-green/30 hover:border-accent-green text-accent-green font-display text-sm font-semibold tracking-wide transition-all duration-300 hover:shadow-glow-green"
          >
            {user ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-accent-green/5 border border-accent-green/10 text-accent-green text-xs font-mono mb-8 animate-pulse shadow-glow-green">
          <span>●</span>
          <span>APPLIED AI CARBON RESEARCH PLATFORM</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 leading-tight">
          Your Planet.<br />
          Your Footprint.<br />
          <span className="bg-gradient-to-r from-accent-green via-accent-blue to-accent-green bg-size-200 animate-gradient bg-clip-text text-transparent">
            Your Decision.
          </span>
        </h1>

        <p className="text-text-muted max-w-2xl text-lg md:text-xl font-body leading-relaxed mb-12">
          The first behavioral optimization intelligence platform applying multi-horizon scenario forecasts, carbon genomes, and event-driven impact models to reduce human footprint.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-accent-green text-bg-primary font-display font-bold text-base hover:shadow-glow-green transition-all duration-300 hover:scale-[1.02]"
          >
            Launch Research Environment
          </button>
          <a
            href="/docs/RESEARCH.md"
            onClick={(e) => {
              e.preventDefault();
              alert('Redirecting to local markdown research file. Please review /docs/RESEARCH.md in the workspace.');
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-bg-surface hover:bg-bg-card border border-bg-card text-text-primary font-display font-semibold text-base transition-all duration-300"
          >
            Read Research Plan
          </a>
        </div>

        {/* Pillars / Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-24">
          <div className="p-6 rounded-xl bg-bg-surface border border-bg-card hover:border-accent-green/30 transition-all duration-300 text-left">
            <Cpu className="text-accent-green mb-4" size={32} />
            <h3 className="text-lg font-display font-bold mb-2 text-text-primary">AI Decoupled Orchestration</h3>
            <p className="text-sm text-text-muted font-body leading-relaxed">
              Domain computation engines isolated from underlying LLM vendors. Switch model engines seamlessly via modular wrapper APIs.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-bg-surface border border-bg-card hover:border-accent-green/30 transition-all duration-300 text-left">
            <GitFork className="text-accent-blue mb-4" size={32} />
            <h3 className="text-lg font-display font-bold mb-2 text-text-primary">Event-Driven Contracts</h3>
            <p className="text-sm text-text-muted font-body leading-relaxed">
              System architecture reacting dynamically to domain events. Immutable record feeds track every carbon calculation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-bg-surface border border-bg-card hover:border-accent-green/30 transition-all duration-300 text-left">
            <Shield className="text-accent-red mb-4" size={32} />
            <h3 className="text-lg font-display font-bold mb-2 text-text-primary">Planet Twin Simulation</h3>
            <p className="text-sm text-text-muted font-body leading-relaxed">
              Visualizes real-time climate telemetry updates representing parts-per-million concentration indexes driven by user choices.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-card/40 bg-bg-surface py-8 text-center text-xs text-text-muted">
        <p>© 2026 CarbonSense X. Built for Applied Carbon Behavioral Science. Deployed globally.</p>
      </footer>
    </div>
  );
};
export default Landing;
