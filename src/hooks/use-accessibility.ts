'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { 
  ScreenReaderAnnouncer, 
  prefersReducedMotion, 
  prefersHighContrast,
  manageFocusIndicators
} from '@/utils/accessibility'

export function useScreenReader() {
  const announcer = useRef(ScreenReaderAnnouncer.getInstance())

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announcer.current.announce(message, priority)
  }, [])

  return { announce }
}

export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}

export function useHighContrast() {
  const [prefersHigh, setPrefersHigh] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHigh(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHigh(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersHigh
}

export function useFocusManagement() {
  useEffect(() => {
    const cleanup = manageFocusIndicators()
    return cleanup
  }, [])

  const focusElement = useCallback((selector: string, options?: FocusOptions) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus(options)
    }
  }, [])

  const focusFirst = useCallback((container?: HTMLElement, options?: FocusOptions) => {
    const containerEl = container || document
    const focusable = containerEl.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    if (focusable) {
      focusable.focus(options)
    }
  }, [])

  const focusLast = useCallback((container?: HTMLElement, options?: FocusOptions) => {
    const containerEl = container || document
    const focusableElements = containerEl.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    if (lastElement) {
      lastElement.focus(options)
    }
  }, [])

  return {
    focusElement,
    focusFirst,
    focusLast
  }
}

export function useSkipLinks(links: Array<{ target: string; text: string }>) {
  useEffect(() => {
    if (typeof document === 'undefined') return

    const skipContainer = document.createElement('div')
    skipContainer.className = 'skip-links'
    skipContainer.setAttribute('aria-label', 'Liens d\'accès rapide')

    links.forEach(({ target, text }) => {
      const skipLink = document.createElement('a')
      skipLink.href = `#${target}`
      skipLink.textContent = text
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded z-50 transition-all'
      
      skipLink.addEventListener('click', (e) => {
        e.preventDefault()
        const targetElement = document.getElementById(target)
        if (targetElement) {
          targetElement.focus({ preventScroll: false })
          targetElement.scrollIntoView({ behavior: 'smooth' })
        }
      })

      skipContainer.appendChild(skipLink)
    })

    document.body.insertBefore(skipContainer, document.body.firstChild)

    return () => {
      if (skipContainer.parentNode) {
        skipContainer.parentNode.removeChild(skipContainer)
      }
    }
  }, [links])
}

export function useLiveRegion() {
  const regionRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!regionRef.current) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    regionRef.current.setAttribute('aria-live', priority)
    regionRef.current.textContent = message

    timeoutRef.current = setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = ''
      }
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const LiveRegion = useCallback(() => {
    const div = document.createElement('div')
    div.setAttribute('aria-live', 'polite')
    div.setAttribute('aria-atomic', 'true')
    div.className = 'sr-only'
    return div
  }, [])

  return { announce, LiveRegion }
}