// Export all custom hooks for easy importing
export { useTripManagement } from './use-trip-management'
export { useKeyboardNavigation, useFocusManagement } from './use-keyboard-navigation'
export { 
  useScreenReader, 
  useReducedMotion, 
  useHighContrast, 
  useFocusManagement as useAccessibilityFocus,
  useSkipLinks,
  useLiveRegion 
} from './use-accessibility'
export { useOptimizedState } from './use-optimized-state'
export { useLoadingStates } from './use-loading-states'
export { useChat } from './use-chat'
export { useFormValidation } from './use-form-validation'
export { usePerformance, useResourceMonitoring } from './use-performance'
export { useSEO, usePageTracking, useStructuredData } from './use-seo'

// Re-export types
export type { Message, ChatState, UseChatOptions } from './use-chat'
export type { ValidationRule, FormField, FormState, UseFormValidationOptions } from './use-form-validation'
export type { PerformanceMetrics } from './use-performance'
export type { SEOConfig } from './use-seo'