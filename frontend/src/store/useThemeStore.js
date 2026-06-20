import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const applyThemeClass = (theme) => {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

/**
 * Controls light/dark theme. Persisted to localStorage so the choice
 * survives a refresh. index.html has a small inline script that reads
 * the same storage key before paint, to avoid a flash of the wrong theme.
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        applyThemeClass(next)
        set({ theme: next })
      },
      setTheme: (theme) => {
        applyThemeClass(theme)
        set({ theme })
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme)
      },
    }
  )
)
