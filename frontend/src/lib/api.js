import axios from "axios";
import { supabase } from "./supabase";
import { getStoredDemoAuth } from "./demoData";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

api.interceptors.request.use(async (config) => {
  const demoAuth = getStoredDemoAuth();
  if (demoAuth) {
    config.headers["X-Demo-Mode"] = "true";
    return config;
  }
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (getStoredDemoAuth()) return Promise.reject(error);
      await supabase.auth.signOut();
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
    }
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent("toast", { detail: "You don't have permission for this action." }));
    }
    return Promise.reject(error);
  }
);
