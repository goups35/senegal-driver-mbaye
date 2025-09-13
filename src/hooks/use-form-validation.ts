'use client'

import { useState, useCallback } from 'react'
import { useScreenReader } from './use-accessibility'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

export interface FormField {
  value: string
  error: string | null
  touched: boolean
}

export interface FormState {
  [key: string]: FormField
}

export interface UseFormValidationOptions {
  initialValues?: Record<string, string>
  validationRules?: Record<string, ValidationRule>
  onSubmit?: (values: Record<string, string>) => Promise<void> | void
}

export function useFormValidation({
  initialValues = {},
  validationRules = {},
  onSubmit
}: UseFormValidationOptions) {
  const { announce } = useScreenReader()
  
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {}
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key] || '',
        error: null,
        touched: false
      }
    })
    return state
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback((name: string, value: string): string | null => {
    const rules = validationRules[name]
    if (!rules) return null

    if (rules.required && !value.trim()) {
      return 'Ce champ est requis'
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} caractères requis`
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} caractères autorisés`
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Format invalide'
    }

    if (rules.custom) {
      return rules.custom(value)
    }

    return null
  }, [validationRules])

  const setValue = useCallback((name: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: null,
        touched: true
      }
    }))
  }, [])

  const setError = useCallback((name: string, error: string | null) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error
      }
    }))
    
    if (error) {
      announce(`Erreur dans le champ ${name}: ${error}`, 'assertive')
    }
  }, [announce])

  const validate = useCallback((name?: string): boolean => {
    if (name) {
      const field = formState[name]
      const error = validateField(name, field.value)
      setError(name, error)
      return !error
    }

    let isValid = true
    Object.keys(formState).forEach(fieldName => {
      const field = formState[fieldName]
      const error = validateField(fieldName, field.value)
      if (error) {
        setError(fieldName, error)
        isValid = false
      }
    })

    return isValid
  }, [formState, validateField, setError])

  const handleBlur = useCallback((name: string) => {
    const field = formState[name]
    if (field.touched) {
      validate(name)
    }
  }, [formState, validate])

  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault()
    }

    if (!validate()) {
      announce('Le formulaire contient des erreurs. Veuillez les corriger.', 'assertive')
      return false
    }

    if (onSubmit) {
      setIsSubmitting(true)
      try {
        const values = Object.keys(formState).reduce((acc, key) => {
          acc[key] = formState[key].value
          return acc
        }, {} as Record<string, string>)

        await onSubmit(values)
        announce('Formulaire soumis avec succès', 'polite')
        return true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
        announce(`Erreur lors de la soumission: ${errorMessage}`, 'assertive')
        return false
      } finally {
        setIsSubmitting(false)
      }
    }

    return true
  }, [formState, validate, onSubmit, announce])

  const reset = useCallback(() => {
    setFormState(prev => {
      const newState: FormState = {}
      Object.keys(prev).forEach(key => {
        newState[key] = {
          value: initialValues[key] || '',
          error: null,
          touched: false
        }
      })
      return newState
    })
    setIsSubmitting(false)
  }, [initialValues])

  const getFieldProps = useCallback((name: string) => ({
    value: formState[name]?.value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(name, e.target.value)
    },
    onBlur: () => handleBlur(name),
    error: formState[name]?.error,
    'aria-invalid': !!formState[name]?.error,
    'aria-describedby': formState[name]?.error ? `${name}-error` : undefined
  }), [formState, setValue, handleBlur])

  const hasErrors = Object.values(formState).some(field => !!field.error)
  const isDirty = Object.values(formState).some(field => field.touched)

  return {
    formState,
    setValue,
    setError,
    validate,
    handleSubmit,
    reset,
    getFieldProps,
    isSubmitting,
    hasErrors,
    isDirty
  }
}