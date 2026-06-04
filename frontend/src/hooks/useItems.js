import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { addDemoNotification, getDemoItems, getStoredDemoAuth, upsertDemoItem } from "../lib/demoData";

export function useItems(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async (nextPage = 1, append = false) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/items", { params: { ...filters, page: nextPage } });
      const rows = Array.isArray(res.data?.data) ? res.data.data : null;
      if (!rows) throw new Error("Invalid items response.");
      setItems((current) => append ? [...current, ...rows] : rows);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
    } catch (err) {
      if (getStoredDemoAuth()) {
        const filtered = getDemoItems().filter((item) => {
          if (filters.type && item.type !== filters.type) return false;
          if (filters.status && item.status !== filters.status) return false;
          if (filters.lifecycle_state && item.lifecycle_state !== filters.lifecycle_state) return false;
          if (filters.category && item.category !== filters.category) return false;
          if (filters.location_zone && item.location_zone !== filters.location_zone) return false;
          if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
          if (filters.q && !`${item.title} ${item.description}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
          if (filters.date_from && new Date(item.created_at) < new Date(filters.date_from)) return false;
          if (filters.date_to && new Date(item.created_at) > new Date(filters.date_to)) return false;
          return true;
        });
        setItems(filtered);
        setPage(1);
        setPages(1);
      } else {
        setError(err.response?.data?.error || "Could not load items.");
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchItems(1, false); }, [fetchItems]);

  return { items, setItems, page, pages, loading, error, setFilters, fetchItems, loadMore: () => page < pages && fetchItems(page + 1, true) };
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!(file instanceof File)) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export async function createItem(form) {
  try {
    const res = await api.post("/items", form, { headers: { "Content-Type": "multipart/form-data" } });
    if (!res.data?.item) throw new Error("Invalid item response.");
    return res;
  } catch (err) {
    if (!getStoredDemoAuth()) throw err;
    const user = getStoredDemoAuth().user;
    const image = await fileToDataUrl(form.get("image"));
    const item = {
      id: `demo-item-${Date.now()}`,
      title: form.get("title") || "New reported item",
      type: form.get("type") || "lost",
      status: "active",
      category: form.get("category") || "Other",
      location: form.get("location") || "Campus",
      location_zone: form.get("location_zone") || "Other",
      description: form.get("description") || "No description added.",
      lifecycle_state: "reported",
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      secret_answer: form.get("secret_answer") || "",
      emergency: form.get("emergency") === "true" || form.get("emergency") === "on",
      date_occurred: form.get("date_occurred") || "",
      created_at: new Date().toISOString(),
      image_url: image,
      user_id: user.id,
      users: { full_name: user.full_name }
    };
    upsertDemoItem(item);
    addDemoNotification({
      title: item.type === "lost" ? "Lost report created" : "Found report created",
      body: `${item.title} is now visible in the ${item.type === "lost" ? "lost" : "found"} item queue${item.emergency ? " with emergency priority." : "."}`
    });
    return { data: { item } };
  }
}
