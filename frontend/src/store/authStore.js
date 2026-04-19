import { create } from "zustand";
import useSessionStore from "./sessionStore";

const STORAGE_KEY = "neurograph.auth";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hasHydrated: false,
  login: (user, token) => {
    const payload = { user, token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    set({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      hasHydrated: true
    });
  },
  logout: (redirectTo = "/login") => {
    localStorage.removeItem(STORAGE_KEY);
    useSessionStore.getState().clearSession();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: true
    });

    if (redirectTo && typeof window !== "undefined" && window.location.pathname !== redirectTo) {
      window.location.replace(redirectTo);
    }
  },
  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        set({ hasHydrated: true });
        return;
      }

      const { user, token } = JSON.parse(raw);
      set({
        user: user ?? null,
        token: token ?? null,
        isAuthenticated: Boolean(user && token),
        hasHydrated: true
      });
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        hasHydrated: true
      });
    }
  }
}));

export default useAuthStore;

