import React from "react";
import { useState } from "react";
import ItemCard from "./ItemCard";

export default function ChatWindow({ thread, onSend }) {
  const [content, setContent] = useState("");
  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    await onSend(content);
    setContent("");
  }
  if (!thread) return <div className="grid min-h-[60vh] flex-1 place-items-center bg-surface/40 p-8 text-center text-muted"><div><span className="material-symbols-outlined text-5xl text-orange">forum</span><p className="mt-3 font-black text-navy">Select a conversation</p><p className="mt-1 text-sm">Your handoff messages will appear here.</p></div></div>;
  return <div className="flex min-h-[70vh] flex-1 flex-col bg-white"><div className="border-b border-surface-strong p-4">{thread.item && <ItemCard item={thread.item} />}</div><div className="flex-1 space-y-3 overflow-auto bg-[radial-gradient(circle_at_top_left,rgba(253,118,26,0.08),transparent_16rem)] p-4">{thread.messages.map((m) => <div key={m.id} className={`max-w-[72%] rounded-xl px-4 py-3 text-sm font-semibold shadow-soft ${m.sender_id === thread.me ? "ml-auto bg-navy text-white" : "bg-white text-text"}`}>{m.content}</div>)}</div><form onSubmit={submit} className="flex gap-2 border-t border-surface-strong bg-white p-4"><textarea className="max-h-24 min-h-12 flex-1 rounded-lg border border-outline px-3 py-2 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/10" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a safe handoff message" /><button className="min-h-12 rounded-lg bg-orange px-4 font-black text-white">Send</button></form></div>;
}
