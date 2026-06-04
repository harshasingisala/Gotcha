import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [form, setForm] = useState({ full_name: "", student_id: "", college: "" });
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      await updateProfile(form);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Profile setup failed.");
    }
  }
  return <form onSubmit={submit}><h1 className="text-2xl font-semibold">Set up profile</h1><p className="mt-2 text-muted">Your name is required before you can report or claim items.</p>{error && <p className="mt-4 text-red-600">{error}</p>}<input className="mt-5 w-full rounded-lg border p-3" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /><input className="mt-3 w-full rounded-lg border p-3" placeholder="Student ID" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} /><input className="mt-3 w-full rounded-lg border p-3" placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /><button className="mt-5 w-full rounded-lg bg-navy px-4 py-3 text-white">Continue</button></form>;
}
