import { useEffect } from "react";
import { getMessagingInstance, getToken, VAPID_KEY } from "../lib/firebase";
import { supabase } from "../lib/supabase";

const deniedKey = "push-permission-denied";
const attemptedKey = "push-registration-attempted";

export function usePushNotifications({ userId, triggerAfterAction }) {
  useEffect(() => {
    if (!triggerAfterAction || !userId) return;
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;
    if (Notification.permission === "denied") return;
    if (localStorage.getItem(deniedKey) === "true") return;
    if (sessionStorage.getItem(attemptedKey) === "true") return;

    const register = async () => {
      try {
        sessionStorage.setItem(attemptedKey, "true");
        const permission = await Notification.requestPermission();

        if (permission === "denied") {
          localStorage.setItem(deniedKey, "true");
          return;
        }

        if (permission !== "granted") return;

        const messaging = await getMessagingInstance();
        if (!messaging || !VAPID_KEY) return;

        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        if (!token) return;

        const { error } = await supabase
          .from("push_subscriptions")
          .upsert(
            { user_id: userId, fcm_token: token, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );

        if (error) throw error;
      } catch (err) {
        console.warn("[Push] Registration failed:", err.message);
      }
    };

    register();
  }, [triggerAfterAction, userId]);
}
