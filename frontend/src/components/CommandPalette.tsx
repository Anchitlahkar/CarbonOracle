import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Terminal, 
  Globe, 
  Fingerprint, 
  TrendingUp, 
  Zap, 
  ScanLine, 
  MessageSquare, 
  User, 
  LogOut 
} from 'lucide-react';
import useCarbonStore from '../store/carbonStore';

interface CommandItem {
  icon: React.ReactNode;
  label: string;
  category: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  
  const navigate = useNavigate();
  const logout = useCarbonStore(state => state.logout);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle palette on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setActiveIndex(0);
      setSearch('');
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      icon: <Terminal size={18} />,
      label: 'Go to Mission Control (Dashboard)',
      category: 'Navigation',
      action: () => { navigate('/dashboard'); setIsOpen(false); }
    },
    {
      icon: <Globe size={18} />,
      label: 'Go to Planet Twin (Digital Twin)',
      category: 'Navigation',
      action: () => { navigate('/twin'); setIsOpen(false); }
    },
    {
      icon: <Fingerprint size={18} />,
      label: 'Go to Carbon DNA profile',
      category: 'Navigation',
      action: () => { navigate('/dna'); setIsOpen(false); }
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Go to multi-horizon Forecasts',
      category: 'Navigation',
      action: () => { navigate('/forecasts'); setIsOpen(false); }
    },
    {
      icon: <Zap size={18} />,
      label: 'Go to Optimization Center',
      category: 'Navigation',
      action: () => { navigate('/optimization'); setIsOpen(false); }
    },
    {
      icon: <ScanLine size={18} />,
      label: 'Launch Receipt Scanner tool',
      category: 'Tools',
      action: () => { navigate('/scanner'); setIsOpen(false); }
    },
    {
      icon: <MessageSquare size={18} />,
      label: 'Ask TERRA AI Carbon Coach',
      category: 'Tools',
      action: () => { navigate('/coach'); setIsOpen(false); }
    },
    {
      icon: <User size={18} />,
      label: 'View Researcher Profile',
      category: 'Account',
      action: () => { navigate('/profile'); setIsOpen(false); }
    },
    {
      icon: <LogOut size={18} className="text-accent-red" />,
      label: 'End Session (Sign Out)',
      category: 'Account',
      action: () => { logout(); setIsOpen(false); navigate('/'); }
    }
  ];

  // Filter commands
  const filtered = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        filtered[activeIndex].action();
      }
    }
  };

  // Click outside to close
  const overlayRef = useRef<HTMLDivElement>(null);
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9999] flex items-start justify-center pt-[15vh] px-4"
          ref={overlayRef}
          onClick={handleOverlayClick}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg bg-bg-surface border border-white/[0.08] rounded-sm shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-body relative"
            onKeyDown={handleKeyDown}
          >
            {/* Subtle glow effect behind modal */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />
            
            {/* Search header */}
            <div className="flex items-center space-x-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search size={18} className="text-text-muted/60 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
                placeholder="Search platform commands..."
                className="w-full bg-transparent text-text-primary placeholder-text-subtle text-[16px] outline-none border-none focus:ring-0 font-display font-medium"
                aria-label="Command search input"
              />
              <div className="shrink-0 flex items-center space-x-1">
                <kbd className="text-[12px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm text-text-muted uppercase tracking-tighter">ESC</kbd>
              </div>
            </div>

            {/* List items */}
            <div 
              ref={listRef}
              className="max-h-[340px] overflow-y-auto p-2 space-y-1"
              role="listbox"
              aria-label="Commands list"
            >
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-[16px] text-text-subtle font-mono uppercase tracking-widest opacity-40">
                  No results matching "{search}"
                </div>
              ) : (
                filtered.map((cmd, idx) => {
                  const active = idx === activeIndex;
                  return (
                    <div
                      key={idx}
                      onClick={cmd.action}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-sm text-[16px] cursor-pointer transition-all duration-150 ${
                        active 
                          ? 'bg-accent-blue/5 text-accent-blue shadow-[inset_4px_0_0_0_#00D4FF]' 
                          : 'text-text-primary/80 hover:bg-white/[0.02]'
                      }`}
                      role="option"
                      aria-selected={active}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`${active ? 'text-accent-blue' : 'text-text-muted/40'} shrink-0 transition-colors`}>
                          {React.cloneElement(cmd.icon as React.ReactElement, { size: 18 })}
                        </div>
                        <span className={`font-medium truncate uppercase tracking-tight ${active ? 'opacity-100' : 'opacity-70'}`}>
                          {cmd.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={`text-[12px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-tighter border ${
                          active 
                            ? 'text-accent-blue/70 bg-accent-blue/5 border-accent-blue/10' 
                            : 'text-text-muted/30 bg-white/[0.01] border-white/[0.04]'
                        }`}>
                          {cmd.category}
                        </span>
                        {active && (
                          <span className="text-[14px] font-mono text-accent-blue animate-pulse">↵</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Footer info panel */}
            <div className="px-4 py-2 bg-white/[0.01] border-t border-white/[0.04] flex items-center justify-between text-[12px] font-mono text-text-subtle/40 uppercase tracking-[0.2em]">
              <span>Navigate with ↑↓ and Enter</span>
              <span>CarbonSense Telemetry Controller</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
