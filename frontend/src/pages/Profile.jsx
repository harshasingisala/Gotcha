import React, { useState } from "react";
import StudentPageHeader from "../components/StudentPageHeader";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ full_name: user.full_name || "", student_id: user.student_id || "", college: user.college || "" });
  const [saved, setSaved] = useState(false);

  async function submit(event) {
    event.preventDefault();
    await updateProfile(form);
    setSaved(true);
  }

  return (
    <section className="space-y-5">
      <StudentPageHeader icon="account_circle" title="Profile" description="Keep your campus identity current so claims and verified handoffs stay smooth." />
      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="student-hero rounded-xl p-5">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-orange text-3xl font-black text-white">{(form.full_name || user.email || "S").slice(0, 1).toUpperCase()}</div>
          <h2 className="mt-4 text-2xl font-black text-navy">{form.full_name || "Student"}</h2>
          <p className="mt-1 text-sm font-bold text-muted">{user.email}</p>
          <div className="mt-5 rounded-lg bg-white p-3 text-sm font-bold text-muted shadow-soft">Verified demo student profile</div>
        </div>
        <form onSubmit={submit} className="premium-card grid gap-4 rounded-xl p-5">
          <label className="text-sm font-black text-navy">Full name<input className="mt-2 w-full rounded-lg border border-outline p-3 font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></label>
          <label className="text-sm font-black text-navy">Student ID<input className="mt-2 w-full rounded-lg border border-outline p-3 font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10" value={form.student_id} onChange={(event) => setForm({ ...form, student_id: event.target.value })} /></label>
          <label className="text-sm font-black text-navy">College<input className="mt-2 w-full rounded-lg border border-outline p-3 font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10" value={form.college} onChange={(event) => setForm({ ...form, college: event.target.value })} /></label>
          <button className="rounded-lg bg-navy px-4 py-3 font-black text-white">Save profile</button>
          {saved && <p className="rounded-lg bg-green-100 p-3 text-sm font-black text-green-700">Profile saved.</p>}
        </form>
      </div>
    </section>
  );
}
