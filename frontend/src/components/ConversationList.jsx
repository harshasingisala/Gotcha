import React from "react";
export default function ConversationList({ conversations, activeId, onSelect }) {
  return <div className="w-full border-r border-surface-strong bg-white md:w-84">
    {!conversations.length && <div className="p-5 text-sm text-muted"><b className="block text-navy">No conversations yet</b><span>Approved claims and item handoffs will appear here.</span></div>}
    {conversations.map((c) => <button key={c.conversation_id} onClick={() => onSelect(c)} className={`block w-full border-b border-surface-strong p-4 text-left transition ${activeId === c.conversation_id ? "bg-orange/8" : "hover:bg-surface/70"}`}><div className="flex justify-between gap-3"><span className="font-black text-navy">{c.other_user?.full_name || "Student"}</span>{c.unread_count ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-orange px-2 text-xs font-black text-white">{c.unread_count}</span> : null}</div><p className="mt-1 truncate text-sm font-medium text-muted">{c.item?.title}</p><p className="mt-2 truncate text-sm text-muted">{c.last_message?.content}</p></button>)}
  </div>;
}
