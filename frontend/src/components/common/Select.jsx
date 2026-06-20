import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

/**
 * Labeled select dropdown, same label/error contract as Input.
 * Pass `options` as [{ value, label }, ...]. Include a placeholder
 * option yourself if you want one (e.g. { value: '', label: 'All roles' }).
 */
const Select = forwardRef(
  ({ label, error, options = [], className, id, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id || generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-900',
              'focus-visible:border-brand-500',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
              error && 'border-rose-400 focus-visible:ring-rose-500',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export default Select
