import React, { useRef, useState } from "react";
import AdminPageHeader from "../../components/AdminPageHeader";
import { useGsapMotion } from "../../hooks/useGsapMotion";
import { useAnnouncements } from "../../hooks/useCampusData";

export default function AdminAnnouncements() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const { announcements, loading, error, create } = useAnnouncements(true);
  const [sent, setSent] = useState("");
  const [form, setForm] = useState({ title: "", body: "", audience: "all", scheduled: false });

  async function submit(event) {
    event.preventDefault();
    await create({
      title: form.title,
      body: form.body,
      audience: form.audience,
      status: form.scheduled ? "scheduled" : "sent",
    });
    setSent(form.scheduled ? "Announcement scheduled and added to student notifications." : "Announcement sent to student notifications.");
    setForm({ title: "", body: "", audience: "all", scheduled: false });
  }

  return (
    <section ref={motionRef} className="space-y-5">
      <AdminPageHeader title="Announcements" description="Compose campus broadcasts, schedule recovery notices, and preview exactly what students will see." />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <form onSubmit={submit} className="admin-panel motion-reveal rounded-md p-6" data-tilt>
          <h2 className="text-xl font-black text-slate-100">Compose broadcast</h2>
          <div className="mt-5 grid gap-3">
            <input className="admin-input" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <textarea className="admin-input" rows="7" placeholder="Body" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} required />
            <select className="admin-input" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })}><option value="all">All students</option><option value="students">Students</option><option value="admins">Admins</option></select>
            <label className="flex items-center gap-2 rounded-md bg-slate-800 p-3 text-sm font-black text-slate-100"><input type="checkbox" checked={form.scheduled} onChange={(event) => setForm({ ...form, scheduled: event.target.checked })} /> Schedule for later</label>
          </div>
          <div className="mt-5 rounded-md border border-orange/20 bg-orange/5 p-4">
            <p className="text-xs font-black uppercase text-orange-deep">Preview</p>
            <b className="mt-2 block text-slate-100">{form.title || "Announcement preview"}</b>
            <p className="mt-2 text-sm leading-6 text-slate-400">{form.body || "Your notification body appears here."}</p>
          </div>
          {sent && <p className="mt-4 rounded-md bg-green-950/70 p-3 text-sm font-black text-green-300">{sent}</p>}
          <button className="mt-5 rounded-md bg-navy px-5 py-3 font-black text-white">Send announcement</button>
        </form>
        <div className="admin-panel motion-reveal rounded-md p-6" data-tilt>
          <h2 className="font-black text-slate-100">Campaign history</h2>
          {loading && <p className="mt-4 text-sm text-slate-400">Loading campaigns...</p>}
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <div className="mt-4 space-y-3">{announcements.map((item) => <div className="rounded-md bg-slate-800 p-3" key={item.id || `${item.title}-${item.when}`}><b className="text-slate-100">{item.title}</b><p className="text-sm capitalize text-slate-400">{item.status} - {item.when || new Date(item.created_at).toLocaleDateString()}</p>{item.body && <p className="mt-2 text-xs leading-5 text-slate-500">{item.body}</p>}</div>)}</div>
        </div>
      </div>
    </section>
  );
}

