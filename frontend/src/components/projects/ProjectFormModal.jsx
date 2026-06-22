import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'

// Mirrors backend src/validators/projectValidator.js createProjectSchema /
// updateProjectSchema exactly (projectName max 150, required; description optional).
const schema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(150, 'Project name cannot exceed 150 characters'),
  description: z.string().optional(),
})

export default function ProjectFormModal({ open, onClose, onSubmit, project, isSubmitting }) {
  const isEditMode = !!project

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { projectName: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        project
          ? { projectName: project.project_name, description: project.description ?? '' }
          : { projectName: '', description: '' }
      )
    }
  }, [open, project, reset])

  const submit = async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      // Backend returns 409 "You already have a project with this name"
      const message = err?.response?.data?.message
      if (message?.toLowerCase().includes('project with this name')) {
        setError('projectName', { message })
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit project' : 'Create project'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Input
          label="Project name"
          placeholder="e.g. Website Redesign"
          error={errors.projectName?.message}
          {...register('projectName')}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Description <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="What's this project about?"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register('description')}
          />
        </div>
      </form>
    </Modal>
  )
}
