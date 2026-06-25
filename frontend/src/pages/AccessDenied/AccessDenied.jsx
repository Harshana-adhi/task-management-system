import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import Button from '../../components/common/Button'

export default function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
        <ShieldAlert className="size-7" />
      </div>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Access denied</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        You don't have permission to view this page. If you think this is a mistake, contact your administrator.
      </p>
      <Link to="/" className="mt-3">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  )
}
