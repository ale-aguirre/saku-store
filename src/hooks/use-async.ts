import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseAsyncOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

interface UseAsyncReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await asyncFunction(...args)
        
        setData(result)
        
        if (onSuccess) {
          onSuccess(result)
        }
        
        if (showSuccessToast && successMessage) {
          toast.success(successMessage)
        }
        
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Error desconocido')
        setError(error)
        
        if (onError) {
          onError(error)
        }
        
        if (showErrorToast) {
          const message = errorMessage || error.message || 'Ha ocurrido un error'
          toast.error(message)
        }
        
        return null
      } finally {
        setLoading(false)
      }
    },
    [asyncFunction, onSuccess, onError, successMessage, errorMessage, showSuccessToast, showErrorToast]
  )

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

// Hook específico para formularios
export function useFormSubmit<T = any>(
  submitFunction: (formData: FormData) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  return useAsync(submitFunction, {
    showSuccessToast: true,
    showErrorToast: true,
    ...options
  })
}