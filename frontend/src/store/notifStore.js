import { create } from "zustand";

export const useNotifStore = create((set) => ({
  notifications: [],
  unread: 0,
  setNotifications: (notifications) => set({ notifications, unread: notifications.filter((n) => !n.read).length }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unread: state.unread + (notification.read ? 0 : 1)
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unread: 0
  }))
}));

