import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { demoStats, getDemoAdminUsers, getStoredDemoAuth, saveDemoAdminUsers } from "../lib/demoData";

export function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get("/admin/stats").then((res) => {
      if (typeof res.data !== "object" || Array.isArray(res.data)) throw new Error("Invalid stats response.");
      setStats(res.data);
    }).catch((err) => {
      if (getStoredDemoAuth()) setStats(demoStats);
      else setError(err.response?.data?.error || "Could not load stats.");
    }).finally(() => setLoading(false));
  }, []);
  return { stats, loading, error };
}

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load(q = "") {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", { params: { q } });
      if (!Array.isArray(res.data?.users)) throw new Error("Invalid users response.");
      setUsers(res.data.users);
      setError("");
    } catch (err) {
      if (getStoredDemoAuth()) {
        const needle = q.toLowerCase();
        setUsers(getDemoAdminUsers().filter((user) => !needle || user.full_name?.toLowerCase().includes(needle) || user.email?.toLowerCase().includes(needle)));
        setError("");
      } else {
        setError(err.response?.data?.error || "Could not load users.");
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);
  async function setRole(id, role) {
    try {
      const res = await api.patch(`/admin/users/${id}/role`, { role });
      if (!res.data?.user) throw new Error("Invalid role response.");
      setUsers((rows) => rows.map((u) => u.id === id ? { ...u, role } : u));
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      const next = getDemoAdminUsers().map((u) => u.id === id ? { ...u, role } : u);
      saveDemoAdminUsers(next);
      setUsers((rows) => rows.map((u) => u.id === id ? { ...u, role } : u));
      return;
    }
  }
  return { users, loading, error, load, setRole };
}
