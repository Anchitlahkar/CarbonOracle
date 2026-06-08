import React from 'react';
import useCarbonStore from '../store/carbonStore';

export const Profile: React.FC = () => {
  const { user } = useCarbonStore();

  return (
    <div className="p-6 rounded-xl bg-bg-surface border border-bg-card max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-display font-black text-text-primary">RESEARCHER PROFILE</h1>
      
      {user && (
        <div className="space-y-3 font-mono text-xs text-text-muted">
          <div className="flex justify-between py-2 border-b border-bg-card">
            <span>USER ID</span>
            <span className="text-text-primary">{user.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-bg-card">
            <span>IDENTIFIER</span>
            <span className="text-text-primary">{user.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-bg-card">
            <span>COUNTRY ORIGIN</span>
            <span className="text-text-primary">{user.country || 'GLOBAL'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-bg-card">
            <span>SAVINGS TARGET</span>
            <span className="text-text-primary">{user.targetReductionGoal}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default Profile;
