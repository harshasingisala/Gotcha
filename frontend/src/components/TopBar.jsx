import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import NotificationBell from "./NotificationBell";

export default function TopBar() {
  const { user, clearAuth } = useAuthStore();
  async function logout() {
    await supabase.auth.signOut();
    clearAuth();
  }
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/70 bg-white/78 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-2 text-xl font-bold text-navy md:hidden">
        <span className="material-symbols-outlined filled">location_on</span>
        Campus Found
      </div>
      <label className="hidden w-full max-w-md items-center gap-2 rounded-lg border border-surface-strong bg-white px-4 py-2 text-sm shadow-soft md:flex">
        <span className="material-symbols-outlined text-[20px] text-muted">search</span>
        <input className="w-full border-0 bg-transparent p-0 text-sm outline-none focus:ring-0" placeholder="Search campus lost and found" />
      </label>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <Link to="/app/profile" className="hidden rounded-lg bg-white px-3 py-2 text-sm font-bold text-navy shadow-soft md:block">{user?.full_name || user?.email}</Link>
        <button className="rounded-lg border border-outline/70 bg-white px-3 py-2 text-sm font-bold text-muted transition hover:text-navy" onClick={logout}>Sign out</button>
      </div>
    </header>
  );
}
