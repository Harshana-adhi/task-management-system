import { Menu, Moon, Sun, Bell, Search, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../store/useThemeStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { useNotificationStore } from '../../store/useNotificationStore'

function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Navbar() {
  const navigate = useNavigate()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const toggleMobileDrawer = useUIStore((s) => s.toggleMobileDrawer)
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 md:px-6">
      <button
        onClick={toggleMobileDrawer}
        aria-label="Open menu"
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden flex-1 max-w-sm sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search tasks, projects…"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-brand-500 focus-visible:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus-visible:bg-slate-900"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        <button
          aria-label="Notifications"
          className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-rose-500" />
          )}
        </button>

        <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {user ? initials(user.full_name) : '??'}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 lg:block">
            {user?.full_name ?? 'Guest'}
          </span>
          {import.meta.env.DEV && (
            <button
              onClick={handleLogout}
              aria-label="Log out (dev preview)"
              title="Log out (dev preview)"
              className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
