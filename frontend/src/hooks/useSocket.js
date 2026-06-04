import { useEffect } from "react";
import { io } from "socket.io-client";
import { getStoredDemoAuth } from "../lib/demoData";
import { useAuthStore } from "../store/authStore";
import { useNotifStore } from "../store/notifStore";

export function useSocket(onMessage) {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotifStore((s) => s.addNotification);
  useEffect(() => {
    if (!user?.id) return undefined;
    if (getStoredDemoAuth()) return undefined;
    const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin);
    socket.emit("join", { user_id: user.id });
    socket.on("new_message", onMessage);
    socket.on("notification", addNotification);
    return () => socket.disconnect();
  }, [user?.id, onMessage, addNotification]);
}
