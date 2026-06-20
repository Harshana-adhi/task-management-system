import { cn } from '../../lib/cn'
import { TableSkeleton } from './Loader'

/**
 * Generic data table. Pass `columns` (array of { key, header, render? })
 * and `data` (array of row objects). Used by Users, Projects, and Tasks
 * table views in later phases.
 */
export default function Table({ columns, data, isLoading, emptyMessage = 'Nothing here yet.', rowKey = 'id' }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <TableSkeleton columns={columns.length} />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.map((row) => (
            <tr
              key={row[rowKey]}
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 text-slate-700 dark:text-slate-300', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
