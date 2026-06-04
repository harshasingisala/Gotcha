import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="p-8 text-muted">Loading admin...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/app/dashboard" replace />;
  return children;
}
