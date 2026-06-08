import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useCarbonStore from '../store/carbonStore';

export const ProtectedRoute: React.FC = () => {
  const { user } = useCarbonStore();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
