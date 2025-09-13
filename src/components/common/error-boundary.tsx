'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { AccessibleButton } from '@/components/ui/accessible-button'
import { reportReactError } from '@/utils/error-reporting'
import { ScreenReaderAnnouncer } from '@/utils/accessibility'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error?: Error
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null
  
  public state: State = {
    hasError: false,
    errorId: ''
  }

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return { hasError: true, error, errorId }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to error monitoring
    reportReactError(error, errorInfo)
    
    // Announce to screen readers
    const announcer = ScreenReaderAnnouncer.getInstance()
    announcer.announce('Une erreur s\'est produite. Veuillez utiliser les boutons pour réessayer.', 'assertive')
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Auto-retry after 5 seconds in development
    if (process.env.NODE_ENV === 'development') {
      this.resetTimeoutId = window.setTimeout(() => {
        this.handleRetry()
      }, 5000)
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props
    const { hasError } = this.state
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey)) {
        this.handleRetry()
      }
    }
  }

  public componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private handleRetry = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }
    
    const announcer = ScreenReaderAnnouncer.getInstance()
    announcer.announce('Tentative de récupération en cours...', 'polite')
    
    this.setState({ hasError: false, error: undefined, errorId: '' })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2" role="alert">
                Oops, une erreur s&apos;est produite
              </h2>
              <p 
                id={`error-description-${this.state.errorId}`}
                className="text-muted-foreground text-sm mb-6"
              >
                Nous nous excusons pour ce désagrément. Cette erreur a été signalée automatiquement. 
                Vous pouvez réessayer ou recharger la page pour continuer.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <AccessibleButton 
                onClick={this.handleRetry}
                variant="outline"
                className="min-w-[120px]"
                aria-describedby={`error-description-${this.state.errorId}`}
              >
                Réessayer
              </AccessibleButton>
              <AccessibleButton 
                onClick={this.handleReload}
                variant="primary"
                className="min-w-[120px]"
                aria-describedby={`error-description-${this.state.errorId}`}
              >
                Recharger la page
              </AccessibleButton>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  Détails de l&apos;erreur (dev mode)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}