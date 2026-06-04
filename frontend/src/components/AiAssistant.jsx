import React, { useState } from "react";
import { api } from "../lib/api";
import { useItems } from "../hooks/useItems";

const quickPrompts = [
  "How do I claim an item?",
  "Find similar reports",
  "How should pickup work?",
  "What can admins approve?"
];

function localAnswer(question, items = []) {
  const q = question.toLowerCase();
  if (q.includes("claim") || q.includes("proof") || q.includes("owner")) {
    return "Open the item, submit a claim, add a detail only the owner would know, then wait for admin review. Strong proof improves the confidence score.";
  }
  if (q.includes("pickup") || q.includes("message") || q.includes("handoff")) {
    return "Use Messages to coordinate pickup inside the app. Meet at a campus desk or security point and avoid sharing personal contact details.";
  }
  if (q.includes("similar") || q.includes("match") || q.includes("find")) {
    const active = items.filter((item) => item.status === "active").slice(0, 3);
    if (!active.length) return "No active reports are loaded yet. Once reports exist, matching compares category, location, and keywords.";
    return `I found active reports to inspect: ${active.map((item) => `${item.title} near ${item.location}`).join("; ")}.`;
  }
  if (q.includes("report") || q.includes("lost") || q.includes("found")) {
    return "Go to Report Item, choose Lost or Found, add category, location, description, secret proof, and a photo if available.";
  }
  if (q.includes("admin") || q.includes("approve") || q.includes("risk")) {
    return "Admins can review claims, approve or reject ownership proof, moderate listings, audit users, and send campus announcements.";
  }
  return "I can help with reports, claims, smart matches, QR recovery, safe handoffs, and admin review steps.";
}

export default function AiAssistant() {
  const { items } = useItems({ status: "active", limit: 8 });
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ask me about claims, matching, reporting, pickup, QR recovery, or admin review." }
  ]);

  async function ask(prompt = question) {
    const clean = prompt.trim();
    if (!clean || loading) return;
    setQuestion("");
    setLoading(true);
    setMessages((rows) => [...rows, { role: "user", text: clean }]);
    try {
      const res = await api.post("/assistant", { question: clean });
      if (!res.data?.answer) throw new Error("Invalid assistant response.");
      setMessages((rows) => [...rows, { role: "assistant", text: res.data.answer }]);
    } catch {
      setMessages((rows) => [...rows, { role: "assistant", text: localAnswer(clean, items) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-card rounded-xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined grid h-10 w-10 place-items-center rounded-lg bg-orange text-white">smart_toy</span>
          <div><h2 className="font-black text-navy">AI Help Desk</h2><p className="text-sm text-muted">Answers from campus recovery workflows.</p></div>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">{loading ? "Thinking" : "Ready"}</span>
      </div>
      <div className="mt-4 max-h-72 space-y-3 overflow-auto rounded-xl bg-surface p-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`rounded-xl px-4 py-3 text-sm leading-6 shadow-soft ${message.role === "user" ? "ml-auto max-w-[82%] bg-navy text-white" : "mr-auto max-w-[88%] bg-white text-muted"}`}>
            {message.text}
          </div>
        ))}
        {loading && <div className="mr-auto max-w-[70%] rounded-xl bg-white px-4 py-3 text-sm font-black text-orange shadow-soft">Checking campus flow...</div>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => <button key={prompt} type="button" className="rounded-full bg-orange/10 px-3 py-1.5 text-xs font-black text-orange-deep" onClick={() => ask(prompt)}>{prompt}</button>)}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); ask(); }} className="mt-4 flex gap-2">
        <input className="input-polish min-w-0 flex-1" placeholder="Ask about a claim, report, QR, pickup, or match" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <button className="rounded-lg bg-navy px-4 py-2 text-sm font-black text-white disabled:opacity-50" disabled={!question.trim() || loading}>Ask</button>
      </form>
    </div>
  );
}
