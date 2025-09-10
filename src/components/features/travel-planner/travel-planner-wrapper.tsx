'use client'

import { ErrorBoundary } from '@/components/common/error-boundary'
import { TravelChat } from '@/components/chat/travel-chat'

interface TravelPlannerWrapperProps {
  onTravelPlanReady?: (plan: string) => void
}

export function TravelPlannerWrapper({ onTravelPlanReady }: TravelPlannerWrapperProps) {
  return (
    <ErrorBoundary fallback={
      <div className="bg-white border border-destructive/20 rounded-2xl p-8 text-center">
        <div className="text-destructive mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="font-semibold mb-2">Conseiller IA temporairement indisponible</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Veuillez utiliser le mode &quot;Transport Direct&quot; ou réessayer plus tard.
        </p>
      </div>
    }>
      <TravelChat onTravelPlanReady={onTravelPlanReady} />
    </ErrorBoundary>
  )
}