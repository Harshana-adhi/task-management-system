import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'

// Mirrors backend src/validators/taskValidator.js createTaskSchema /
// updateTaskSchema: title required (max 200), priority required,
// dueDate optional but cannot be in the past (create only — the backend
// only enforces this on create, not on edit, so we match that exactly).
function buildSchema(isEditMode) {
  return z.object({
    title: z.string().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High'], { errorMap: () => ({ message: 'Please select a priority' }) }),
    dueDate: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || isEditMode) return true // backend only blocks past dates on create
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return new Date(val) >= today
      }, 'Due date cannot be in the past'),
  })
}

/**
 * Shared modal for creating and editing a task. `projectId` is fixed —
 * tasks can't be moved between projects, so it's not an editable field.
 */
export default function TaskFormModal({ open, onClose, onSubmit, task, isSubmitting }) {
  const isEditMode = !!task

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSchema(isEditMode)),
    defaultValues: { title: '', description: '', priority: 'Medium', dueDate: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description ?? '',
              priority: task.priority,
              dueDate: task.due_date ? task.due_date.slice(0, 10) : '',
            }
          : { title: '', description: '', priority: 'Medium', dueDate: '' }
      )
    }
  }, [open, task, reset])

  const submit = async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      const message = err?.response?.data?.message
      if (message?.toLowerCase().includes('title already exists')) {
        setError('title', { message })
      }
    }
  }

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit task' : 'Create task'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="e.g. Design the landing page"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Description <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="What needs to be done?"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={priorityOptions}
            error={errors.priority?.message}
            {...register('priority')}
          />
          <Input
            label="Due date"
            type="date"
            hint={isEditMode ? undefined : "Today or later"}
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>
      </form>
    </Modal>
  )
}
