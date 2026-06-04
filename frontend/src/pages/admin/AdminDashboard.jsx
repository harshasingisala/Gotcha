import React, { useRef } from "react";
import { Area, AreaChart, Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useAdminStats } from "../../hooks/useAdmin";
import { useGsapMotion } from "../../hooks/useGsapMotion";
import { useCampusInsights } from "../../hooks/useCampusData";

function AdminMetric({ icon, number, label, tone = "slate" }) {
  const toneClass = tone === "orange" ? "bg-orange/15 text-orange" : tone === "red" ? "bg-red-500/15 text-red-300" : "bg-slate-800 text-slate-300";
  return (
    <div className="admin-panel motion-reveal rounded-md p-4" data-tilt>
      <div className="flex items-center justify-between">
        <span className={`material-symbols-outlined grid h-9 w-9 place-items-center rounded-md ${toneClass}`}>{icon}</span>
        <span className="text-[10px] font-black uppercase text-slate-500">Live</span>
      </div>
      <div className="mt-4 text-3xl font-black text-slate-100">{number}</div>
      <div className="text-xs font-black uppercase text-slate-500">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { stats, loading, error } = useAdminStats();
  const { insights } = useCampusInsights();
  if (loading) return <p className="text-slate-400">Loading admin dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  const categories = [{ name: "Lost", value: stats.lost_items }, { name: "Found", value: stats.found_items }];
  const actions = [
    ["verified_user", "Review Claims", "Approve or reject ownership requests", "/admin/claims"],
    ["manage_search", "Audit Listings", "Inspect reported lost and found items", "/admin/items"],
    ["group", "Manage Users", "Promote admins and search students", "/admin/users"],
    ["monitoring", "Analytics", "Open full recovery reports", "/admin/analytics"],
    ["campaign", "Broadcast Alert", "Notify students about high-value items", "/admin/announcements"],
    ["shield", "Security Queue", "Check flagged conversations and claims", "/admin/claims"]
  ];
  return (
    <section ref={motionRef} className="space-y-6">
      <header className="admin-panel motion-reveal relative overflow-hidden rounded-md p-6 text-slate-100 md:flex md:items-end md:justify-between" data-parallax-scene>
        <span className="pointer-events-none absolute right-8 top-6 hidden rounded-md border border-orange/20 bg-orange/10 px-4 py-2 text-xs font-black text-orange md:block" data-float data-parallax="0.18">Risk engine scanning</span>
        <div>
          <p className="text-sm font-black uppercase text-orange">Management Console</p>
          <h1 className="mt-1 text-3xl font-black md:text-4xl">Admin Command Center</h1>
          <p className="mt-2 max-w-2xl text-slate-400">Real-time platform metrics, risk signals, moderation queues, and recovery operations.</p>
        </div>
        <div className="mt-5 flex gap-3 md:mt-0">
          <button className="grid h-11 w-11 place-items-center rounded-md border border-slate-700 bg-slate-950 text-slate-200"><span className="material-symbols-outlined">notifications</span></button>
          <button className="rounded-md bg-orange px-5 py-3 text-sm font-black text-white shadow-sm">Export Report</button>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminMetric icon="group" number={stats.total_users} label="Users" />
        <AdminMetric icon="backpack" number={stats.lost_items} label="Lost" />
        <AdminMetric icon="travel_explore" number={stats.found_items} label="Found" />
        <AdminMetric icon="approval" number={stats.pending_claims} label="Pending" tone="orange" />
        <AdminMetric icon="monitoring" number={stats.recovery_rate_percent} label="Recovery %" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="admin-panel motion-reveal rounded-md p-5 lg:col-span-2" data-tilt>
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="text-lg font-black text-slate-100">Recovered items</h2><p className="text-sm text-slate-400">Month-by-month recovery velocity</p></div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">Live</span>
          </div>
          <div className="h-72"><ResponsiveContainer><AreaChart data={stats.monthly_trends}><XAxis dataKey="month" /><YAxis /><Area dataKey="recovered" stroke="#002452" fill="#D7E2FF" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="admin-panel motion-reveal rounded-md p-5" data-tilt>
          <h2 className="text-lg font-black text-slate-100">Items by type</h2>
          <p className="text-sm text-slate-400">Lost versus found volume</p>
          <div className="h-72"><ResponsiveContainer><PieChart><Pie data={categories} dataKey="value" nameKey="name" fill="#FD761A" label /></PieChart></ResponsiveContainer></div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="admin-panel motion-reveal rounded-md p-5 xl:col-span-2">
          <h2 className="text-lg font-black text-slate-100">Admin actions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {actions.map(([icon, title, text, href]) => (
              <a key={title} href={href} className="motion-reveal flex items-start gap-3 rounded-md bg-slate-800 p-4 transition hover:bg-slate-700" data-tilt>
                <span className="material-symbols-outlined grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-900 text-slate-100">{icon}</span>
                <span><span className="block font-black text-slate-100">{title}</span><span className="text-sm text-slate-400">{text}</span></span>
              </a>
            ))}
          </div>
        </div>
        <div className="admin-panel motion-reveal rounded-md p-5" data-tilt>
          <h2 className="text-lg font-black text-slate-100">Claim SLA</h2>
          <p className="text-sm text-slate-400">Pending claim load by priority</p>
          <div className="mt-4 h-56"><ResponsiveContainer><BarChart data={[{ name: "Low", count: 4 }, { name: "Med", count: 6 }, { name: "High", count: 1 }]}><XAxis dataKey="name" /><YAxis /><Bar dataKey="count" fill="#FD761A" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="motion-reveal rounded-md border border-red-100 bg-slate-900 p-5 shadow-soft" data-tilt>
          <div className="flex items-center justify-between"><h2 className="text-lg font-black text-slate-100">Suspicious User Detection</h2><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">Risk engine</span></div>
          <div className="mt-4 space-y-3">{insights.risk_users.map((user) => <div key={user.email} className="rounded-md bg-slate-800 p-4"><div className="flex items-center justify-between"><b className="text-slate-100">{user.name}</b><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.risk > 70 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{user.risk}% risk</span></div><p className="mt-1 text-sm text-slate-400">{user.claims} claims, {user.rejected} rejected - {user.device} - {user.ip}</p></div>)}</div>
        </div>
        <div className="admin-panel motion-reveal rounded-md p-5" data-tilt>
          <h2 className="text-lg font-black text-slate-100">Immutable Audit Trail</h2>
          <div className="mt-4 space-y-3">{insights.audit_trail.map((event) => <div key={event.id} className="flex gap-3 rounded-md bg-slate-800 p-4"><span className="material-symbols-outlined text-orange">history</span><div><b className="text-slate-100">{event.action}</b><p className="text-sm text-slate-400">{event.actor} - {event.target}</p></div></div>)}</div>
        </div>
      </div>
    </section>
  );
}

