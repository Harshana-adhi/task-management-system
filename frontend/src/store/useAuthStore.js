import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Auth session state. Scaffolded here in Phase 1 so the axios instance,
 * ProtectedRoute, and layout can all depend on it from day one.
 * Full login/change-password/profile flows are implemented in Phase 2.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { user_id, full_name, email, role_id, role_name, must_change_password }
      token: null,
      isAuthenticated: false,

      // True once the persisted session has been read from localStorage.
      // ProtectedRoute must wait for this before deciding to redirect —
      // otherwise it sees the default `isAuthenticated: false` on first
      // render and redirects to /login even when a valid session exists.
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      setSession: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (partialUser) =>
        set((state) => ({ user: { ...state.user, ...partialUser } })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
