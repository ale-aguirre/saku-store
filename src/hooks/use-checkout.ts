import { useState } from 'react'
import { useCart } from './use-cart'

export interface ShippingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  province: string
  shippingMethod: 'nacional' | 'cadete'
  notes?: string
}

export interface CheckoutState {
  isLoading: boolean
  error: string | null
  shippingData: ShippingData | null
}

export const useCheckout = () => {
  const { items, getTotalPrice, clearCart } = useCart()
  const [state, setState] = useState<CheckoutState>({
    isLoading: false,
    error: null,
    shippingData: null
  })

  const setShippingData = (data: ShippingData) => {
    setState(prev => ({ ...prev, shippingData: data }))
  }

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }

  const isCordobaPostalCode = (postalCode: string): boolean => {
    // Códigos postales de Córdoba Capital: 5000-5999
    const code = parseInt(postalCode)
    return code >= 5000 && code <= 5999
  }

  const getShippingCost = (method: 'nacional' | 'cadete') => {
    // Tarifas de envío según las reglas del proyecto
    return method === 'cadete' ? 2500 : 3500
  }

  const getAvailableShippingMethods = (postalCode?: string) => {
    const methods = [
      {
        id: 'nacional',
        name: 'Envío Nacional',
        description: 'Correo Argentino - 5-7 días hábiles',
        cost: 3500,
        available: true
      }
    ]

    // Solo agregar cadete si el código postal es de Córdoba
    if (postalCode && isCordobaPostalCode(postalCode)) {
      methods.push({
        id: 'cadete',
        name: 'Cadete Córdoba',
        description: 'Solo Córdoba Capital - 1-2 días hábiles',
        cost: 2500,
        available: true
      })
    }

    return methods
  }

  const getTotalWithShipping = (shippingMethod: 'nacional' | 'cadete') => {
    return getTotalPrice() + getShippingCost(shippingMethod)
  }

  const createMercadoPagoPreference = async (shippingData: ShippingData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingData,
          shippingCost: getShippingCost(shippingData.shippingMethod),
          total: getTotalWithShipping(shippingData.shippingMethod)
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear la preferencia de pago')
      }

      const { preferenceId, initPoint } = await response.json()
      
      // Redirigir a Mercado Pago
      window.location.href = initPoint
      
      return { preferenceId, initPoint }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    ...state,
    items,
    getTotalPrice,
    getShippingCost,
    getTotalWithShipping,
    getAvailableShippingMethods,
    isCordobaPostalCode,
    setShippingData,
    setLoading,
    setError,
    createMercadoPagoPreference,
    clearCart
  }
}