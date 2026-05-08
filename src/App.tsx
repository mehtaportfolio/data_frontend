import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { BankAccountsPage } from './pages/BankAccountsPage';
import { CreditCardsPage } from './pages/CreditCardsPage';
import { GeneralDocumentsPage } from './pages/GeneralDocumentsPage';
import { InsurancePoliciesPage } from './pages/InsurancePoliciesPage';
import { BankDepositPage } from './pages/BankDepositPage';
import { SettingsPage } from './pages/SettingsPage';
import { WebsitesPage } from './pages/WebsitesPage';
import { Toaster } from './components/ui/Toast';
import { useOffline } from './hooks/useOffline';
import { useTheme } from './hooks/useTheme';
import { BottomNav } from './components/ui/BottomNav';
import { useServiceHealth } from './hooks/useServiceHealth';
import { useEffect } from 'react';

function ServiceHealthManager() {
  const { checkServiceStatus } = useServiceHealth();
  
  useEffect(() => {
    // Automatically check and restart service if needed on app mount
    checkServiceStatus(true);
  }, []);

  return null;
}

function ProtectedLayout() {
  const {
    isAuthenticated
  } = useAuth();
  const isOffline = useOffline();
  useTheme();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>
      <Outlet />
      <BottomNav />
      {isOffline && <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white text-center text-xs py-1 z-50">
          You are offline. Changes saved locally.
        </div>}
    </>;
}
function AppRoutes() {
  return <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/bank-accounts" element={<BankAccountsPage />} />
        <Route path="/credit-cards" element={<CreditCardsPage />} />
        <Route path="/general-documents" element={<GeneralDocumentsPage />} />
        <Route path="/insurance-policies" element={<InsurancePoliciesPage />} />
        <Route path="/bank-deposits" element={<BankDepositPage />} />
        <Route path="/websites" element={<WebsitesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>;
}
export default function App() {
  return <Router>
      <AuthProvider>
        <ServiceHealthManager />
        <AppRoutes />
      </AuthProvider>
      <Toaster />
    </Router>;
}
