/**
 * Custom hook for secure form handling with client-side validation
 * Provides additional security layers beyond basic validation
 */

import { useState, useCallback, useRef } from 'react'
import { sanitizeInput, validateEmail, validatePhone } from '@/lib/security'

interface UseSecureFormOptions {
  rateLimitMs?: number
  maxAttempts?: number
  onSecurityViolation?: (violation: string) => void
}

interface SecurityMetrics {
  submissionCount: number
  lastSubmission: number
  violations: string[]
  blocked: boolean
}

export function useSecureForm(options: UseSecureFormOptions = {}) {
  const {
    rateLimitMs = 2000, // 2 seconds between submissions
    maxAttempts = 5,
    onSecurityViolation
  } = options

  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    submissionCount: 0,
    lastSubmission: 0,
    violations: [],
    blocked: false
  })

  const violationTimeoutRef = useRef<NodeJS.Timeout>()

  /**
   * Check if form submission is allowed
   */
  const checkSubmissionSecurity = useCallback((): {
    allowed: boolean
    reason?: string
    waitTime?: number
  } => {
    const now = Date.now()

    // Check if blocked due to violations
    if (securityMetrics.blocked) {
      return {
        allowed: false,
        reason: 'Compte temporairement bloqué pour des raisons de sécurité'
      }
    }

    // Rate limiting check
    if (securityMetrics.lastSubmission > 0) {
      const timeSinceLastSubmission = now - securityMetrics.lastSubmission
      if (timeSinceLastSubmission < rateLimitMs) {
        return {
          allowed: false,
          reason: 'Veuillez attendre avant de soumettre à nouveau',
          waitTime: Math.ceil((rateLimitMs - timeSinceLastSubmission) / 1000)
        }
      }
    }

    // Check submission frequency
    if (securityMetrics.submissionCount >= maxAttempts) {
      return {
        allowed: false,
        reason: 'Trop de tentatives. Veuillez recharger la page.'
      }
    }

    return { allowed: true }
  }, [securityMetrics, rateLimitMs, maxAttempts])

  /**
   * Record a security violation
   */
  const recordViolation = useCallback((violation: string) => {
    setSecurityMetrics(prev => {
      const newViolations = [...prev.violations, violation]
      const blocked = newViolations.length >= 3

      if (blocked && onSecurityViolation) {
        onSecurityViolation(`Multiple violations: ${newViolations.join(', ')}`)
      }

      // Auto-unblock after 5 minutes
      if (blocked && violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current)
      }

      if (blocked) {
        violationTimeoutRef.current = setTimeout(() => {
          setSecurityMetrics(metrics => ({ ...metrics, blocked: false, violations: [] }))
        }, 5 * 60 * 1000)
      }

      return {
        ...prev,
        violations: newViolations,
        blocked
      }
    })
  }, [onSecurityViolation])

  /**
   * Validate and sanitize form data
   */
  const validateFormData = useCallback(<T extends Record<string, any>>(
    data: T,
    schema?: Record<keyof T, (value: any) => boolean>
  ): { isValid: boolean; sanitizedData?: T; errors: string[] } => {
    const errors: string[] = []
    const sanitizedData = { ...data }

    try {
      // Basic sanitization for all string fields
      Object.keys(data).forEach(key => {
        const value = data[key]

        if (typeof value === 'string') {
          // Check for suspicious patterns
          const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /data:text\/html/i,
            /vbscript:/i
          ]

          const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(value))

          if (hasSuspiciousContent) {
            recordViolation(`Suspicious content in field: ${key}`)
            errors.push(`Contenu suspect détecté dans le champ ${key}`)
            return
          }

          // Sanitize the value
          const maxLength = key === 'message' ? 2000 :
                           key.includes('email') ? 255 :
                           key.includes('phone') ? 20 : 500

          sanitizedData[key] = sanitizeInput(value, {
            maxLength,
            allowHtml: false,
            allowSpecialChars: !key.includes('email') && !key.includes('phone')
          })
        }
      })

      // Schema-based validation
      if (schema) {
        Object.keys(schema).forEach(key => {
          const validator = schema[key]
          const value = sanitizedData[key]

          if (!validator(value)) {
            errors.push(`Validation échouée pour le champ ${key}`)
          }
        })
      }

      // Email validation
      const emailFields = Object.keys(data).filter(key =>
        key.toLowerCase().includes('email') && typeof data[key] === 'string'
      )

      emailFields.forEach(field => {
        if (data[field] && !validateEmail(data[field])) {
          errors.push(`Format d'email invalide: ${field}`)
        }
      })

      // Phone validation
      const phoneFields = Object.keys(data).filter(key =>
        key.toLowerCase().includes('phone') && typeof data[key] === 'string'
      )

      phoneFields.forEach(field => {
        if (data[field] && !validatePhone(data[field])) {
          errors.push(`Format de téléphone invalide: ${field}`)
        }
      })

      return {
        isValid: errors.length === 0,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined,
        errors
      }

    } catch (error) {
      recordViolation('Form validation error')
      return {
        isValid: false,
        errors: ['Erreur de validation du formulaire']
      }
    }
  }, [recordViolation])

  /**
   * Record a successful form submission
   */
  const recordSubmission = useCallback(() => {
    setSecurityMetrics(prev => ({
      ...prev,
      submissionCount: prev.submissionCount + 1,
      lastSubmission: Date.now()
    }))
  }, [])

  /**
   * Reset security metrics (useful for successful operations)
   */
  const resetSecurityMetrics = useCallback(() => {
    setSecurityMetrics({
      submissionCount: 0,
      lastSubmission: 0,
      violations: [],
      blocked: false
    })

    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current)
    }
  }, [])

  return {
    checkSubmissionSecurity,
    validateFormData,
    recordSubmission,
    recordViolation,
    resetSecurityMetrics,
    securityMetrics: {
      ...securityMetrics,
      isSecure: !securityMetrics.blocked && securityMetrics.violations.length < 3
    }
  }
}