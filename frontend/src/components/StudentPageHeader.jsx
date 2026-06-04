import React from "react";
import { Link } from "react-router-dom";

export default function StudentPageHeader({ eyebrow = "Student recovery desk", title, description, icon = "travel_explore", actionLabel, actionTo }) {
  return (
    <header className="student-hero relative overflow-hidden rounded-xl p-5">
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-orange/10 px-3 py-1 text-xs font-black uppercase text-orange-deep">
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black text-navy">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
        {actionLabel && actionTo ? <Link to={actionTo} className="inline-flex items-center gap-2 rounded-lg bg-orange px-4 py-3 text-sm font-black text-white shadow-soft"><span className="material-symbols-outlined text-[18px]">add_circle</span>{actionLabel}</Link> : null}
      </div>
    </header>
  );
}
