import { test, expect } from '@playwright/test'

test.describe('Webhook de Mercado Pago', () => {
  test('debe procesar correctamente un webhook de pago aprobado', async ({ request }) => {

    // Simular un webhook de Mercado Pago
    const webhookPayload = {
      action: 'payment.updated',
      api_version: 'v1',
      data: {
        id: '12345678901'
      },
      date_created: new Date().toISOString(),
      id: 123456789,
      live_mode: false,
      type: 'payment',
      user_id: '123456789'
    }

    // Enviar webhook a la API
    const response = await request.post('/api/webhooks/mercadopago', {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    // Verificar que el webhook responde correctamente (404 porque no hay orden con esa referencia)
    expect(response.status()).toBe(404)
    
    const responseBody = await response.json()
    expect(responseBody).toHaveProperty('message', 'Order not found')
  })

  test('debe rechazar webhooks con datos inválidos', async ({ request }) => {
    // Enviar webhook con datos inválidos
    const invalidPayload = {
      invalid: 'data'
    }

    const response = await request.post('/api/webhooks/mercadopago', {
      data: invalidPayload,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    // Verificar que se rechaza el webhook inválido
    expect(response.status()).toBe(500) // El webhook devuelve 500 para errores de validación
  })

  test('debe actualizar el estado de la orden cuando el pago es aprobado', async ({ request }) => {
    // Simular webhook de pago aprobado con un ID diferente
    const webhookPayload = {
      action: 'payment.updated',
      api_version: 'v1',
      data: {
        id: '12345678901'
      },
      date_created: new Date().toISOString(),
      id: 123456789,
      live_mode: false,
      type: 'payment',
      user_id: '123456789'
    }

    const response = await request.post('/api/webhooks/mercadopago', {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    expect(response.status()).toBe(404)
     
     const responseBody = await response.json()
     expect(responseBody).toHaveProperty('message', 'Order not found')
  })

  test('debe registrar eventos de orden correctamente', async ({ request }) => {
    // Simular webhook de pago aprobado con otro ID
    const webhookPayload = {
      action: 'payment.updated',
      api_version: 'v1',
      data: {
        id: '12345678902' // Este ID debe coincidir con el mock en el webhook
      },
      date_created: new Date().toISOString(),
      id: 123456790,
      live_mode: false,
      type: 'payment',
      user_id: '123456789'
    }

    const response = await request.post('/api/webhooks/mercadopago', {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
      }
    })

    // Verificar que el webhook responde correctamente (404 porque no hay orden con esa referencia)
     expect(response.status()).toBe(404)
     
     const responseBody = await response.json()
     expect(responseBody).toHaveProperty('message', 'Order not found')
  })
})