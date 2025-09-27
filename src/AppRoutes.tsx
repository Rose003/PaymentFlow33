import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Lazy load components for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const LegalNoticePage = lazy(() => import("./pages/LegalNoticePage"));
const TermsOfUsePage = lazy(() => import("./pages/TermsOfUsePage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogGarage = lazy(() => import("./pages/BlogGarage"));
const BlogManufacture = lazy(() => import("./pages/BlogManufacture"));
const BlogCommunication = lazy(() => import("./pages/BlogCommunication"));
const BlogComptableBanque = lazy(() => import("./pages/BlogComptableBanque"));
const BlogOptimisationRelance = lazy(() => import("./pages/BlogOptimisationRelance"));
const HelpAndSupport = lazy(() => import("./pages/HelpAndSupport"));
const SuccessStoriesPage = lazy(() => import("./pages/SuccessStoriesPage"));
const AbonnementSuccess = lazy(() => import("./pages/success"));
const SubscribePage = lazy(() => import("./pages/SubscribePage"));
const ReportingRecouvrement = lazy(() => import("./pages/ReportingRecouvrement"));
const CrmPage = lazy(() => import("./pages/CrmPage"));
const DSOSimulator = lazy(() => import("./pages/DSOSimulator"));
const Personnalisation = lazy(() => import("./pages/Personnalisation"));

// Dashboard components (lazy loaded)
const Layout = lazy(() => import("./components/Layout"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const ClientPage = lazy(() => import("./components/clients/ClientPage"));
const ReceivablesList = lazy(() => import("./components/receivables/ReceivablesList"));
const ReceivableForm = lazy(() => import("./components/receivables/ReceivableForm"));
const Settings = lazy(() => import("./components/settings/Settings"));
const ReminderList = lazy(() => import("./components/reminders/ReminderList"));
const Success = lazy(() => import("./components/settings/paymentSuccess"));
const AuthMFA = lazy(() => import("./components/AuthMFA"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));

// Keep critical components non-lazy for faster initial load
import DashboardRedirect from "./components/DashboardRedirect";
import AppHeader from "./components/AppHeader";

import { User } from "@supabase/supabase-js";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

interface AppRoutesProps {
  user: User | null;
  mfaRequired?: boolean;
  onMFASuccess?: () => void;
}

export default function AppRoutes({ user, onMFASuccess }: AppRoutesProps) {
  return (
    <Router>
      {!user && <AppHeader user={user} onContactClick={() => {}} />}

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* Routes publiques */}
        <Route
          path="/"
          element={
            !user ? (
              <LandingPage onGetStarted={() => {}} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="/help" element={<HelpAndSupport />} />
        <Route path="/temoignages" element={<SuccessStoriesPage />} />
        <Route path="/subscribe" element={<SubscribePage />} />
        <Route
          path="/reporting-recouvrement"
          element={<ReportingRecouvrement />}
        />
        <Route path="/crm" element={<CrmPage />} />
        <Route path="/simulateur-dso" element={<DSOSimulator />} />
        <Route path="/personnalisation" element={<Personnalisation />} />
        <Route path="/paiement-abonement" element={<AbonnementSuccess />} />
        <Route
          path="/signup"
          element={
            !user ? <SignupPage /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pricing" element={<PricingPage setShowContact={() => {}} setDefaultSubject={() => {}} />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/mentions-legales" element={<LegalNoticePage />} />
        <Route path="/conditions-utilisation" element={<TermsOfUsePage />} />
        <Route
          path="/blog"
          element={
            <BlogPage setShowContact={() => {}} setDefaultSubject={() => {}} />
          }
        />
        <Route path="/blog-garage" element={<BlogGarage />} />
        <Route path="/blog-manufacture" element={<BlogManufacture />} />
        <Route path="/blog-communication" element={<BlogCommunication />} />
        <Route
          path="/blog-comptable-banque"
          element={<BlogComptableBanque />}
        />
        <Route path="/blog-optimisation-relance" element={<BlogOptimisationRelance />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Routes protégées */}
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route path="dashboard">
            <Route index element={<DashboardRedirect />} />
            <Route path=":email" element={<Dashboard />} />
          </Route>
          <Route
            path="mfa"
            element={<AuthMFA onMFASuccess={onMFASuccess || (() => {})} />}
          />
          <Route path="clients" element={<ClientPage />} />
          <Route path="receivables" element={<ReceivablesList />} />
          <Route path="receivables/new" element={<ReceivableForm onClose={() => {}} onReceivableAdded={() => {}} />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reminders" element={<ReminderList />} />
          <Route path="success" element={<Success />} />
        </Route>

        {/* Redirection par défaut */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} replace />}
        />
        </Routes>
      </Suspense>
    </Router>
  );
}
