import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="p-8 text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (!user.full_name && location.pathname !== "/setup") return <Navigate to="/setup" replace />;
  return children;
}
