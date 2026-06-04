import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const mobileNav = [
  ["/app/dashboard", "dashboard", "Home"],
  ["/app/lost-items", "search", "Lost"],
  ["/app/report", "add_circle", "Report"],
  ["/app/messages", "chat", "Chat"],
  ["/app/profile", "account_circle", "Me"]
];

export default function AppLayout() {
  return (
    <div className="student-shell min-h-screen text-text">
      <Sidebar />
      <main className="min-h-screen min-w-0 md:ml-[280px]">
        <TopBar />
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-5 md:px-6 md:py-5">
          <Outlet />
        </div>
      </main>
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-xl border border-white/70 bg-white/92 p-2 shadow-lift backdrop-blur-xl md:hidden">
        {mobileNav.map(([to, icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-black ${isActive ? "bg-navy text-white" : "text-muted"}`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
