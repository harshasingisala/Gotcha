import React from "react";
import { Link } from "react-router-dom";

export default function StatCard({ icon, number, label, to = "/app/dashboard" }) {
  return (
    <div className="group premium-card rounded-xl p-5 transition hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy text-white transition group-hover:scale-110">
          <span className="material-symbols-outlined text-[21px]">{icon}</span>
        </div>
        <Link to={to} className="flex items-center gap-1 text-xs font-black text-orange-deep">View <span className="material-symbols-outlined text-[15px]">arrow_forward</span></Link>
      </div>
      <div className="mt-5 text-3xl font-black text-text">{number}</div>
      <div className="text-sm font-bold text-muted">{label}</div>
    </div>
  );
}
