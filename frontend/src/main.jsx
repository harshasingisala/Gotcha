import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { api } from "./lib/api";
import { getStoredDemoAuth } from "./lib/demoData";
import { supabase } from "./lib/supabase";
import { useAuthStore } from "./store/authStore";

async function hydrate() {
  const store = useAuthStore.getState();
  store.setLoading(true);
  try {
    const demoAuth = getStoredDemoAuth();
    if (demoAuth?.user && demoAuth?.session) {
      store.setAuth(demoAuth);
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      store.clearAuth();
      return;
    }
    store.setSession(data.session);
    const me = await api.get("/auth/me");
    store.setAuth({ session: data.session, user: me.data.user });
  } catch {
    store.clearAuth();
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const skeleton = document.getElementById("app-skeleton");
if (skeleton) skeleton.remove();

hydrate();
