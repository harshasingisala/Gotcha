import React from "react";
import { differenceInDays, formatDistanceToNow, isPast } from "date-fns";
import { Link, useLocation } from "react-router-dom";
import { categoryIcons, lifecycleLabels } from "../lib/taxonomy";
import StatusBadge from "./StatusBadge";

export default function ItemCard({ item }) {
  const location = useLocation();
  const isPublic = !location.pathname.startsWith("/app") && !location.pathname.startsWith("/admin");
  const to = isPublic ? "/login" : `/app/items/${item.id}`;
  const lifecycle = item.lifecycle_state || (item.status === "returned" || item.status === "closed" ? "closed" : item.status === "claimed" ? "verified" : "reported");
  const createdAt = item.created_at ? new Date(item.created_at) : null;
  const expiresAt = item.expires_at ? new Date(item.expires_at) : null;
  const stale = lifecycle !== "closed" && ((expiresAt && isPast(expiresAt)) || (createdAt && differenceInDays(new Date(), createdAt) >= 7));
  const zone = item.location_zone || item.location || "Unknown zone";
  return (
    <Link to={to} className="group block min-h-[360px] overflow-hidden rounded-xl border border-surface-strong/80 bg-white p-3 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-navy/20 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface">
        {item.image_url ? <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={item.image_url} alt={item.title} /> : <div className="grid h-full place-items-center text-muted"><span className="material-symbols-outlined text-5xl text-navy/35">image</span></div>}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/75 to-transparent" />
        <div className="absolute left-3 top-3"><StatusBadge status={item.type} /></div>
        {stale && <div className="absolute right-3 top-3"><StatusBadge status="expired" label="Possibly expired" /></div>}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-navy shadow-md backdrop-blur">
          <span className="material-symbols-outlined text-[15px]">{categoryIcons[item.category] || "inventory_2"}</span>
          {item.category || "Item"}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="truncate font-black text-text group-hover:text-navy">{item.title}</h3>
          <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted"><span className="material-symbols-outlined text-[17px]">location_on</span>{zone}</p>
        </div>
        <StatusBadge status={lifecycle} label={lifecycleLabels[lifecycle] || lifecycle} />
      </div>
      {item.location && item.location !== zone && <p className="mt-2 truncate px-1 text-xs font-bold text-muted">{item.location}</p>}
      <div className="mt-3 flex items-center justify-between px-1 pb-1">
        <p className="flex items-center gap-1 text-xs font-bold text-muted"><span className="material-symbols-outlined text-[16px]">schedule</span>{createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : ""}</p>
        <span className="flex items-center gap-1 text-xs font-black text-orange-deep opacity-0 transition group-hover:opacity-100">Open <span className="material-symbols-outlined text-[15px]">arrow_forward</span></span>
      </div>
    </Link>
  );
}
