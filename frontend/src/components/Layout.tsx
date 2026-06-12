import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Fingerprint, 
  TrendingUp, 
  Zap, 
  ScanLine, 
  MessageSquare, 
  LogOut, 
  Activity 
} from 'lucide-react';
import useCarbonStore from '../store/carbonStore';
import CommandPalette from './CommandPalette';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-sm transition-all duration-200 group text-[10px] font-mono ${
        active
          ? 'bg-accent-green/5 text-accent-green border-r-2 border-accent-green shadow-[inset_-10px_0_15px_-10px_rgba(0,255,135,0.2)]'
          : 'text-text-muted/60 hover:text-text-primary hover:bg-white/[0.03]'
      }`}
    >
      <div className={`shrink-0 ${active ? 'text-accent-green' : 'text-text-muted/40 group-hover:text-text-primary'}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 13 })}
      </div>
      <span className={`font-bold tracking-[0.12em] uppercase ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useCarbonStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary overflow-hidden selection:bg-accent-green/30">
      {/* Global Command Palette */}
      <CommandPalette />

      {/* Sidebar */}
      <aside className="w-52 bg-bg-surface border-r border-white/[0.04] flex flex-col justify-between p-2.5 shrink-0 font-body relative z-20 shadow-2xl">
        <div className="space-y-4">
          {/* Logo & Ctrl+K trigger button */}
          <div className="flex items-center justify-between px-2 py-2 border-b border-white/[0.03] mb-1">
            <Link to="/dashboard" className="flex flex-col select-none group">
              <div className="flex items-center space-x-2">
                <Activity className="text-accent-green group-hover:rotate-12 transition-transform" size={13} />
                <span className="text-[10px] font-display font-black tracking-[0.25em] text-text-primary">
                  CARBONSENSE
                </span>
              </div>
              <span className="text-[7px] font-mono text-text-muted/40 uppercase tracking-[0.05em] pl-[21px] mt-0.5">
                Powered by TERRA
              </span>
            </Link>
            
            <button 
              onClick={() => {
                const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' });
                window.dispatchEvent(event);
              }}
              className="px-1.5 py-0.5 rounded-sm border border-white/[0.08] hover:border-accent-blue/40 bg-white/[0.02] text-[7.5px] font-mono text-text-subtle transition-all cursor-pointer"
              title="Open command (Ctrl+K)"
            >
              ⌘K
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-3.5">
            {/* Section 1: Dashboard */}
            <div className="space-y-1">
              <div className="text-[7.5px] tracking-[0.25em] font-mono text-text-muted/30 font-bold px-2.5 uppercase">
                Cockpit
              </div>
              <SidebarItem
                to="/dashboard"
                icon={<LayoutDashboard />}
                label="Intelligence Cockpit"
                active={location.pathname === '/dashboard'}
              />
            </div>

            {/* Section 2: Planet Twin */}
            <div className="space-y-1">
              <div className="text-[7.5px] tracking-[0.25em] font-mono text-text-muted/30 font-bold px-2.5 uppercase">
                Simulation
              </div>
              <SidebarItem
                to="/twin"
                icon={<Globe />}
                label="Planetary Dynamics"
                active={location.pathname === '/twin'}
              />
            </div>

            {/* Section  Intelligence */}
            <div className="space-y-1">
              <div className="text-[7.5px] tracking-[0.25em] font-mono text-text-muted/30 font-bold px-2.5 uppercase">
                Intelligence
              </div>
              <div className="space-y-0.5">
                <SidebarItem
                  to="/dna"
                  icon={<Fingerprint />}
                  label="DNA Intelligence"
                  active={location.pathname === '/dna'}
                />
                <SidebarItem
                  to="/forecasts"
                  icon={<TrendingUp />}
                  label="Forecasts"
                  active={location.pathname === '/forecasts'}
                />
                <SidebarItem
                  to="/optimization"
                  icon={<Zap />}
                  label="Optimization"
                  active={location.pathname === '/optimization'}
                />
              </div>
            </div>

            {/* Section 4: Tools */}
            <div className="space-y-1">
              <div className="text-[7.5px] tracking-[0.25em] font-mono text-text-muted/30 font-bold px-2.5 uppercase">
                Tools
              </div>
              <div className="space-y-0.5">
                <SidebarItem
                  to="/scanner"
                  icon={<ScanLine />}
                  label="Receipt Scanner"
                  active={location.pathname === '/scanner'}
                />
                <SidebarItem
                  to="/coach"
                  icon={<MessageSquare />}
                  label="TERRA Advisor"
                  active={location.pathname === '/coach'}
                />
              </div>
            </div>
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="space-y-3">
          {/* System Status */}
          <div className="px-2.5 py-2 rounded-sm bg-white/[0.01] border border-white/[0.03] space-y-1.5">
            <div className="flex items-center justify-between text-[7px] font-mono uppercase tracking-widest text-text-muted/40">
              <span>TERRA Engine</span>
              <span className="text-accent-green animate-pulse">Active</span>
            </div>
            <div className="h-0.5 w-full bg-white/[0.03] overflow-hidden rounded-full">
              <div className="h-full bg-accent-green/40 w-[100%]" />
            </div>
          </div>

          {user && (
            <div className="border-t border-white/[0.04] pt-3 space-y-1.5">
              <Link to="/profile" className="flex items-center space-x-2.5 px-2 py-1.5 hover:bg-white/[0.02] rounded-sm transition-colors group">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt="Avatar"
                  className="w-6 h-6 rounded-sm border border-white/[0.08] bg-bg-card group-hover:border-accent-green/30 transition-colors"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold truncate font-display text-text-primary uppercase tracking-tight">
                    {user.username || 'Citizen'}
                  </p>
                  <p className="text-[7.5px] text-text-muted/50 truncate font-mono uppercase tracking-[0.1em]">
                    {user.country ? `Region: ${user.country}` : 'Global Region'}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-sm text-accent-red/80 hover:text-accent-red hover:bg-accent-red/5 border border-transparent hover:border-accent-red/10 transition-all text-[8px] font-mono font-bold uppercase tracking-[0.15em]"
              >
                <LogOut size={10} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-bg-primary relative">
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="flex-1 p-3 md:p-4 lg:p-5 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};
export default Layout;
