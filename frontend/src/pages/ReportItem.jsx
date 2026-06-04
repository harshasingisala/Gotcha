import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../hooks/useItems";
import { useGsapMotion } from "../hooks/useGsapMotion";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { generateAiDescription } from "../lib/demoData";
import { campusZones, itemCategories } from "../lib/taxonomy";
import { useAuthStore } from "../store/authStore";
import { compressImage } from "../utils/compressImage";

export default function ReportItem() {
  const motionRef = useRef(null);
  useGsapMotion(motionRef);
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [step, setStep] = useState(1);
  const [type, setType] = useState("lost");
  const [form, setForm] = useState({ title: "", category: "Phone", date_occurred: "", location_zone: "Library", location: "", description: "", image: null, emergency: false, secret_answer: "" });
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [itemPosted, setItemPosted] = useState(false);
  const [postedItemPath, setPostedItemPath] = useState("");
  usePushNotifications({ userId: currentUser?.id, triggerAfterAction: itemPosted });
  useEffect(() => {
    if (!postedItemPath) return undefined;
    const timeout = setTimeout(() => navigate(postedItemPath), 250);
    return () => clearTimeout(timeout);
  }, [navigate, postedItemPath]);
  async function pickImage(file) {
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 5242880) {
      setError("Choose a JPEG, PNG, or WebP image under 5MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setError("");
      setForm({ ...form, image: compressed });
      setPreview(URL.createObjectURL(compressed));
    } catch {
      setError("Could not prepare that image. Try another JPEG, PNG, or WebP file.");
    }
  }
  async function submit() {
    if (!form.title.trim()) {
      setError("Add an item title before submitting.");
      setStep(1);
      return;
    }
    if (type === "found" && !form.image) {
      setError("Found item reports need a photo so claims can be verified.");
      setStep(2);
      return;
    }
    if (type === "found" && form.secret_answer.trim().length < 3) {
      setError("Found item reports need one owner-only verification clue.");
      setStep(2);
      return;
    }
    const fd = new FormData();
    Object.entries({ ...form, type }).forEach(([k, v]) => v && fd.append(k, v));
    try {
      const res = await createItem(fd);
      setItemPosted(true);
      setPostedItemPath(`/app/items/${res.data.item.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Item report failed.");
    }
  }
  return (
    <section ref={motionRef} className="mx-auto max-w-5xl">
      <div className="student-hero motion-reveal relative mb-6 overflow-hidden rounded-xl p-6 text-navy" data-parallax-scene>
        <span className="pointer-events-none absolute right-7 top-6 hidden rounded-xl bg-white px-4 py-2 text-xs font-black text-orange-deep shadow-soft md:block" data-float data-parallax="0.18">AI proof assistant</span>
        <p className="text-sm font-black uppercase text-orange">Guided recovery wizard</p>
        <h1 className="mt-2 text-3xl font-black">Report Item</h1>
        <p className="mt-2 max-w-2xl text-muted">Provide the right clues once. Campus Found turns them into matches, verification prompts, and recovery steps.</p>
      </div>
      <div className="motion-reveal mb-5 grid gap-3 rounded-xl bg-white p-2 shadow-soft md:grid-cols-2" data-tilt>
        <button className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${type === "lost" ? "bg-orange text-white shadow-sm" : "text-navy hover:bg-surface"}`} onClick={() => setType("lost")}><span className="material-symbols-outlined text-[18px]">search</span>Lost Item</button>
        <button className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition ${type === "found" ? "bg-navy text-white shadow-sm" : "text-navy hover:bg-surface"}`} onClick={() => setType("found")}><span className="material-symbols-outlined text-[18px]">campaign</span>Found Item</button>
      </div>
      <div className="premium-card motion-reveal rounded-xl p-5 md:p-6" data-tilt>
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 text-xs font-black uppercase text-muted">
            {["Basics", "Details", "Review"].map((label, index) => <span key={label} className={step === index + 1 ? "text-orange-deep" : ""}>{label}</span>)}
          </div>
          <div className="mt-3 h-2 rounded-full bg-surface"><div className="h-2 rounded-full bg-orange transition-all" style={{ width: `${step * 33.33}%` }} /></div>
        </div>
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        {step === 1 && <div className="grid gap-4 md:grid-cols-2">
          <input className="input-polish" placeholder="Item title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="input-polish" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{itemCategories.map((c) => <option key={c}>{c}</option>)}</select>
          <input className="input-polish" type="date" value={form.date_occurred} onChange={(e) => setForm({ ...form, date_occurred: e.target.value })} />
          <select className="input-polish" value={form.location_zone} onChange={(e) => setForm({ ...form, location_zone: e.target.value })}>{campusZones.map((zone) => <option key={zone}>{zone}</option>)}</select>
          <input className="input-polish md:col-span-2" placeholder="Exact spot, e.g. Library second floor table near window" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <label className="flex items-center gap-3 rounded-lg border border-orange/30 bg-orange/5 p-3 text-sm font-black text-orange-deep md:col-span-2"><input type="checkbox" checked={form.emergency} onChange={(e) => setForm({ ...form, emergency: e.target.checked })} /> Emergency item mode: wallet, phone, ID card, or high-value item</label>
        </div>}
        {step === 2 && <div className="grid gap-4">
          <textarea className="input-polish" rows="5" maxLength="200" placeholder="Describe color, brand, identifying marks, or any helpful detail." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex items-center justify-between text-sm text-muted"><span>{form.description.length}/200</span><button type="button" className="rounded-full bg-orange/10 px-3 py-1 font-black text-orange-deep" onClick={() => setForm({ ...form, description: generateAiDescription(form.title, form.category) })}>AI generate description</button></div>
          <input className="input-polish" placeholder={type === "found" ? "Required owner-only clue, e.g. sticker, initials, hidden mark" : "Optional owner-only clue, e.g. sticker, initials, hidden mark"} value={form.secret_answer} onChange={(e) => setForm({ ...form, secret_answer: e.target.value })} />
          <label className="grid min-h-40 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-outline bg-surface/60 p-6 text-center transition hover:border-navy hover:bg-surface">
            <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pickImage(e.target.files[0])} />
            <span className="material-symbols-outlined mb-2 text-4xl text-navy">cloud_upload</span>
            <span className="font-black text-navy">Upload item photo</span>
            <span className="mt-1 text-sm text-muted">JPEG, PNG, or WebP under 5MB</span>
          </label>
          {preview && <img className="h-44 w-44 rounded-lg object-cover shadow-soft" src={preview} alt="Preview" />}
        </div>}
        {step === 3 && <div className="rounded-xl bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy"><span className="material-symbols-outlined">{type === "lost" ? "search" : "campaign"}</span></div>
            <div>
              <div className="font-black text-text">{form.title || "Untitled item"}</div>
              <p className="text-sm text-muted">{form.category} at {form.location_zone}{form.location ? ` - ${form.location}` : ""}</p>
            </div>
          </div>
          <p className="mt-4 text-muted">{form.description || "No description added."}</p>
          <div className="mt-4 grid gap-2 text-sm"><span className="rounded-lg bg-white p-3 font-black text-navy">AI Category: {form.category}</span><span className="rounded-lg bg-white p-3 font-black text-orange-deep">Priority: {form.emergency ? "Emergency broadcast enabled" : "Normal queue"}</span><span className="rounded-lg bg-white p-3 font-black text-muted">Secret proof captured: {form.secret_answer ? "Yes" : "No"}</span></div>
        </div>}
        <div className="mt-6 flex justify-end gap-2">
          {step > 1 && <button className="rounded-lg border border-outline bg-white px-5 py-3 text-sm font-black text-muted" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 3 ? <button className="rounded-lg bg-navy px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={step === 1 && !form.title.trim()} onClick={() => setStep(step + 1)}>Next</button> : <button className="rounded-lg bg-orange px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={type === "found" && !form.secret_answer.trim()} onClick={submit}>Submit report</button>}
        </div>
      </div>
    </section>
  );
}
