import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [email, setEmail] = useState("admin@campuslost.demo");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const user = demoLogin(email, password);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/app/dashboard");
    } catch (err) {
      setError(err.message || "Admin login failed.");
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-surface text-navy">
          <span className="material-symbols-outlined filled">admin_panel_settings</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">Admin Console</h1>
          <p className="text-sm text-muted">Default test password enabled.</p>
        </div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
      <input className="w-full rounded-lg border border-outline p-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="mt-3 w-full rounded-lg border border-outline p-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="mt-5 w-full rounded-lg bg-navy px-4 py-3 font-bold text-white">Open Admin</button>
      <p className="mt-4 rounded-lg bg-surface p-3 text-sm text-muted">Admin: <b>admin@campuslost.demo</b> / <b>Admin@123</b></p>
    </form>
  );
}
