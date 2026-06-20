import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <p className="font-display text-5xl font-bold text-slate-300 dark:text-slate-700">404</p>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" className="mt-3">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  )
}
