import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Table from '../../components/common/Table'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'

// Sample rows just to prove the Table/Badge components render correctly.
// Replace with real data in Phase 5.
const SAMPLE_TASKS = [
  { id: 1, title: 'Design login screen', status: 'In Progress', priority: 'High' },
  { id: 2, title: 'Set up CI pipeline', status: 'To Do', priority: 'Medium' },
  { id: 3, title: 'Write API docs', status: 'Completed', priority: 'Low' },
]

const columns = [
  { key: 'title', header: 'Task' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'priority', header: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
]

/**
 * Phase 1 placeholder. Doubles as a quick visual check that the design
 * system — buttons, inputs, modal, table, badges, both themes — works
 * end to end before the real dashboard is built in a later phase.
 */
export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Design system preview — replaced by the real dashboard later.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          New task
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Open tasks', value: 12 },
          { label: 'Due this week', value: 4 },
          { label: 'Completed', value: 28 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <Table columns={columns} data={SAMPLE_TASKS} rowKey="id" />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setModalOpen(false)
                toast.success('Task created')
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Task title" placeholder="e.g. Design login screen" />
          <Input label="Due date" type="date" />
        </div>
      </Modal>
    </div>
  )
}
