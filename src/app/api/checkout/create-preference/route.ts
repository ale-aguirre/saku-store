import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Esquema de validación para los datos del checkout
const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    size: z.string(),
    color: z.string(),
    image: z.string()
  })),
  shippingData: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    province: z.string(),
    shippingMethod: z.enum(['nacional', 'cadete']),
    notes: z.string().optional()
  }),
  shippingCost: z.number(),
  total: z.number()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)
    
    const { items, shippingData, shippingCost } = validatedData

    // Verificar que tenemos el token de Mercado Pago
    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de Mercado Pago no configurado' },
        { status: 500 }
      )
    }

    // Preparar items para Mercado Pago
    const mpItems = items.map(item => ({
      id: item.id,
      title: `${item.name} - ${item.size} - ${item.color}`,
      description: `${item.name} talle ${item.size} color ${item.color}`,
      category_id: 'fashion',
      quantity: item.quantity,
      currency_id: 'ARS',
      unit_price: item.price
    }))

    // Agregar costo de envío como item
    mpItems.push({
      id: 'shipping',
      title: `Envío ${shippingData.shippingMethod === 'cadete' ? 'Cadete Córdoba' : 'Nacional'}`,
      description: 'Costo de envío',
      category_id: 'services',
      quantity: 1,
      currency_id: 'ARS',
      unit_price: shippingCost
    })

    // Crear preferencia en Mercado Pago
    const preferenceData = {
      items: mpItems,
      payer: {
        name: shippingData.firstName,
        surname: shippingData.lastName,
        email: shippingData.email,
        phone: {
          number: shippingData.phone
        },
        address: {
          street_name: shippingData.address,
          zip_code: shippingData.postalCode
        }
      },
      shipments: {
        receiver_address: {
          street_name: shippingData.address,
          city_name: shippingData.city,
          state_name: shippingData.province,
          zip_code: shippingData.postalCode
        }
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      external_reference: `order_${Date.now()}`,
      metadata: {
        shipping_method: shippingData.shippingMethod,
        shipping_notes: shippingData.notes || '',
        order_items: JSON.stringify(items)
      }
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Error de Mercado Pago:', errorData)
      return NextResponse.json(
        { error: 'Error al crear la preferencia de pago' },
        { status: 500 }
      )
    }

    const preference = await response.json()

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point
    })

  } catch (error) {
    console.error('Error en create-preference:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}