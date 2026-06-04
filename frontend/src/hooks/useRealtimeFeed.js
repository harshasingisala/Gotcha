import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export function useRealtimeFeed({ filters, currentUserId, onNewItem }) {
  const [newCount, setNewCount] = useState(0);
  const [realtimeStatus, setRealtimeStatus] = useState("CLOSED");
  const channelRef = useRef(null);

  useEffect(() => {
    if (!supabase.channel || !supabase.removeChannel) {
      setRealtimeStatus("CHANNEL_ERROR");
      return undefined;
    }

    const channelName = `feed-realtime-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "items" },
        (payload) => {
          const newItem = payload.new;

          if (newItem.user_id === currentUserId) return;
          if (filters.type && newItem.type !== filters.type) return;
          if (filters.category && newItem.category !== filters.category) return;
          if (filters.zone && newItem.location_zone !== filters.zone && newItem.zone !== filters.zone) return;
          if (filters.status && newItem.status !== filters.status) return;
          if (filters.lifecycle_state && newItem.lifecycle_state !== filters.lifecycle_state) return;
          if (filters.location && !String(newItem.location || "").toLowerCase().includes(filters.location.toLowerCase())) return;
          if (filters.q && !`${newItem.title || ""} ${newItem.description || ""}`.toLowerCase().includes(filters.q.toLowerCase())) return;
          if (filters.date_from && new Date(newItem.created_at) < new Date(filters.date_from)) return;
          if (filters.date_to && new Date(newItem.created_at) > new Date(filters.date_to)) return;

          setNewCount((previous) => previous + 1);
          onNewItem?.(newItem);
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
        if (status === "CHANNEL_ERROR") {
          console.warn("[Realtime] Channel error - check items table replication setting");
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    filters.type,
    filters.category,
    filters.zone,
    filters.status,
    filters.lifecycle_state,
    filters.location,
    filters.q,
    filters.date_from,
    filters.date_to,
    currentUserId,
    onNewItem,
  ]);

  const clearCount = () => setNewCount(0);

  return { newCount, clearCount, realtimeStatus };
}
