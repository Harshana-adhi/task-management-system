import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  X,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Project Manager', 'Collaborator'] },
  { to: '/projects', label: 'Projects', icon: FolderKanban, roles: ['Admin', 'Project Manager', 'Collaborator'] },
  { to: '/tasks', label: 'Tasks', icon: ListChecks, roles: ['Admin', 'Project Manager', 'Collaborator'] },
  { to: '/admin/users', label: 'Users', icon: Users, roles: ['Admin'] },
]

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'border-l-2 border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
            : 'border-l-2 border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
        )
      }
    >
      <Icon className="size-4.5 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

function SidebarContent({ onNavigate }) {
  const roleName = useAuthStore((s) => s.user?.role_name)
  const visibleItems = NAV_ITEMS.filter((item) => !roleName || item.roles.includes(roleName))

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 font-display text-sm font-bold text-white">
          T
        </div>
        <span className="font-display text-base font-semibold text-slate-900 dark:text-white">
          TaskFlow
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {visibleItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNavigate} />
        ))}
      </nav>
    </div>
  )
}

/** Fixed desktop sidebar + slide-over drawer on mobile, sharing the same content. */
export default function Sidebar() {
  const mobileDrawerOpen = useUIStore((s) => s.mobileDrawerOpen)
  const closeMobileDrawer = useUIStore((s) => s.closeMobileDrawer)

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50"
            onClick={closeMobileDrawer}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl dark:bg-slate-900">
            <button
              onClick={closeMobileDrawer}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={closeMobileDrawer} />
          </div>
        </div>
      )}
    </>
  )
}
