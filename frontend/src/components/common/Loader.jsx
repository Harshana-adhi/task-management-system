import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Inline spinner — use for buttons/small areas, not full-page loads. */
export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand-600', className)} />
}

/** Full-page/section loading state. */
export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
      <Spinner className="size-7" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

/**
 * Skeleton block for content placeholders. Prefer this over a spinner
 * for tables/cards/lists — it avoids layout jump when real data arrives.
 */
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-800',
        className
      )}
    />
  )
}

/** Skeleton rows shaped like a data table, for table-based pages. */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
