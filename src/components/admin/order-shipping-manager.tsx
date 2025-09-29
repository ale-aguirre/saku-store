'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, Package, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { useMutation } from '@tanstack/react-query'

const SHIPPING_CARRIERS = [
  { value: 'correo_argentino', label: 'Correo Argentino' },
  { value: 'oca', label: 'OCA' },
  { value: 'andreani', label: 'Andreani' },
  { value: 'mercado_envios', label: 'Mercado Envíos' },
  { value: 'otro', label: 'Otro' }
]

const TRACKING_URL_TEMPLATES = {
  correo_argentino: 'https://www.correoargentino.com.ar/formularios/e-commerce',
  oca: 'https://www1.oca.com.ar/OcaEpakNet/Tracking.aspx?numero={tracking_number}',
  andreani: 'https://www.andreani.com/seguimiento?numero={tracking_number}',
  mercado_envios: 'https://www.mercadolibre.com.ar/ayuda/seguimiento/{tracking_number}'
}

interface OrderShippingManagerProps {
  order: {
    id: string
    status: string
    shipping_carrier?: string
    tracking_number?: string
    tracking_url?: string
  }
  onUpdate: () => void
}

interface TrackingInfo {
  status: string
  description: string
  location?: string
  date?: string
  events?: Array<{
    date: string
    status: string
    description: string
    location?: string
  }>
}

export default function OrderShippingManager({ order, onUpdate }: OrderShippingManagerProps) {
  const [carrier, setCarrier] = useState(order.shipping_carrier || '')
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '')
  const [isCheckingTracking, setIsCheckingTracking] = useState(false)
  const [trackingStatus, setTrackingStatus] = useState<TrackingInfo | null>(null)

  const updateShippingMutation = useMutation({
    mutationFn: async () => {
      const supabase = createAdminClient()
      
      // Actualizar información de envío
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          shipping_carrier: carrier,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (updateError) throw updateError

      // Crear evento de seguimiento
      const { error: eventError } = await supabase
        .from('order_events')
        .insert({
          order_id: order.id,
          event_type: 'shipping_updated',
          event_data: {
            carrier,
            tracking_number: trackingNumber,
            tracking_url: trackingUrl
          },
          created_at: new Date().toISOString()
        })

      if (eventError) throw eventError

      // Si el estado cambió a "shipped", notificar al usuario
      if (order.status !== 'shipped') {
        const { error: statusError } = await supabase
          .from('orders')
          .update({
            status: 'shipped',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (statusError) throw statusError

        // Enviar notificación por email
        await sendShippingNotification(order.id, trackingNumber, trackingUrl)
      }
    },
    onSuccess: () => {
      onUpdate()
    }
  })

  const sendShippingNotification = async (orderId: string, trackingNumber: string, trackingUrl: string) => {
    try {
      const response = await fetch('/api/admin/orders/notify-shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          trackingNumber,
          trackingUrl
        })
      })

      if (!response.ok) {
        throw new Error('Error al enviar notificación')
      }

      // Registrar evento de envío de email
      const supabase = createAdminClient()
      await supabase
        .from('order_events')
        .insert({
          order_id: orderId,
          event_type: 'email_sent',
          event_data: {
            type: 'shipping_notification',
            tracking_number: trackingNumber,
            tracking_url: trackingUrl
          },
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error al enviar notificación:', error)
    }
  }

  const checkTrackingInfo = async () => {
    if (!trackingNumber || !carrier) return

    setIsCheckingTracking(true)
    setTrackingStatus(null)

    try {
      const response = await fetch(`/api/admin/tracking?number=${encodeURIComponent(trackingNumber)}&carrier=${encodeURIComponent(carrier)}`)
      
      if (!response.ok) {
        throw new Error('Error al consultar el tracking')
      }

      const data = await response.json()
      setTrackingStatus(data.tracking)
    } catch (error) {
      console.error('Error al consultar tracking:', error)
      setTrackingStatus({
        status: 'error',
        description: 'Error al consultar el estado del envío'
      })
    } finally {
      setIsCheckingTracking(false)
    }
  }

  const generateTrackingUrl = (carrier: string, trackingNumber: string) => {
    const template = TRACKING_URL_TEMPLATES[carrier as keyof typeof TRACKING_URL_TEMPLATES]
    if (template) {
      return template.replace('{tracking_number}', trackingNumber)
    }
    return ''
  }

  const handleCarrierChange = (newCarrier: string) => {
    setCarrier(newCarrier)
    if (trackingNumber && newCarrier !== 'otro') {
      const newUrl = generateTrackingUrl(newCarrier, trackingNumber)
      setTrackingUrl(newUrl)
    }
  }

  const handleTrackingNumberChange = (newTrackingNumber: string) => {
    setTrackingNumber(newTrackingNumber)
    if (carrier && carrier !== 'otro' && newTrackingNumber) {
      const newUrl = generateTrackingUrl(carrier, newTrackingNumber)
      setTrackingUrl(newUrl)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Información de Envío
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="carrier">Transportista</Label>
            <Select value={carrier} onValueChange={handleCarrierChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar transportista" />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_CARRIERS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking-number">Número de Seguimiento</Label>
            <Input
              id="tracking-number"
              value={trackingNumber}
              onChange={(e) => handleTrackingNumberChange(e.target.value)}
              placeholder="Ingrese el número de seguimiento"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tracking-url">URL de Seguimiento</Label>
          <div className="flex gap-2">
            <Input
              id="tracking-url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="URL de seguimiento (se genera automáticamente)"
            />
            {trackingUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(trackingUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Sección de tracking automático para Correo Argentino */}
        {carrier === 'correo_argentino' && trackingNumber && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Consulta Automática de Estado
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={checkTrackingInfo}
                disabled={isCheckingTracking}
              >
                {isCheckingTracking ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isCheckingTracking ? 'Consultando...' : 'Consultar Estado'}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Consulta automática del estado del envío en Correo Argentino. 
              Asegúrate de que el número de seguimiento sea válido.
            </p>

            {trackingStatus && (
              <div className="mt-3 p-3 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  {trackingStatus.status === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium">
                    {trackingStatus.status === 'error' ? 'Error' : 'Estado Actual'}
                  </span>
                </div>
                <p className="text-sm">{trackingStatus.description}</p>
                {trackingStatus.location && (
                  <p className="text-sm text-muted-foreground">
                    Ubicación: {trackingStatus.location}
                  </p>
                )}
                {trackingStatus.date && (
                  <p className="text-sm text-muted-foreground">
                    Fecha: {trackingStatus.date}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => updateShippingMutation.mutate()}
            disabled={updateShippingMutation.isPending}
            className="flex-1"
          >
            {updateShippingMutation.isPending ? 'Guardando...' : 'Guardar Información de Envío'}
          </Button>
        </div>

        {order.status === 'processing' && carrier && trackingNumber && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              El estado del pedido ha cambiado a Enviado. ¿Deseas enviar una notificación por email al cliente?
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
