import React, { useEffect, useState } from "react";
import { campusZones, itemCategories } from "../lib/taxonomy";

const lifecycleFilters = [
  { label: "Open", status: "active", lifecycle_state: "" },
  { label: "Matched", status: "active", lifecycle_state: "matched" },
  { label: "Claimed", status: "active", lifecycle_state: "claimed" },
  { label: "Verified", status: "claimed", lifecycle_state: "verified" },
  { label: "Closed", status: "", lifecycle_state: "closed" }
];

export default function FilterBar({ type, onChange }) {
  const [activeLifecycle, setActiveLifecycle] = useState("Open");
  const [filters, setFilters] = useState({
    type,
    q: "",
    category: "",
    location: "",
    location_zone: "",
    status: "active",
    lifecycle_state: "",
    date_from: "",
    date_to: ""
  });

  useEffect(() => {
    const timer = setTimeout(() => onChange(filters), 300);
    return () => clearTimeout(timer);
  }, [filters, onChange]);

  function setLifecycle(next) {
    setActiveLifecycle(next.label);
    setFilters({ ...filters, status: next.status, lifecycle_state: next.lifecycle_state });
  }

  return (
    <div className="glass-panel rounded-xl p-4 shadow-soft">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["", ...itemCategories].map((category) => (
          <button
            key={category || "all"}
            className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-black transition ${filters.category === category ? "bg-orange text-white" : "bg-white text-navy ring-1 ring-surface-strong hover:bg-surface"}`}
            onClick={() => setFilters({ ...filters, category })}
          >
            {category || "All"}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {lifecycleFilters.map((item) => (
          <button
            key={item.label}
            className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-black transition ${activeLifecycle === item.label ? "bg-navy text-white" : "bg-surface text-navy hover:bg-surface-high"}`}
            onClick={() => setLifecycle(item)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <label className="flex min-h-12 items-center gap-2 rounded-lg border border-outline bg-white px-3">
          <span className="material-symbols-outlined text-[20px] text-muted">search</span>
          <input className="w-full border-0 p-0 text-sm outline-none focus:ring-0" placeholder="Search phone, ID card, blue bag..." value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
        </label>
        <select className="min-h-12 rounded-lg border border-outline bg-white px-3 text-sm font-bold text-navy" value={filters.location_zone} onChange={(event) => setFilters({ ...filters, location_zone: event.target.value })} aria-label="Campus zone">
          <option value="">All zones</option>
          {campusZones.map((zone) => <option key={zone}>{zone}</option>)}
        </select>
        <input className="min-h-12 rounded-lg border border-outline bg-white px-3 text-sm" type="date" value={filters.date_from} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} aria-label="Posted after" />
        <input className="min-h-12 rounded-lg border border-outline bg-white px-3 text-sm" type="date" value={filters.date_to} onChange={(event) => setFilters({ ...filters, date_to: event.target.value })} aria-label="Posted before" />
      </div>
    </div>
  );
}
