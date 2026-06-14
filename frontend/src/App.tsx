import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { PremiumLoader } from './components/ui';

// Lazy load page-level components to enable code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DNA = lazy(() => import('./pages/DNA'));
const PlanetTwin = lazy(() => import('./pages/PlanetTwin'));
const Optimization = lazy(() => import('./pages/Optimization'));
const Forecasts = lazy(() => import('./pages/Forecasts'));
const Scanner = lazy(() => import('./pages/Scanner'));
const Coach = lazy(() => import('./pages/Coach'));
const Profile = lazy(() => import('./pages/Profile'));

export const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<PremiumLoader label="SYNCHRONIZING ORACLE..." className="min-h-screen" />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/twin"
              element={
                <Layout>
                  <PlanetTwin />
                </Layout>
              }
            />
            <Route
              path="/dna"
              element={
                <Layout>
                  <DNA />
                </Layout>
              }
            />
            <Route
              path="/forecasts"
              element={
                <Layout>
                  <Forecasts />
                </Layout>
              }
            />
            <Route
              path="/optimization"
              element={
                <Layout>
                  <Optimization />
                </Layout>
              }
            />
            <Route
              path="/scanner"
              element={
                <Layout>
                  <Scanner />
                </Layout>
              }
            />
            <Route
              path="/coach"
              element={
                <Layout>
                  <Coach />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <Profile />
                </Layout>
              }
            />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Analytics />
    </Router>
  );
};
export default App;

