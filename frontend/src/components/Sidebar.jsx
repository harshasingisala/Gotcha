import React from "react";
import { NavLink } from "react-router-dom";
import { useNotifStore } from "../store/notifStore";

const nav = [
  ["/app/dashboard", "dashboard", "Dashboard"],
  ["/app/lost-items", "search", "Lost Items"],
  ["/app/found-items", "travel_explore", "Found Items"],
  ["/app/report", "add_circle", "Report Item"],
  ["/app/my-claims", "compare_arrows", "My Claims"],
  ["/app/messages", "chat", "Messages"],
  ["/app/notifications", "notifications", "Notifications"],
  ["/app/profile", "account_circle", "Profile"]
];

export default function Sidebar() {
  const unread = useNotifStore((s) => s.unread);
  return (
    <aside className="student-rail fixed left-0 top-0 z-50 hidden h-full w-[280px] flex-col py-6 text-navy shadow-lg md:flex">
      <div className="mb-8 flex items-center gap-3 px-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange text-white shadow-soft">
          <span className="material-symbols-outlined filled">location_on</span>
        </div>
        <div>
          <div className="text-xl font-bold leading-tight">Campus Found</div>
          <div className="text-xs font-black uppercase text-orange-deep">Student Portal</div>
        </div>
      </div>
      <nav className="hide-scrollbar flex-1 space-y-1 overflow-y-auto px-2">
        {nav.map(([to, icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `mx-2 flex items-center justify-between rounded-lg px-4 py-3 text-sm font-black transition-all ${isActive ? "bg-navy text-white shadow-md" : "text-muted hover:bg-surface hover:text-navy"}`}>
            <span className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </span>
            {label === "Notifications" && unread > 0 ? <span className="rounded-full bg-orange px-2 py-0.5 text-xs text-white">{unread}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 pt-6">
        <NavLink to="/app/report" className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-deep">
          <span className="material-symbols-outlined text-[18px]">campaign</span>
          Report Found Item
        </NavLink>
      </div>
    </aside>
  );
}
