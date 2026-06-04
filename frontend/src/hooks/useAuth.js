import { api } from "../lib/api";
import { demoUsers, getStoredDemoAuth, saveDemoAuth } from "../lib/demoData";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

const allowedDomains = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || "")
  .split(",")
  .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
  .filter(Boolean);

function assertAllowedEmail(email) {
  if (!allowedDomains.length) return;
  const domain = (email || "").split("@").pop()?.toLowerCase();
  if (!allowedDomains.includes(domain)) {
    throw new Error("Use your official college email to continue.");
  }
}

export function useAuth() {
  const store = useAuthStore();
  async function sendOtp(email) {
    assertAllowedEmail(email);
    return supabase.auth.signInWithOtp({ email });
  }
  async function verifyOtp(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) throw error;
    const me = await api.get("/auth/me");
    store.setAuth({ session: data.session, user: me.data.user });
    return me.data.user;
  }
  function demoLogin(roleOrEmail, password) {
    const user = Object.values(demoUsers).find((candidate) => candidate.email === roleOrEmail || candidate.role === roleOrEmail);
    if (!user || user.password !== password) throw new Error("Invalid test credentials.");
    const auth = saveDemoAuth(user);
    store.setAuth(auth);
    return user;
  }
  async function updateProfile(payload) {
    if (getStoredDemoAuth()) {
      const current = getStoredDemoAuth();
      const user = { ...current.user, ...payload };
      saveDemoAuth(user);
      store.setUser(user);
      return user;
    }
    const res = await api.patch("/auth/profile", payload);
    store.setUser(res.data.user);
    return res.data.user;
  }
  return { ...store, sendOtp, verifyOtp, demoLogin, updateProfile };
}
