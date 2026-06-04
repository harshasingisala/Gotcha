import React, { useMemo, useRef, useState } from "react";
import AdminPageHeader from "../../components/AdminPageHeader";
import StatusBadge from "../../components/StatusBadge";
import { useGsapMotion } from "../../hooks/useGsapMotion";
import { useItems } from "../../hooks/useItems";
import { api } from "../../lib/api";
import { addDemoNotification, getStoredDemoAuth, upsertDemoItem } from "../../lib/demoData";
import { useNotifStore } from "../../store/notifStore";

const filters = ["all", "lost", "found", "active", "claimed", "returned", "closed"];

export default function AdminItems() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { items, setItems, loading, error } = useItems({ limit: 50 });
  const addNotification = useNotifStore((s) => s.addNotification);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("all");
  const rows = useMemo(() => items.filter((item) => filter === "all" || item.status === filter || item.type === filter), [items, filter]);

  async function update(id, status) {
    const previous = items;
    const next = previous.map((item) => item.id === id ? { ...item, status } : item);
    setItems(next);
    try {
      const res = await api.patch(`/items/${id}/status`, { status });
      if (!res.data?.item) throw new Error("Invalid status response.");
      setItems((current) => current.map((item) => item.id === id ? res.data.item : item));
    } catch {
      if (getStoredDemoAuth()) {
        const changed = previous.find((item) => item.id === id);
        const local = { ...changed, status };
        if (changed) {
          upsertDemoItem(local);
          const notification = addDemoNotification({
            type: status === "returned" ? "item_found" : "moderation",
            title: status === "returned" ? "Item found" : `Listing marked ${status}`,
            body: status === "returned" ? `${changed.title} has been marked as found and returned.` : `${changed.title} was updated by campus moderation.`
          });
          addNotification(notification);
        }
      } else {
        setItems(previous);
      }
    }
  }

  async function bulkClose() {
    for (const id of selected) await update(id, "closed");
    setSelected([]);
  }

  return (
    <section ref={motionRef} className="space-y-5">
      <AdminPageHeader
        title="Item Moderation"
        description="Audit listings, verify public visibility, and close resolved or suspicious reports in bulk."
        actions={<button className="rounded-md bg-navy px-4 py-2 text-sm font-black text-white disabled:opacity-40" disabled={!selected.length} onClick={bulkClose}>Close selected ({selected.length})</button>}
      />
      <div className="motion-reveal flex gap-2 overflow-x-auto rounded-md bg-slate-900 p-2 shadow-soft">
        {filters.map((value) => <button key={value} className={`rounded-md px-4 py-2 text-sm font-black capitalize ${filter === value ? "bg-navy text-white" : "text-slate-100 hover:bg-slate-800"}`} onClick={() => setFilter(value)}>{value}</button>)}
      </div>
      {loading && <p className="text-slate-400">Loading item queue...</p>}
      {error && <p className="text-red-300">{error}</p>}
      <div className="motion-reveal overflow-hidden rounded-md border border-slate-800 bg-slate-900 shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase text-slate-400">
            <tr><th className="p-4"></th><th className="p-4">Listing</th><th className="p-4">Type</th><th className="p-4">Location</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t border-slate-800">
                <td className="p-4"><input type="checkbox" checked={selected.includes(item.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} /></td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img className="h-12 w-12 rounded-md object-cover" src={item.image_url} alt="" />
                    <div><b className="text-slate-100">{item.title}</b><p className="text-xs font-bold text-slate-400">{item.category}</p></div>
                  </div>
                </td>
                <td className="p-4"><StatusBadge status={item.type} /></td>
                <td className="p-4 font-bold text-slate-400">{item.location}</td>
                <td className="p-4"><StatusBadge status={item.status} /></td>
                <td className="space-x-2 p-4 text-right">
                  <button className="rounded-md bg-green-600 px-3 py-2 text-xs font-black text-white" onClick={() => update(item.id, "returned")}>Returned</button>
                  <button className="rounded-md bg-slate-800 px-3 py-2 text-xs font-black text-slate-100" onClick={() => update(item.id, "closed")}>Close</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

