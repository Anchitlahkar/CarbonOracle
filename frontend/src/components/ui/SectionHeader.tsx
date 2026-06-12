import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/[0.06] mb-6 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-[32px] font-bold font-display text-text-primary tracking-tight">{title}</h2>
        {description && <p className="text-[16px] text-text-muted font-body leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="mt-4 sm:mt-0 flex items-center space-x-2 shrink-0">{actions}</div>}
    </div>
  );
};

export default SectionHeader;
