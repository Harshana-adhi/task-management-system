import { Toaster } from 'sonner'
import { useThemeStore } from '../../store/useThemeStore'

/**
 * Mount once in main.jsx. Use the `toast` function from 'sonner' anywhere
 * else in the app, e.g. `import { toast } from 'sonner'; toast.success(...)`.
 */
export default function AppToaster() {
  const theme = useThemeStore((s) => s.theme)

  return (
    <Toaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: { fontFamily: 'var(--font-sans)' },
      }}
    />
  )
}
