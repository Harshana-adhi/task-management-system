import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Auth session state.
 *
 * `user` is always the canonical /api/auth/profile shape:
 * { user_id, full_name, email, role_id, role_name, is_active, must_change_password, created_at, updated_at }
 *
 * Login only returns a minimal camelCase user object, so the login flow
 * (see Login.jsx) fetches the full profile right after authenticating
 * and stores that here instead — keeps one consistent shape everywhere
 * else in the app (Navbar, Sidebar role checks, Profile page, etc).
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setSession: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (partialUser) =>
        set((state) => ({ user: { ...state.user, ...partialUser } })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
