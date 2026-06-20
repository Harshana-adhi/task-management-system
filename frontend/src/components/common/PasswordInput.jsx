import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Password field with a show/hide toggle. Same label/error contract as Input. */
const PasswordInput = forwardRef(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-slate-900',
              'placeholder:text-slate-400',
              'focus-visible:border-brand-500',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
              error && 'border-rose-400 focus-visible:ring-rose-500',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
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
PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
