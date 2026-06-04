import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getDemoNotifications, getStoredDemoAuth, saveDemoNotifications } from "../lib/demoData";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    try {
      const res = await api.get("/notifications");
      if (!Array.isArray(res.data?.notifications)) throw new Error("Invalid notifications response.");
      setNotifications(res.data.notifications);
      setError("");
    } catch (err) {
      if (getStoredDemoAuth()) {
        setNotifications(getDemoNotifications());
        setError("");
      } else {
        setError(err.response?.data?.error || "Could not load notifications.");
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);
  async function readAll() {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((rows) => rows.map((n) => ({ ...n, read: true })));
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      const next = getDemoNotifications().map((n) => ({ ...n, read: true }));
      saveDemoNotifications(next);
      setNotifications(next);
      return;
    }
  }
  return { notifications, loading, error, readAll };
}
