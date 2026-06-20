import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'

/**
 * Labeled text input with built-in error state. Always pass a `label` —
 * inputs without one are an accessibility gap.
 */
const Input = forwardRef(
  ({ label, error, hint, icon: Icon, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900',
              'placeholder:text-slate-400',
              'focus-visible:border-brand-500',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
              Icon && 'pl-9',
              error && 'border-rose-400 focus-visible:ring-rose-500',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        ) : null}
      </div>
    )
  }
)
Input.displayName = 'Input'

export default Input
