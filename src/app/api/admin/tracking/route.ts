import { NextRequest, NextResponse } from 'next/server'
import { getCorreoArgentinoClient } from '@/lib/correo-argentino'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get('trackingNumber')
    const carrier = searchParams.get('carrier')

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Número de tracking requerido' },
        { status: 400 }
      )
    }

    // Por ahora solo soportamos Correo Argentino
    if (carrier !== 'correo_argentino') {
      return NextResponse.json(
        { 
          error: 'Transportista no soportado',
          supportedCarriers: ['correo_argentino']
        },
        { status: 400 }
      )
    }

    const client = getCorreoArgentinoClient()
    
    try {
      const trackingInfo = await client.getTracking(trackingNumber)
      
      return NextResponse.json({
        success: true,
        trackingNumber,
        carrier,
        trackingInfo,
        trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce?n=${trackingNumber}`
      })
    } catch (trackingError) {
      console.error('Error al consultar tracking:', trackingError)
      
      return NextResponse.json({
        success: false,
        trackingNumber,
        carrier,
        error: 'No se pudo obtener información de tracking',
        trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce?n=${trackingNumber}`
      })
    }

  } catch (error) {
    console.error('Error en endpoint de tracking:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, trackingNumber, carrier = 'correo_argentino' } = body

    if (!orderId || !trackingNumber) {
      return NextResponse.json(
        { error: 'ID de orden y número de tracking requeridos' },
        { status: 400 }
      )
    }

    // Obtener información de tracking
    const client = getCorreoArgentinoClient()
    
    try {
      const trackingInfo = await client.getTracking(trackingNumber)
      
      // Aquí podrías actualizar la orden en la base de datos con la información de tracking
      // Por ahora solo devolvemos la información
      
      return NextResponse.json({
        success: true,
        orderId,
        trackingNumber,
        carrier,
        trackingInfo,
        trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce?n=${trackingNumber}`,
        message: 'Información de tracking obtenida exitosamente'
      })
    } catch (trackingError) {
      console.error('Error al consultar tracking:', trackingError)
      
      return NextResponse.json({
        success: false,
        orderId,
        trackingNumber,
        carrier,
        error: 'No se pudo obtener información de tracking',
        trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce?n=${trackingNumber}`,
        message: 'Tracking guardado pero sin información detallada'
      })
    }

  } catch (error) {
    console.error('Error en endpoint de tracking POST:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
