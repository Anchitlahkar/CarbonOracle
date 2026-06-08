import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanLine, 
  MessageSquare, 
  Globe, 
  User, 
  LogOut, 
  Activity 
} from 'lucide-react';
import useCarbonStore from '../store/carbonStore';

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
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        active
          ? 'bg-bg-card text-accent-green shadow-glow-green border border-accent-green/30'
          : 'text-text-muted hover:text-text-primary hover:bg-bg-card/50'
      }`}
    >
      <div className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-accent-green' : 'text-text-muted group-hover:text-text-primary'}`}>
        {icon}
      </div>
      <span className="font-display text-sm font-semibold tracking-wide">{label}</span>
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

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/scanner', icon: <ScanLine size={20} />, label: 'Receipt Scanner' },
    { to: '/coach', icon: <MessageSquare size={20} />, label: 'AI Carbon Coach' },
    { to: '/community', icon: <Globe size={20} />, label: 'Community Globe' },
    { to: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-surface border-r border-bg-card flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-2 px-2 py-4 mb-6 select-none">
            <Activity className="text-accent-green animate-pulse" size={28} />
            <span className="text-xl font-display font-extrabold tracking-wider bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">
              CARBONSENSE
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
              />
            ))}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        {user && (
          <div className="border-t border-bg-card pt-4 space-y-4">
            <div className="flex items-center space-x-3 px-2">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-bg-card bg-bg-card"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate font-display text-text-primary">
                  {user.username || 'Carbon Citizen'}
                </p>
                <p className="text-xs text-text-muted truncate font-mono">
                  {user.country ? `🇮🇳 ${user.country}` : 'Global'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-accent-red hover:bg-accent-red/10 border border-transparent hover:border-accent-red/20 transition-all duration-200"
            >
              <LogOut size={18} />
              <span className="font-display text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
export default Layout;
