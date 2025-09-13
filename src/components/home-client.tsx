'use client'

import { Suspense, lazy } from 'react'
import { AppProvider, useAppContext } from '@/contexts/app-context'
import { Navbar } from '@/components/navigation/navbar'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { LoadingStates, withPerformanceTracking } from '@/components/common/dynamic-imports'

// Lazy load heavy components
const HeroSection = lazy(() => import('@/components/features/hero-section').then(module => ({ 
  default: withPerformanceTracking(module.HeroSection, 'HeroSection')
})))

const TransportSection = lazy(() => import('@/components/features/transport-section').then(module => ({ 
  default: withPerformanceTracking(module.TransportSection, 'TransportSection')
})))

const ChatSection = lazy(() => import('@/components/features/chat-section').then(module => ({ 
  default: withPerformanceTracking(module.ChatSection, 'ChatSection')
})))

const FooterSection = lazy(() => import('@/components/features/footer-section').then(module => ({ 
  default: withPerformanceTracking(module.FooterSection, 'FooterSection')
})))

// Preload components on interaction
function preloadComponent(componentName: string) {
  switch (componentName) {
    case 'transport':
      import('@/components/features/transport-section')
      break
    case 'chat':
      import('@/components/features/chat-section')
      break
  }
}

// Main app content component
function AppContent() {
  const { state } = useAppContext()
  const { mode } = state

  // Preload components on navigation
  const handleModePreload = (targetMode: string) => {
    if (targetMode !== mode) {
      preloadComponent(targetMode)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigationHover={handleModePreload} />
      
      <main>
        <ErrorBoundary>
          {mode === 'home' && (
            <Suspense 
              fallback={<LoadingStates.Hero />}
            >
              <HeroSection />
            </Suspense>
          )}
          
          {mode === 'transport' && (
            <Suspense 
              fallback={<LoadingStates.Transport />}
            >
              <TransportSection />
            </Suspense>
          )}
          
          {mode === 'chat' && (
            <Suspense 
              fallback={<LoadingStates.Chat />}
            >
              <ChatSection />
            </Suspense>
          )}
        </ErrorBoundary>
      </main>
      
      <Suspense fallback={null}>
        <FooterSection showFooter={mode !== 'home'} />
      </Suspense>
    </div>
  )
}

// Performance-optimized HomeClient component
export function HomeClient() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

// Performance monitoring hook
function usePerformanceMonitoring() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log component loading times
        if (entry.entryType === 'measure' && entry.name.includes('Component')) {
          console.log(`📊 ${entry.name}: ${entry.duration.toFixed(2)}ms`)
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['measure'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    return () => observer.disconnect()
  }, [])
}

import React from 'react'