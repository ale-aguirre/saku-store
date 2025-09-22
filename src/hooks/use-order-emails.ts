import { useMutation } from '@tanstack/react-query'

interface SendOrderConfirmationParams {
  orderId: string
  customerEmail: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

const sendOrderConfirmationEmail = async (params: SendOrderConfirmationParams): Promise<EmailResponse> => {
  const response = await fetch('/api/emails/order-confirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Error enviando email')
  }

  return response.json()
}

export const useOrderConfirmationEmail = () => {
  return useMutation({
    mutationFn: sendOrderConfirmationEmail,
    onSuccess: (data) => {
      console.log('Email de confirmación enviado:', data.messageId)
    },
    onError: (error) => {
      console.error('Error enviando email de confirmación:', error)
    },
  })
}

// Hook para verificar la configuración de email
const checkEmailConfiguration = async (): Promise<EmailResponse> => {
  const response = await fetch('/api/emails/order-confirmation', {
    method: 'GET',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Error verificando configuración')
  }

  return response.json()
}

export const useEmailConfigCheck = () => {
  return useMutation({
    mutationFn: checkEmailConfiguration,
    onSuccess: (data) => {
      console.log('Configuración de email verificada:', data)
    },
    onError: (error) => {
      console.error('Error en configuración de email:', error)
    },
  })
}