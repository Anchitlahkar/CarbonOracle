import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useCarbonStore from '../store/carbonStore';
import { PremiumLoader } from './ui';

export const ProtectedRoute: React.FC = () => {
  const { user, authInitialized } = useCarbonStore();

  if (!authInitialized) {
    return <PremiumLoader label="SYNCHRONIZING ORACLE..." className="min-h-screen" />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
