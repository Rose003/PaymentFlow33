import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import critical components normally to avoid routing issues
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import PricingPage from "./pages/PricingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import LegalNoticePage from "./pages/LegalNoticePage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import HelpAndSupport from "./pages/HelpAndSupport";
import SuccessStoriesPage from "./pages/SuccessStoriesPage";
import SubscribePage from "./pages/SubscribePage";
import ReportingRecouvrement from "./pages/ReportingRecouvrement";
import CrmPage from "./pages/CrmPage";
import DSOSimulator from "./pages/DSOSimulator";
import Personnalisation from "./pages/Personnalisation";
import DashboardRedirect from "./components/DashboardRedirect";
import AppHeader from "./components/AppHeader";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ClientPage from "./components/clients/ClientPage";
import ReceivablesList from "./components/receivables/ReceivablesList";
import ReceivableForm from "./components/receivables/ReceivableForm";
import Settings from "./components/settings/Settings";
import ReminderList from "./components/reminders/ReminderList";
import AuthMFA from "./components/AuthMFA";
import ResetPassword from "./components/ResetPassword";

// Only lazy load heavy blog components and less critical pages
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogGarage = lazy(() => import("./pages/BlogGarage"));
const BlogManufacture = lazy(() => import("./pages/BlogManufacture"));
const BlogCommunication = lazy(() => import("./pages/BlogCommunication"));
const BlogComptableBanque = lazy(() => import("./pages/BlogComptableBanque"));
const BlogOptimisationRelance = lazy(() => import("./pages/BlogOptimisationRelance"));
const AbonnementSuccess = lazy(() => import("./pages/success"));
const Success = lazy(() => import("./components/settings/paymentSuccess"));

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
        <Route path="/paiement-abonement" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AbonnementSuccess />
          </Suspense>
        } />
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
            <Suspense fallback={<LoadingSpinner />}>
              <BlogPage setShowContact={() => {}} setDefaultSubject={() => {}} />
            </Suspense>
          }
        />
        <Route path="/blog-garage" element={
          <Suspense fallback={<LoadingSpinner />}>
            <BlogGarage />
          </Suspense>
        } />
        <Route path="/blog-manufacture" element={
          <Suspense fallback={<LoadingSpinner />}>
            <BlogManufacture />
          </Suspense>
        } />
        <Route path="/blog-communication" element={
          <Suspense fallback={<LoadingSpinner />}>
            <BlogCommunication />
          </Suspense>
        } />
        <Route
          path="/blog-comptable-banque"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BlogComptableBanque />
            </Suspense>
          }
        />
        <Route path="/blog-optimisation-relance" element={
          <Suspense fallback={<LoadingSpinner />}>
            <BlogOptimisationRelance />
          </Suspense>
        } />
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
          <Route path="success" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Success />
            </Suspense>
          } />
        </Route>

        {/* Redirection par défaut */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </Router>
  );
}
