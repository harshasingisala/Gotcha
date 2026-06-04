import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { addDemoNotification, demoAuditTrail, demoHeatmap, demoReputation, demoRiskUsers, demoStats, getDemoAnnouncements, getDemoItems, getStoredDemoAuth, saveDemoAnnouncements } from "../lib/demoData";

export function useCampusInsights() {
  const [insights, setInsights] = useState({ heatmap: [], reputation: [], risk_users: [], audit_trail: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api.get("/admin/insights").then((res) => {
      if (!res.data || !Array.isArray(res.data.heatmap)) throw new Error("Invalid insights response.");
      if (alive) setInsights(res.data);
    }).catch((err) => {
      if (getStoredDemoAuth()) {
        setInsights({ heatmap: demoHeatmap, reputation: demoReputation, risk_users: demoRiskUsers, audit_trail: demoAuditTrail });
      } else {
        setError(err.response?.data?.error || "Could not load campus insights.");
      }
    }).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return { insights, loading, error };
}

export function useAdminAnalytics() {
  const [analytics, setAnalytics] = useState({ category_breakdown: [], location_breakdown: [], type_breakdown: [], monthly_trends: [], claim_status: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api.get("/admin/analytics").then((res) => {
      if (!res.data || !Array.isArray(res.data.category_breakdown)) throw new Error("Invalid analytics response.");
      if (alive) setAnalytics(res.data);
    }).catch((err) => {
      if (getStoredDemoAuth()) {
        const items = getDemoItems();
        const grouped = (key) => Object.values(items.reduce((acc, item) => ({ ...acc, [item[key] || "Unknown"]: { name: item[key] || "Unknown", count: (acc[item[key] || "Unknown"]?.count || 0) + 1 } }), {}));
        setAnalytics({
          category_breakdown: grouped("category"),
          location_breakdown: grouped("location"),
          type_breakdown: grouped("type").map((row) => ({ name: row.name, value: row.count })),
          monthly_trends: demoStats.monthly_trends,
          claim_status: []
        });
      } else {
        setError(err.response?.data?.error || "Could not load analytics.");
      }
    }).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return { analytics, loading, error };
}

export function useAnnouncements(admin = false) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(admin ? "/admin/announcements" : "/public/announcements");
      if (!Array.isArray(res.data?.announcements)) throw new Error("Invalid announcements response.");
      setAnnouncements(res.data.announcements);
      setError("");
    } catch (err) {
      if (getStoredDemoAuth()) setAnnouncements(getDemoAnnouncements());
      else setError(err.response?.data?.error || "Could not load announcements.");
    } finally {
      setLoading(false);
    }
  }

  async function create(payload) {
    try {
      const res = await api.post("/admin/announcements", payload);
      if (!res.data?.announcement) throw new Error("Invalid announcement response.");
      setAnnouncements((rows) => [res.data.announcement, ...rows]);
      return res.data.announcement;
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      const announcement = {
        id: `ann-${Date.now()}`,
        title: payload.title,
        body: payload.body,
        audience: payload.audience || "all",
        status: payload.status || "sent",
        when: payload.status === "scheduled" ? "Scheduled" : "Just now",
        created_at: new Date().toISOString()
      };
      const next = [announcement, ...getDemoAnnouncements()];
      saveDemoAnnouncements(next);
      if (announcement.status === "sent") addDemoNotification({ title: announcement.title, body: announcement.body, type: "announcement" });
      setAnnouncements(next);
      return announcement;
    }
  }

  useEffect(() => { load(); }, [admin]);
  return { announcements, loading, error, load, create };
}
