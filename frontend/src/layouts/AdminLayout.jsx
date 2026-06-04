import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

const nav = [
  ["/admin/dashboard", "dashboard", "Dashboard"],
  ["/admin/claims", "verified_user", "Claims"],
  ["/admin/items", "inventory_2", "Items"],
  ["/admin/users", "group", "Users"],
  ["/admin/analytics", "monitoring", "Analytics"],
  ["/admin/announcements", "campaign", "Announcements"]
];

export default function AdminLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  async function logout() {
    await supabase.auth.signOut();
    clearAuth();
  }
  return (
    <div className="admin-shell min-h-screen text-slate-100">
      <aside className="admin-rail fixed left-0 top-0 z-50 hidden h-full w-[280px] flex-col py-6 text-slate-100 shadow-lg md:flex">
        <div className="mb-8 flex items-center gap-3 px-6">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-orange text-white"><span className="material-symbols-outlined filled">admin_panel_settings</span></div>
          <div><div className="text-xl font-black">Campus Found</div><div className="text-xs font-bold uppercase text-slate-500">Management Console</div></div>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {nav.map(([to, icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => `mx-2 flex items-center gap-3 rounded-md px-4 py-3 text-sm font-black ${isActive ? "bg-orange text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}><span className="material-symbols-outlined text-[20px]">{icon}</span>{label}</NavLink>)}
        </nav>
        <div className="px-6"><button className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-black text-slate-200" onClick={logout}>Sign out</button></div>
      </aside>
      <main className="min-h-screen md:ml-[280px]">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/82 px-4 backdrop-blur md:px-6">
          <div><b className="text-slate-100">Admin Console</b><p className="text-xs text-slate-500">{user?.full_name || user?.email}</p></div>
          <div className="flex gap-2"><button className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-black text-slate-200" onClick={() => navigate("/admin/analytics")}>Export</button><button className="rounded-md bg-orange px-4 py-2 text-sm font-black text-white" onClick={() => navigate("/admin/announcements")}>New Alert</button></div>
        </header>
        <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-5 md:px-6 md:py-6"><Outlet /></div>
      </main>
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-6 rounded-md border border-slate-700 bg-slate-950/92 p-2 shadow-lift backdrop-blur-xl md:hidden">
        {nav.map(([to, icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-black ${isActive ? "bg-orange text-white" : "text-slate-500"}`}>
            <span className="material-symbols-outlined text-[19px]">{icon}</span>
            {label.split(" ")[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
