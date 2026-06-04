import React from "react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getDemoNotifications, getStoredDemoAuth, saveDemoNotifications } from "../lib/demoData";
import { useNotifStore } from "../store/notifStore";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [pushAvailable, setPushAvailable] = useState(false);
  const [pushStatus, setPushStatus] = useState("");
  const { notifications, unread, setNotifications, markAllRead } = useNotifStore();
  useEffect(() => {
    api.get("/notifications").then((res) => {
      if (!Array.isArray(res.data?.notifications)) throw new Error("Invalid notifications response.");
      setNotifications(res.data.notifications);
    }).catch(() => {
      if (getStoredDemoAuth()) setNotifications(getDemoNotifications());
    });
  }, [setNotifications]);
  useEffect(() => {
    setPushAvailable("serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !getStoredDemoAuth());
  }, []);

  function urlBase64ToUint8Array(value) {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
  }

  async function enablePush() {
    setPushStatus("");
    try {
      const key = await api.get("/notifications/push-key");
      if (!key.data?.public_key) {
        setPushStatus("Push is not configured on the server yet.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatus("Push permission was not granted.");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key.data.public_key)
      });
      await api.post("/notifications/push-subscription", subscription.toJSON());
      setPushStatus("Push alerts enabled.");
    } catch {
      setPushStatus("Could not enable push alerts.");
    }
  }

  async function readAll() {
    try {
      await api.patch("/notifications/read-all");
      markAllRead();
    } catch (err) {
      if (!getStoredDemoAuth()) throw err;
      saveDemoNotifications(getDemoNotifications().map((n) => ({ ...n, read: true })));
      markAllRead();
      return;
    }
  }
  return (
    <div className="relative">
      <button className="relative grid h-10 w-10 place-items-center rounded-full bg-surface text-navy transition hover:bg-surface-high" onClick={() => setOpen(!open)}><span className="material-symbols-outlined">notifications</span>{unread ? <span className="absolute -right-1 -top-1 rounded-full bg-orange px-2 text-xs font-bold text-white">{unread}</span> : null}</button>
      {open && <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-surface-strong bg-white p-3 shadow-lg">
        <div className="mb-2 flex items-center justify-between gap-2">
          <button className="text-sm font-bold text-orange" onClick={readAll}>Mark all read</button>
          {pushAvailable && <button className="rounded-md bg-surface px-2 py-1 text-xs font-black text-navy" onClick={enablePush}>Enable push</button>}
        </div>
        {pushStatus && <p className="mb-2 rounded-lg bg-page p-2 text-xs font-bold text-muted">{pushStatus}</p>}
        <div className="max-h-80 space-y-2 overflow-auto">{notifications.slice(0, 6).map((n) => <div key={n.id} className="rounded-lg bg-page p-3 text-sm"><div className="font-medium">{n.title}</div><div className="text-muted">{n.body}</div></div>)}</div>
      </div>}
    </div>
  );
}
