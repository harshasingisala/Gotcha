import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { resetDemoWorkspace } from "../../lib/demoData";

export default function Login() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, demoLogin } = useAuth();
  const [email, setEmail] = useState("riya.sharma@campuslost.demo");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("Demo@123");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  function loginDemo(role) {
    setError("");
    try {
      const user = demoLogin(role, role === "admin" ? "Admin@123" : "Demo@123");
      navigate(user.role === "admin" ? "/admin/dashboard" : "/app/dashboard");
    } catch (err) {
      setError(err.message || "Demo login failed.");
    }
  }
  function loginPassword(e) {
    e.preventDefault();
    setError("");
    try {
      const user = demoLogin(email, password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/app/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      if (!sent) {
        await sendOtp(email);
        setSent(true);
      } else {
        const user = await verifyOtp(email, otp);
        navigate(user.role === "admin" ? "/admin/dashboard" : user.full_name ? "/app/dashboard" : "/setup");
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  }
  function resetDemo() {
    resetDemoWorkspace();
    setError("Demo workspace reset. Use a demo login to start fresh.");
  }
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Campus Found</h1>
      <p className="mt-2 text-lg text-muted">Use test credentials or Supabase OTP.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
      <form onSubmit={loginPassword} className="mt-5 space-y-3">
        <input className="w-full rounded-lg border border-outline p-3 text-base" type="email" placeholder="riya.sharma@campuslost.demo" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded-lg border border-outline p-3 text-base" type="password" placeholder="Demo@123" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full rounded-lg bg-navy px-4 py-3 font-bold text-white">Sign in</button>
      </form>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button className="rounded-lg bg-surface px-4 py-3 text-sm font-bold text-navy" onClick={() => loginDemo("student")}>Use Student Demo</button>
        <button className="rounded-lg bg-orange px-4 py-3 text-sm font-bold text-white" onClick={() => loginDemo("admin")}>Use Admin Demo</button>
      </div>
      <div className="mt-5 rounded-lg bg-surface p-3 text-sm text-muted">
        Student: <b>riya.sharma@campuslost.demo</b> / <b>Demo@123</b><br />
        Admin: <b>admin@campuslost.demo</b> / <b>Admin@123</b>
        <button type="button" className="mt-3 block rounded-md border border-outline bg-white px-3 py-2 text-xs font-black text-navy" onClick={resetDemo}>Reset demo workspace</button>
      </div>
      <form onSubmit={submit} className="mt-5 border-t border-outline pt-5">
        <p className="text-sm font-bold text-navy">Supabase OTP login</p>
        <input className="mt-3 w-full rounded-lg border border-outline p-3" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {sent && <input className="mt-3 w-full rounded-lg border border-outline p-3" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />}
        <button className="mt-3 w-full rounded-lg border border-navy px-4 py-3 font-bold text-navy">{sent ? "Verify OTP" : "Send OTP"}</button>
      </form>
    </div>
  );
}
