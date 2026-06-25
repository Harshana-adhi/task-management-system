import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'

/**
 * Catches JavaScript errors anywhere in the component tree below it and
 * shows a fallback UI instead of crashing the whole app to a white screen.
 * Must be a class component — React only supports error boundaries this way.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
  }

  handleReload = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-2 bg-slate-50 px-4 text-center dark:bg-slate-950">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400">
            <AlertTriangle className="size-7" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            An unexpected error occurred. Try reloading the page — if the problem continues, contact support.
          </p>
          <Button variant="secondary" className="mt-3" onClick={this.handleReload}>
            Reload app
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
