import React from "react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed({ items }) {
  return <div className="space-y-3">{items.map((n) => <div key={n.id} className="premium-card flex gap-3 rounded-xl p-4"><span className="material-symbols-outlined grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange/10 text-orange">notifications_active</span><div><div className="font-black text-navy">{n.title}</div><p className="mt-1 text-sm leading-6 text-muted">{n.body}</p><p className="mt-2 text-xs font-bold text-orange-deep">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p></div></div>)}</div>;
}
