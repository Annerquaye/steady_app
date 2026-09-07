import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import AppShell from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import Onboarding from '@/pages/Onboarding';
import UrgeEmergency from '@/pages/UrgeEmergency';
import Journal from '@/pages/Journal';
import Coach from '@/pages/Coach';
import Blocking from '@/pages/Blocking';
import Settings from '@/pages/Settings';
import WeeklyReview from '@/pages/WeeklyReview';
import RelapseReflection from '@/pages/RelapseReflection';
import Pricing from '@/pages/Pricing';
import Checkout from '@/pages/Checkout';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import Support from '@/pages/Support';

import { useDarkMode } from '@/hooks/useDarkMode';
import AnimatedRoutes from '@/components/layout/AnimatedRoutes';
import SplashScreen from '@/components/SplashScreen';

const AuthenticatedApp = () => {
  useDarkMode();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <AnimatedRoutes>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth/consent" element={<OAuthConsent />} />
        <Route path="/support" element={<Support />} />

        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/urge" element={<UrgeEmergency />} />
          <Route path="/relapse" element={<RelapseReflection />} />
          <Route path="/review" element={<WeeklyReview />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/blocking" element={<Blocking />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatedRoutes>
  );
};

function App() {
  const [splashDone, setSplashDone] = React.useState(false);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SplashScreen onDone={() => setSplashDone(true)} />
        {splashDone && (
          <Router>
            <AuthenticatedApp />
          </Router>
        )}
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App