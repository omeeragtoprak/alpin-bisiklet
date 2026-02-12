import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminSidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (val: boolean) => void;
  toggleMobile: () => void;
  setMobileOpen: (val: boolean) => void;
}

export const useAdminSidebarStore = create<AdminSidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggleCollapsed: () =>
        set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (val) => set({ isCollapsed: val }),
      toggleMobile: () =>
        set((s) => ({ isMobileOpen: !s.isMobileOpen })),
      setMobileOpen: (val) => set({ isMobileOpen: val }),
    }),
    {
      name: "admin-sidebar",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    },
  ),
);
