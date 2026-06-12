import React from 'react';
import { motion } from 'framer-motion';

interface PremiumLoaderProps {
  label?: string;
  className?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({ label = 'LOADING TELEMETRY...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 font-mono ${className}`} role="status" aria-live="polite">
      <div className="relative w-12 h-12">
        <motion.div 
          className="absolute inset-0 border border-accent-blue/20 rounded-full"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute inset-1 border-t-2 border-accent-green rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute inset-3 border-r-2 border-white/50 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-accent-blue rounded-full animate-pulse" />
        </div>
      </div>
      <motion.span 
        className="text-[14px] tracking-[0.3em] font-bold text-text-muted/60 uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {label}
      </motion.span>
    </div>
  );
};
export default PremiumLoader;
