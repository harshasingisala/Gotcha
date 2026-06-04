import React from "react";

export default function AdminPageHeader({ title, eyebrow = "Admin console", description, actions }) {
  return (
    <header className="admin-panel relative overflow-hidden rounded-md p-5">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(253,118,26,0.20),transparent_16rem)]" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-orange-deep">{eyebrow}</p>
          <h1 className="mt-1 text-3xl font-black text-slate-100">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
