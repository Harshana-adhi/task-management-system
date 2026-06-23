import { DndContext, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import { cn } from '../../lib/cn'

const COLUMNS = [
  { status: 'To Do', accent: 'bg-status-todo' },
  { status: 'In Progress', accent: 'bg-status-progress' },
  { status: 'Completed', accent: 'bg-status-done' },
]

function KanbanColumn({ status, accent, tasks, onOpenTask, canDrag }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[24rem] flex-1 flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors dark:border-slate-800 dark:bg-slate-900/40',
        isOver && 'border-brand-400 bg-brand-50/50 dark:border-brand-600 dark:bg-brand-500/5'
      )}
    >
      <div className="flex items-center gap-2 px-1">
        <span className={cn('size-2 rounded-full', accent)} />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{status}</h3>
        <span className="text-xs text-slate-400">{tasks.length}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {tasks.map((task) => (
          <TaskCard key={task.task_id} task={task} onOpen={onOpenTask} draggable={canDrag(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400 dark:border-slate-700">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * canDrag(task) controls per-card drag permission — Collaborators can
 * only drag tasks they're assigned to; PM/Admin can drag any of them.
 */
export default function KanbanBoard({ tasks, onOpenTask, onStatusChange, canDrag }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    const taskId = active.id
    const newStatus = over.id
    const task = tasks.find((t) => t.task_id === taskId)
    if (!task || task.status === newStatus) return

    onStatusChange(task, newStatus)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 sm:flex-row">
        {COLUMNS.map(({ status, accent }) => (
          <KanbanColumn
            key={status}
            status={status}
            accent={accent}
            tasks={tasks.filter((t) => t.status === status)}
            onOpenTask={onOpenTask}
            canDrag={canDrag}
          />
        ))}
      </div>
    </DndContext>
  )
}
