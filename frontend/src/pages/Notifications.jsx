import React from "react";
import ActivityFeed from "../components/ActivityFeed";
import EmptyState from "../components/EmptyState";
import StudentPageHeader from "../components/StudentPageHeader";
import { useNotifications } from "../hooks/useNotifications";

export default function Notifications() {
  const { notifications, loading, error, readAll } = useNotifications();
  if (loading) return <p className="text-muted">Loading notifications...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  const groups = { Today: notifications.slice(0, 2), Earlier: notifications.slice(2) };

  return (
    <section className="space-y-5">
      <StudentPageHeader icon="notifications" title="Notifications" description="Follow match alerts, claim movement, messages, and campus broadcasts grouped by when they matter." />
      <div className="flex justify-end"><button className="rounded-lg bg-navy px-4 py-2 font-black text-white" onClick={readAll}>Mark all read</button></div>
      <div className="space-y-6">
        {notifications.length ? Object.entries(groups).map(([label, rows]) => rows.length ? <div key={label}><h2 className="mb-3 text-sm font-black uppercase text-orange-deep">{label}</h2><ActivityFeed items={rows} /></div> : null) : <EmptyState message="No notifications yet." />}
      </div>
    </section>
  );
}
