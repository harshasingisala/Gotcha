import React, { useRef } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import ItemCard from "../components/ItemCard";
import StatCard from "../components/StatCard";
import SkeletonCard from "../components/SkeletonCard";
import SmartMatchPanel from "../components/SmartMatchPanel";
import AiAssistant from "../components/AiAssistant";
import QrRecoveryCard from "../components/QrRecoveryCard";
import { useItems } from "../hooks/useItems";
import { useAdminStats } from "../hooks/useAdmin";
import { useGsapMotion } from "../hooks/useGsapMotion";
import { useCampusInsights } from "../hooks/useCampusData";

export default function Dashboard() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { items, loading, error } = useItems({ status: "active", limit: 6 });
  const { stats } = useAdminStats();
  const { insights } = useCampusInsights();
  const chartData = stats?.monthly_trends || [];
  return (
    <section ref={motionRef} className="space-y-6">
      <div className="student-hero motion-reveal relative overflow-hidden rounded-xl p-6 text-navy md:flex md:items-end md:justify-between" data-parallax-scene>
        <span className="pointer-events-none absolute right-8 top-6 hidden rounded-xl bg-white px-4 py-2 text-xs font-black text-orange-deep shadow-soft md:block" data-float data-parallax="0.18">Live recovery pulse</span>
        <div className="relative z-10">
          <p className="text-sm font-black uppercase text-orange">Student dashboard</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">Welcome back</h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-muted">Find lost belongings, return found items, and track claim progress from one calm recovery desk.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-black">
            {["AI matching active", "Emergency alerts ready", "Connected campus data"].map((chip) => <span key={chip} className="rounded-full bg-white px-3 py-1 text-navy shadow-soft">{chip}</span>)}
          </div>
        </div>
        <div className="relative z-10 mt-5 flex flex-wrap gap-3 md:mt-0">
          <a href="/app/report" className="flex items-center gap-2 rounded-lg bg-orange px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-deep"><span className="material-symbols-outlined text-[18px]">search</span>Report Lost</a>
          <a href="/app/report" className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-black text-navy shadow-sm transition hover:bg-surface"><span className="material-symbols-outlined text-[18px]">campaign</span>Report Found</a>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="motion-reveal" data-tilt><StatCard icon="backpack" number={stats?.lost_items ?? items.filter((i) => i.type === "lost").length} label="Lost items" to="/app/lost-items" /></div>
        <div className="motion-reveal" data-tilt><StatCard icon="travel_explore" number={stats?.found_items ?? items.filter((i) => i.type === "found").length} label="Found items" to="/app/found-items" /></div>
        <div className="motion-reveal" data-tilt><StatCard icon="approval" number={stats?.pending_claims ?? 0} label="Pending claims" to="/app/my-claims" /></div>
        <div className="motion-reveal" data-tilt><StatCard icon="task_alt" number={stats?.recovered_items ?? 0} label="Recovered" /></div>
        <div className="motion-reveal" data-tilt><StatCard icon="monitoring" number={stats?.recovery_rate_percent ?? 0} label="Recovery rate" /></div>
      </div>
      <div className="premium-card motion-reveal rounded-xl p-5" data-tilt>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-text">Recovery trend</h2>
            <p className="text-sm text-muted">Returned items over recent months</p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">Live stats</span>
        </div>
        <div className="h-52"><ResponsiveContainer><BarChart data={chartData}><XAxis dataKey="month" /><YAxis /><Bar dataKey="recovered" fill="#FD761A" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
      <div className="motion-reveal"><SmartMatchPanel /></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="motion-reveal" data-tilt><QrRecoveryCard /></div>
        <div className="premium-card motion-reveal rounded-xl p-5" data-tilt>
          <h2 className="font-black text-navy">Campus Heatmap</h2>
          <p className="text-sm text-muted">Most lost areas this month.</p>
          <div className="mt-4 space-y-3">{insights.heatmap.slice(0, 4).map((zone) => <div key={zone.location} className="flex items-center justify-between rounded-lg bg-surface p-3"><span className="font-black text-text">{zone.location}</span><span className="text-sm font-black text-orange-deep">{zone.count} reports</span></div>)}</div>
        </div>
        <div className="premium-card motion-reveal rounded-xl p-5" data-tilt>
          <h2 className="font-black text-navy">Good Samaritan Board</h2>
          <p className="text-sm text-muted">Reputation points for returns.</p>
          <div className="mt-4 space-y-3">{insights.reputation.map((user) => <div key={user.name} className="flex items-center justify-between rounded-lg bg-surface p-3"><span><b>{user.name}</b><span className="block text-xs text-muted">{user.badge}</span></span><span className="font-black text-navy">{user.points}</span></div>)}</div>
        </div>
      </div>
      <div className="motion-reveal"><AiAssistant /></div>
      <div className="motion-reveal">
        <h2 className="text-xl font-black text-navy">Recent listings</h2>
        <p className="mt-1 text-sm text-muted">The newest active reports from around campus.</p>
        {error && <p className="mt-3 text-red-600">{error}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : items.slice(0, 6).map((item) => <div className="motion-reveal" data-tilt key={item.id}><ItemCard item={item} /></div>)}</div>
      </div>
    </section>
  );
}
