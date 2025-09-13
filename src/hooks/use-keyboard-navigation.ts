'use client'

import { useEffect, useCallback } from 'react'

interface UseKeyboardNavigationOptions {
  onEscape?: () => void
  onEnter?: () => void
  onArrowDown?: () => void
  onArrowUp?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
  disabled?: boolean
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    onEscape,
    onEnter,
    onArrowDown,
    onArrowUp,
    onArrowLeft,
    onArrowRight,
    onTab,
    disabled = false,
  } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return

    switch (event.key) {
      case 'Escape':
        onEscape?.()
        break
      case 'Enter':
        onEnter?.()
        break
      case 'ArrowDown':
        event.preventDefault()
        onArrowDown?.()
        break
      case 'ArrowUp':
        event.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowLeft':
        onArrowLeft?.()
        break
      case 'ArrowRight':
        onArrowRight?.()
        break
      case 'Tab':
        onTab?.()
        break
    }
  }, [disabled, onEscape, onEnter, onArrowDown, onArrowUp, onArrowLeft, onArrowRight, onTab])

  useEffect(() => {
    if (disabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, disabled])

  return { handleKeyDown }
}

// Focus management hook
export function useFocusManagement() {
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
    }
  }, [])

  const focusFirstFocusable = useCallback((container?: HTMLElement) => {
    const containerEl = container || document
    const focusable = containerEl.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    if (focusable) {
      focusable.focus()
    }
  }, [])

  const focusLastFocusable = useCallback((container?: HTMLElement) => {
    const containerEl = container || document
    const focusableElements = containerEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    if (lastElement) {
      lastElement.focus()
    }
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  }, [])

  return {
    focusElement,
    focusFirstFocusable,
    focusLastFocusable,
    trapFocus,
  }
}