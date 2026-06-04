import React, { useRef } from "react";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import AdminPageHeader from "../../components/AdminPageHeader";
import { useGsapMotion } from "../../hooks/useGsapMotion";
import { useAdminAnalytics } from "../../hooks/useCampusData";

export default function AdminAnalytics() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { analytics, loading, error } = useAdminAnalytics();
  const categoryData = analytics.category_breakdown;
  const locationData = analytics.location_breakdown;
  if (loading) return <p className="text-slate-400">Loading analytics...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section ref={motionRef} className="space-y-5">
      <AdminPageHeader
        title="Analytics"
        description="Track recovery velocity, category pressure, and campus hotspots with decision-ready reporting."
        actions={<select className="admin-input py-2"><option>Last 30 days</option><option>Last 90 days</option><option>All time</option></select>}
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Chart title="Items recovered"><LineChart data={analytics.monthly_trends}><XAxis dataKey="month" /><YAxis /><Line dataKey="recovered" stroke="#002452" strokeWidth={3} /></LineChart></Chart>
        <Chart title="Category breakdown"><PieChart><Pie data={categoryData} dataKey="count" nameKey="name" fill="#FD761A" label /></PieChart></Chart>
        <Chart title="Top locations"><BarChart data={locationData.slice(0, 6)}><XAxis dataKey="name" hide /><YAxis /><Bar dataKey="count" fill="#FD761A" radius={[6, 6, 0, 0]} /></BarChart></Chart>
      </div>
      <div className="admin-panel motion-reveal rounded-md p-5" data-tilt>
        <h2 className="text-lg font-black text-slate-100">Recovery by category</h2>
        <div className="mt-4 overflow-hidden rounded-md border border-slate-800">
          <table className="w-full text-sm">
            <tbody>{categoryData.map((row) => <tr className="border-t border-slate-800 first:border-t-0" key={row.name}><td className="p-3 font-black text-slate-100">{row.name}</td><td className="p-3 font-bold text-slate-400">{row.count} reports</td><td className="p-3 font-bold text-green-700">{row.recovery_rate_percent ?? 0}% recovered</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Chart({ title, children }) {
  return <div className="admin-panel motion-reveal rounded-md p-5" data-tilt><h2 className="font-black text-slate-100">{title}</h2><div className="mt-4 h-64"><ResponsiveContainer>{children}</ResponsiveContainer></div></div>;
}

