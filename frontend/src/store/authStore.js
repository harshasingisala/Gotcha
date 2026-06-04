import { create } from "zustand";
import { clearDemoAuth } from "../lib/demoData";

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  setAuth: ({ user, session }) => set({ user, session, loading: false }),
  setUser: (user) => set({ user, loading: false }),
  setSession: (session) => set({ session }),
  clearAuth: () => {
    clearDemoAuth();
    set({ user: null, session: null, loading: false });
  },
  setLoading: (loading) => set({ loading })
}));
