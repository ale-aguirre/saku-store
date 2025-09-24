'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Truck, Save, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useOrderConfirmationEmail } from '@/hooks/use-order-emails'

interface OrderShippingManagerProps {
  order: {
    id: string
    order_number: string
    status: string
    tracking_number: string | null
    tracking_url: string | null
    shipping_method: string | null
    shipping_address: any
    user_id: string
  }
  onUpdate: () => void
}

const SHIPPING_CARRIERS = [
  { id: 'correo_argentino', name: 'Correo Argentino' },
  { id: 'oca', name: 'OCA' },
  { id: 'andreani', name: 'Andreani' },
  { id: 'cadete', name: 'Cadete Córdoba' },
  { id: 'otro', name: 'Otro' }
]

const TRACKING_URL_TEMPLATES = {
  correo_argentino: 'https://www.correoargentino.com.ar/formularios/e-commerce?n=',
  oca: 'https://www.oca.com.ar/Busqueda/Envio?numero=',
  andreani: 'https://www.andreani.com/#!/informacionEnvio/',
  cadete: '',
  otro: ''
}

export function OrderShippingManager({ order, onUpdate }: OrderShippingManagerProps) {
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '')
  const [carrier, setCarrier] = useState<string>(
    order.shipping_method || 
    (order.shipping_address?.shipping_method === 'cadete' ? 'cadete' : 'correo_argentino')
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  
  const { mutate: sendEmail, isLoading: isSendingEmail } = useOrderConfirmationEmail()
  
  const updateShippingInfo = async () => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      
      // Generar URL de seguimiento si no se proporcionó una
      let finalTrackingUrl = trackingUrl
      if (trackingNumber && !trackingUrl && TRACKING_URL_TEMPLATES[carrier as keyof typeof TRACKING_URL_TEMPLATES]) {
        finalTrackingUrl = `${TRACKING_URL_TEMPLATES[carrier as keyof typeof TRACKING_URL_TEMPLATES]}${trackingNumber}`
      }
      
      // Actualizar la orden
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          tracking_url: finalTrackingUrl,
          shipping_method: carrier,
          // Si hay número de seguimiento y el estado es 'paid' o 'processing', actualizar a 'shipped'
          ...(trackingNumber && ['paid', 'processing'].includes(order.status) ? { status: 'shipped' } : {})
        })
        .eq('id', order.id)
      
      if (error) throw error
      
      // Crear evento de seguimiento
      await supabase
        .from('order_events')
        .insert({
          order_id: order.id,
          type: 'tracking_added',
          description: 'Información de envío actualizada',
          metadata: {
            tracking_number: trackingNumber,
            tracking_url: finalTrackingUrl,
            carrier
          }
        })
      
      // Notificar al usuario si se cambió a 'shipped'
      if (trackingNumber && ['paid', 'processing'].includes(order.status)) {
        setShowNotification(true)
      }
      
      onUpdate()
    } catch (error) {
      console.error('Error al actualizar información de envío:', error)
      alert('Error al actualizar información de envío')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const sendShippingNotification = async () => {
    try {
      // Obtener email del usuario
      const supabase = createClient()
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', order.user_id)
        .single()
      
      if (userError || !userData) {
        throw new Error('No se pudo obtener la información del usuario')
      }
      
      // Enviar email
      sendEmail({
        orderId: order.id,
        customerEmail: userData.email
      }, {
        onSuccess: () => {
          setShowNotification(false)
          
          // Registrar evento de email enviado
          const supabase = createClient()
          supabase
            .from('order_events')
            .insert({
              order_id: order.id,
              type: 'email_sent',
              description: 'Email de envío enviado',
              metadata: {
                email_type: 'shipping_notification',
                recipient: userData.email
              }
            })
            .then(() => onUpdate())
        }
      })
    } catch (error) {
      console.error('Error al enviar notificación:', error)
      alert('Error al enviar notificación de envío')
    }
  }
  
  const getCarrierName = (carrierId: string) => {
    return SHIPPING_CARRIERS.find(c => c.id === carrierId)?.name || carrierId
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
        {/* Dirección de envío */}
        {order.shipping_address && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Dirección de envío</h4>
            <p className="text-sm">
              {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
              {order.shipping_address.address_line_1}<br />
              {order.shipping_address.address_line_2 && <>{order.shipping_address.address_line_2}<br /></>}
              {order.shipping_address.city}, {order.shipping_address.state}<br />
              {order.shipping_address.postal_code}
            </p>
          </div>
        )}
        
        <Separator />
        
        {/* Estado actual */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Estado de envío</h4>
            <p className="text-sm text-gray-600">
              {order.status === 'shipped' || order.status === 'delivered' 
                ? 'Pedido enviado' 
                : 'Pendiente de envío'}
            </p>
          </div>
          <Badge 
            className={
              order.status === 'shipped' || order.status === 'delivered'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            {order.status === 'shipped' ? 'Enviado' : 
             order.status === 'delivered' ? 'Entregado' : 'Pendiente'}
          </Badge>
        </div>
        
        {/* Información de seguimiento actual */}
        {order.tracking_number && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Número de seguimiento:</p>
                <p className="font-mono">{order.tracking_number}</p>
              </div>
              {order.tracking_url && (
                <a 
                  href={order.tracking_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  Seguimiento
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
            {order.shipping_method && (
              <p className="text-xs text-gray-600 mt-1">
                Transportista: {getCarrierName(order.shipping_method)}
              </p>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Formulario de actualización */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="carrier">Transportista</Label>
            <Select 
              value={carrier} 
              onValueChange={setCarrier}
            >
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Seleccionar transportista" />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_CARRIERS.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="tracking">Número de seguimiento</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ingresa el código de seguimiento"
            />
          </div>
          
          <div>
            <Label htmlFor="trackingUrl">URL de seguimiento (opcional)</Label>
            <Input
              id="trackingUrl"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="URL para seguimiento del envío"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no se proporciona, se generará automáticamente para transportistas conocidos
            </p>
          </div>
          
          <Button 
            onClick={updateShippingInfo}
            disabled={isUpdating}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar información de envío
          </Button>
        </div>
        
        {/* Notificación al cliente */}
        {showNotification && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800">¿Notificar al cliente?</h4>
            <p className="text-sm text-green-700 mb-3">
              El estado del pedido ha cambiado a "Enviado". ¿Deseas enviar una notificación por email al cliente?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotification(false)}
              >
                No, ahora no
              </Button>
              <Button
                size="sm"
                onClick={sendShippingNotification}
                disabled={isSendingEmail}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSendingEmail ? 'Enviando...' : 'Sí, notificar al cliente'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}