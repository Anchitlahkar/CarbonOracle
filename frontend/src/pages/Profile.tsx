import React from 'react';
import useCarbonStore from '../store/carbonStore';

export const Profile: React.FC = () => {
  const { user } = useCarbonStore();

  return (
    <div className="p-8 rounded-xl bg-bg-surface border border-bg-card max-w-xl mx-auto space-y-6">
      <h1 className="text-[32px] font-display font-black text-text-primary">RESEARCHER PROFILE</h1>
      
      {user && (
        <div className="space-y-4 font-mono text-[16px] text-text-muted">
          <div className="flex justify-between py-3 border-b border-bg-card">
            <span>USER ID</span>
            <span className="text-text-primary">{user.id}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-bg-card">
            <span>IDENTIFIER</span>
            <span className="text-text-primary">{user.username}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-bg-card">
            <span>COUNTRY ORIGIN</span>
            <span className="text-text-primary">{user.country || 'GLOBAL'}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-bg-card">
            <span>SAVINGS TARGET</span>
            <span className="text-text-primary">{user.targetReductionGoal}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default Profile;
