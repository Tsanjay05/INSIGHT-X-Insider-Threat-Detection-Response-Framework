import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from './contexts/WebSocketProvider';
import { useAuth } from './hooks/useAuth';

import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/errors/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';

// Auth pages
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Unauthorized } from './pages/auth/Unauthorized';
import UIKit from './pages/dev/UIKit';

// User pages
import { Profile } from './pages/users/Profile';
import { UsersList } from './pages/users/UsersList';
import { UserDetail } from './pages/users/UserDetail';

// Existing pages
import Dashboard from './pages/Dashboard';
import EntityTrustDetail from './pages/trust/EntityTrustDetail';
import Controls from './pages/Controls';
import ControlDetail from './pages/controls/ControlDetail';
import Provenance from './pages/Provenance';
import DecisionDetail from './pages/provenance/DecisionDetail';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/campaigns/CampaignDetail';
import Intent from './pages/Intent';
import IntentDetail from './pages/intent/IntentDetail';
import Approvals from './pages/Approvals';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/alerts/AlertDetail';
import Cases from './pages/Cases';
import CaseDetail from './pages/cases/CaseDetail';
import { NewCase } from './pages/cases/NewCase';
import Timeline from './pages/Timeline';
import Policies from './pages/Policies';
import PolicyDetail from './pages/policies/PolicyDetail';
import Reports from './pages/Reports';
import ReportDetail from './pages/reports/ReportDetail';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Setup API interceptors


    // Check auth on app load
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/dev/ui-kit" element={<UIKit />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* User Management */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/users/:id" element={<UserDetail />} />

        {/* Trust Module */}
        <Route path="/trust/:entityId" element={<EntityTrustDetail />} />

        {/* Controls & Approvals */}
        <Route path="/controls" element={<Controls />} />
        <Route path="/controls/:controlId" element={<ControlDetail />} />
        <Route path="/approvals" element={<Approvals />} />

        {/* Provenance */}
        <Route path="/provenance" element={<Provenance />} />
        <Route path="/provenance/decision/:decisionId" element={<DecisionDetail />} />

        {/* Intent */}
        <Route path="/intent" element={<Intent />} />
        <Route path="/intent/:entityId" element={<IntentDetail />} />

        {/* Campaigns */}
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />

        {/* Core Features */}
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/:alertId" element={<AlertDetail />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/new" element={<NewCase />} />
        <Route path="/cases/:caseId" element={<CaseDetail />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/policies/:policyId" element={<PolicyDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:reportId" element={<ReportDetail />} />
        <Route path="/settings" element={<Settings />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <WebSocketProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </WebSocketProvider>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
