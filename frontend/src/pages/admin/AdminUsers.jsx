import React, { useRef, useState } from "react";
import AdminPageHeader from "../../components/AdminPageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useAdminUsers } from "../../hooks/useAdmin";
import { useGsapMotion } from "../../hooks/useGsapMotion";
import { useCampusInsights } from "../../hooks/useCampusData";
import { api } from "../../lib/api";

export default function AdminUsers() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { users, loading, error, load, setRole } = useAdminUsers();
  const { insights } = useCampusInsights();
  const [q, setQ] = useState("");
  const [actions, setActions] = useState({});
  async function recordAction(user, action, label) {
    setActions({ ...actions, [user.id]: label });
    try {
      await api.post(`/admin/users/${user.id}/audit`, { action });
    } catch {
      // Offline demo mode keeps the visible workflow responsive.
    }
  }
  if (loading) return <p className="text-slate-400">Loading users...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section ref={motionRef} className="space-y-5">
      <AdminPageHeader
        title="User Management"
        description="Search students, adjust roles, inspect device signals, and escalate suspicious account behavior."
        actions={<button className="rounded-md bg-navy px-4 py-2 text-sm font-black text-white" onClick={() => load(q)}>Search</button>}
      />
      <div className="motion-reveal flex flex-col gap-3 rounded-md bg-slate-900 p-3 shadow-soft md:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-md border border-slate-800 px-3 py-2">
          <span className="material-symbols-outlined text-slate-400">search</span>
          <input className="w-full bg-transparent text-sm font-bold outline-none" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search name or email" />
        </label>
        <button className="rounded-md bg-orange px-4 py-2 text-sm font-black text-white" onClick={() => load(q)}>Run lookup</button>
      </div>
      <div className="motion-reveal overflow-hidden rounded-md border border-slate-800 bg-slate-900 shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase text-slate-400">
            <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Risk</th><th className="p-4">Device signal</th><th className="p-4">Change role</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const risk = insights.risk_users.find((row) => row.email === user.email) || { risk: 12, device: "Verified browser" };
              return (
                <tr key={user.id} className="border-t border-slate-800">
                  <td className="p-4"><b className="text-slate-100">{user.full_name}</b><p className="text-xs font-bold text-slate-400">{user.email}</p></td>
                  <td className="p-4"><StatusBadge status={user.role} /></td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${risk.risk > 70 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{risk.risk}% risk</span></td>
                  <td className="p-4 font-bold text-slate-400">{risk.device}</td>
                  <td className="p-4"><select className="admin-input py-2" value={user.role} onChange={(event) => setRole(user.id, event.target.value)}><option value="student">student</option><option value="admin">admin</option></select></td>
                  <td className="space-x-2 p-4 text-right">
                    <button className="rounded-md bg-orange/10 px-3 py-2 text-xs font-black text-orange-deep" onClick={() => recordAction(user, "Suspended for review", "Suspended for review")}>Suspend</button>
                    <button className="rounded-md bg-slate-800 px-3 py-2 text-xs font-black text-slate-100" onClick={() => recordAction(user, `Audit opened: ${risk.device}`, `Audit opened: ${risk.device}`)}>Audit</button>
                    {actions[user.id] && <p className="mt-2 text-xs font-black text-green-300">{actions[user.id]}</p>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

