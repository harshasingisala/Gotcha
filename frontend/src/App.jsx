import React, { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollProgress from "./components/ScrollProgress";
import SkeletonPage from "./components/SkeletonPage";

const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

const AppLayout = lazy(() => import("./layouts/AppLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
const LandingPage = lazyNamed(() => import("./pages/PublicPages"), "LandingPage");
const AboutPage = lazyNamed(() => import("./pages/PublicPages"), "AboutPage");
const ServicesPage = lazyNamed(() => import("./pages/PublicPages"), "ServicesPage");
const ContactPage = lazyNamed(() => import("./pages/PublicPages"), "ContactPage");
const PublicItemsPage = lazyNamed(() => import("./pages/PublicPages"), "PublicItemsPage");
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LostItems = lazy(() => import("./pages/LostItems"));
const FoundItems = lazy(() => import("./pages/FoundItems"));
const ReportItem = lazy(() => import("./pages/ReportItem"));
const ItemDetail = lazy(() => import("./pages/ItemDetail"));
const MyClaims = lazy(() => import("./pages/MyClaims"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const CampusMap = lazy(() => import("./pages/CampusMap"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminClaims = lazy(() => import("./pages/admin/AdminClaims"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminItems = lazy(() => import("./pages/admin/AdminItems"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const Login = lazy(() => import("./pages/auth/Login"));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));
const ProfileSetup = lazy(() => import("./pages/auth/ProfileSetup"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollProgress />
        <Suspense fallback={<SkeletonPage />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/items" element={<PublicItemsPage />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
              <Route path="/profile-setup" element={<Navigate to="/setup" replace />} />
            </Route>
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/lost-items" element={<LostItems />} />
              <Route path="/app/found-items" element={<FoundItems />} />
              <Route path="/app/report" element={<ReportItem />} />
              <Route path="/app/items/:id" element={<ItemDetail />} />
              <Route path="/app/my-claims" element={<MyClaims />} />
              <Route path="/app/claims" element={<Navigate to="/app/my-claims" replace />} />
              <Route path="/app/messages" element={<Messages />} />
              <Route path="/app/notifications" element={<Notifications />} />
              <Route path="/app/profile" element={<Profile />} />
              <Route path="/app/map" element={<CampusMap />} />
            </Route>
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/claims" element={<AdminClaims />} />
              <Route path="/admin/items" element={<AdminItems />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            </Route>
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/lost-items" element={<Navigate to="/app/lost-items" replace />} />
            <Route path="/found-items" element={<Navigate to="/app/found-items" replace />} />
            <Route path="/report" element={<Navigate to="/app/report" replace />} />
            <Route path="/claims" element={<Navigate to="/app/my-claims" replace />} />
            <Route path="/messages" element={<Navigate to="/app/messages" replace />} />
            <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
