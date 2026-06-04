import React from "react";
import StudentPageHeader from "../components/StudentPageHeader";
import { useCampusInsights } from "../hooks/useCampusData";

export default function CampusMap() {
  const { insights, loading, error } = useCampusInsights();
  const zones = insights.heatmap;
  return (
    <section className="space-y-5">
      <StudentPageHeader icon="map" title="Campus Heatmap" description="See where belongings are most often lost, found, and returned across campus." />
      {loading && <p className="text-muted">Loading campus signals...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="relative aspect-[16/9] min-h-[420px] overflow-hidden rounded-xl border border-surface-strong bg-white shadow-lift">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#e2e8f0_1px,transparent_1px),linear-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-6 rounded-xl bg-[radial-gradient(circle_at_20%_30%,rgba(253,118,26,0.18),transparent_12rem),radial-gradient(circle_at_65%_45%,rgba(0,36,82,0.12),transparent_14rem)]" />
        {zones.map((zone) => (
          <div key={zone.location} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${zone.left}%`, top: `${zone.top}%` }}>
            <div className={`grid rounded-full text-white shadow-lift ${zone.risk === "High" ? "h-24 w-24 bg-orange/90" : zone.risk === "Medium" ? "h-20 w-20 bg-navy/85" : "h-16 w-16 bg-green-600/80"} place-items-center text-center`}>
              <span className="text-xs font-black">{zone.count}<br />reports</span>
            </div>
            <div className="mt-2 rounded-lg bg-white px-3 py-2 text-center text-xs font-black text-navy shadow-soft">{zone.location}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {zones.map((zone) => <div key={zone.location} className="premium-card rounded-xl p-4"><b className="text-navy">{zone.location}</b><p className="mt-1 text-sm text-muted">{zone.risk} risk area</p></div>)}
      </div>
    </section>
  );
}
