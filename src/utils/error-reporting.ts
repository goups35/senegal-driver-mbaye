/**
 * Enhanced error reporting and monitoring utilities
 */

export interface ErrorReport {
  message: string
  stack?: string
  url: string
  timestamp: number
  userAgent: string
  userId?: string
  sessionId?: string
  context?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ErrorReportingConfig {
  endpoint?: string
  apiKey?: string
  enableConsoleLog?: boolean
  enableLocalStorage?: boolean
  maxReports?: number
  userId?: string
}

class ErrorReporter {
  private static instance: ErrorReporter
  private config: ErrorReportingConfig
  private sessionId: string
  private reports: ErrorReport[] = []

  private constructor(config: ErrorReportingConfig = {}) {
    this.config = {
      enableConsoleLog: true,
      enableLocalStorage: true,
      maxReports: 50,
      ...config
    }
    this.sessionId = this.generateSessionId()
    this.initializeErrorHandlers()
  }

  static getInstance(config?: ErrorReportingConfig): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter(config)
    }
    return ErrorReporter.instance
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeErrorHandlers() {
    if (typeof window === 'undefined') return

    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError(
        new Error(event.message),
        'high',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript-error'
        }
      )
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        'high',
        {
          type: 'unhandled-promise-rejection',
          reason: event.reason
        }
      )
    })

    // Network error handler
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        if (!response.ok) {
          this.reportError(
            new Error(`Network error: ${response.status} ${response.statusText}`),
            'medium',
            {
              type: 'network-error',
              url: args[0],
              status: response.status,
              statusText: response.statusText
            }
          )
        }
        return response
      } catch (error) {
        this.reportError(
          error instanceof Error ? error : new Error(String(error)),
          'high',
          {
            type: 'network-error',
            url: args[0]
          }
        )
        throw error
      }
    }
  }

  reportError(
    error: Error,
    severity: ErrorReport['severity'] = 'medium',
    context?: Record<string, any>
  ) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      userId: this.config.userId,
      sessionId: this.sessionId,
      context,
      severity
    }

    this.addReport(report)

    if (this.config.enableConsoleLog) {
      const consoleMethod = severity === 'critical' || severity === 'high' ? 'error' : 'warn'
      console[consoleMethod]('Error reported:', report)
    }

    if (this.config.endpoint) {
      this.sendToEndpoint(report)
    }

    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage()
    }
  }

  private addReport(report: ErrorReport) {
    this.reports.push(report)
    if (this.reports.length > (this.config.maxReports || 50)) {
      this.reports = this.reports.slice(-this.config.maxReports!)
    }
  }

  private async sendToEndpoint(report: ErrorReport) {
    try {
      if (!this.config.endpoint) return

      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(report)
      })
    } catch (error) {
      console.error('Failed to send error report:', error)
    }
  }

  private saveToLocalStorage() {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem('error-reports', JSON.stringify({
        sessionId: this.sessionId,
        reports: this.reports.slice(-10) // Keep only last 10 reports
      }))
    } catch (error) {
      console.warn('Failed to save error reports to localStorage:', error)
    }
  }

  getReports(): ErrorReport[] {
    return [...this.reports]
  }

  getReportsByTimeRange(startTime: number, endTime: number): ErrorReport[] {
    return this.reports.filter(
      report => report.timestamp >= startTime && report.timestamp <= endTime
    )
  }

  getReportsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.reports.filter(report => report.severity === severity)
  }

  clearReports() {
    this.reports = []
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('error-reports')
    }
  }

  // Manual error reporting for business logic errors
  logError(message: string, context?: Record<string, any>, severity: ErrorReport['severity'] = 'medium') {
    this.reportError(new Error(message), severity, context)
  }

  // User action tracking for error context
  trackUserAction(action: string, data?: Record<string, any>) {
    if (typeof window === 'undefined') return
    
    const actionData = {
      action,
      timestamp: Date.now(),
      url: window.location.href,
      ...data
    }

    // Store recent actions for error context
    const recentActions = JSON.parse(localStorage.getItem('recent-actions') || '[]')
    recentActions.push(actionData)
    
    // Keep only last 20 actions
    if (recentActions.length > 20) {
      recentActions.splice(0, recentActions.length - 20)
    }
    
    localStorage.setItem('recent-actions', JSON.stringify(recentActions))
  }
}

// Export singleton instance creator
export function createErrorReporter(config?: ErrorReportingConfig): ErrorReporter {
  return ErrorReporter.getInstance(config)
}

// Export default instance
export const errorReporter = ErrorReporter.getInstance()

// React error boundary helper
export function reportReactError(error: Error, errorInfo: any) {
  errorReporter.reportError(error, 'high', {
    type: 'react-error',
    componentStack: errorInfo.componentStack,
    errorBoundary: true
  })
}