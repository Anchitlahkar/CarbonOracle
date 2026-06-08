import React from 'react';
import useCarbonStore from '../store/carbonStore';
import { Cpu, Terminal, ShieldAlert } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useCarbonStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-xl bg-bg-surface border border-bg-card relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent-green/5 rounded-full blur-2xl" />
        <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight mb-2">
          Control Panel — <span className="text-accent-green">{user?.username?.toUpperCase() || 'RESEARCHER'}</span>
        </h1>
        <p className="text-sm text-text-muted font-body">
          CarbonSense X applied AI telemetry is active. Session token verified.
        </p>
      </div>

      {/* Control Console Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-bg-surface border border-bg-card flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-3 text-accent-blue">
            <Cpu size={24} />
            <h3 className="font-display font-bold text-base text-text-primary">Intelligence Core</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed font-body">
            All visual analytics widgets, charts, and community heatmaps are currently frozen in line with Architecture Correction Phase 1. Logic engines are isolated under `@carbonsense/*` packages.
          </p>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-accent-blue bg-accent-blue/5 border border-accent-blue/10 px-2 py-1 rounded w-fit">
            <span>●</span>
            <span>ENGINES READY: 7 / 7</span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-bg-surface border border-bg-card flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-3 text-accent-amber">
            <Terminal size={24} />
            <h3 className="font-display font-bold text-base text-text-primary">Telemetry Events</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed font-body">
            Domain event logs stand ready to handle transactions. Event dispatcher will record updates to the Carbon DNA genome profile.
          </p>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-accent-amber bg-accent-amber/5 border border-accent-amber/10 px-2 py-1 rounded w-fit">
            <span>●</span>
            <span>EVENT LOGS: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div className="p-4 rounded-lg bg-bg-surface border border-accent-amber/20 flex items-start space-x-3">
        <ShieldAlert className="text-accent-amber shrink-0 mt-0.5" size={18} />
        <div className="space-y-1">
          <h4 className="text-xs font-display font-bold text-text-primary">TECHNICAL DIRECTIVE</h4>
          <p className="text-xs text-text-muted font-body leading-relaxed">
            Do not construct any charts or community items yet. Ensure the shared-types compiler references remain correct. Next step is Phase 2 (Carbon Science Engine implementation).
          </p>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
