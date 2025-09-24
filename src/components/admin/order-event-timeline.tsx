'use client'

import { useState } from 'react'
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  CreditCard, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface OrderEvent {
  id: string
  type: string
  description: string | null
  metadata: Record<string, any> | null
  created_at: string
}

interface OrderEventTimelineProps {
  events: OrderEvent[]
  className?: string
}

export function OrderEventTimeline({ events, className = '' }: OrderEventTimelineProps) {
  const [showAllEvents, setShowAllEvents] = useState(false)
  
  // Ordenar eventos por fecha (más reciente primero)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  // Mostrar solo los 3 eventos más recientes a menos que showAllEvents sea true
  const displayEvents = showAllEvents ? sortedEvents : sortedEvents.slice(0, 3)
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'order_created':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'status_change':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'payment_received':
        return <CreditCard className="h-5 w-5 text-purple-500" />
      case 'tracking_added':
        return <Truck className="h-5 w-5 text-orange-500" />
      case 'email_sent':
        return <Mail className="h-5 w-5 text-blue-500" />
      case 'processing':
        return <Package className="h-5 w-5 text-indigo-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }
  
  const getEventTitle = (event: OrderEvent) => {
    switch (event.type) {
      case 'order_created':
        return 'Orden creada'
      case 'status_change':
        if (event.metadata) {
          const newStatus = event.metadata.new_status
          switch (newStatus) {
            case 'pending': return 'Estado cambiado a Pendiente'
            case 'paid': return 'Estado cambiado a Pagado'
            case 'processing': return 'Estado cambiado a Procesando'
            case 'shipped': return 'Estado cambiado a Enviado'
            case 'delivered': return 'Estado cambiado a Entregado'
            case 'cancelled': return 'Estado cambiado a Cancelado'
            default: return `Estado cambiado a ${newStatus}`
          }
        }
        return 'Cambio de estado'
      case 'payment_received':
        return 'Pago recibido'
      case 'tracking_added':
        return 'Código de seguimiento agregado'
      case 'email_sent':
        return event.metadata?.email_type === 'order_confirmation' 
          ? 'Email de confirmación enviado' 
          : 'Email enviado'
      default:
        return event.type.replace(/_/g, ' ')
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getEventDetails = (event: OrderEvent) => {
    if (!event.metadata) return null
    
    switch (event.type) {
      case 'status_change':
        return (
          <div className="mt-1 text-sm">
            <span className="text-gray-500">De: </span>
            <Badge variant="outline" className="ml-1">
              {event.metadata.old_status || 'desconocido'}
            </Badge>
            <span className="mx-2 text-gray-500">→</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {event.metadata.new_status}
            </Badge>
          </div>
        )
      case 'tracking_added':
        return (
          <div className="mt-1 text-sm">
            <span className="text-gray-500">Código: </span>
            <Badge variant="outline" className="ml-1">
              {event.metadata.tracking_code}
            </Badge>
          </div>
        )
      case 'email_sent':
        return (
          <div className="mt-1 text-sm">
            <span className="text-gray-500">Enviado a: </span>
            <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
              {event.metadata.recipient}
            </span>
          </div>
        )
      default:
        if (Object.keys(event.metadata).length > 0) {
          return (
            <div className="mt-1">
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  Ver detalles
                </summary>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              </details>
            </div>
          )
        }
        return null
    }
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {displayEvents.map((event) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            {getEventIcon(event.type)}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h4 className="font-medium">{getEventTitle(event)}</h4>
                {event.description && (
                  <p className="text-sm text-gray-600">{event.description}</p>
                )}
                {getEventDetails(event)}
              </div>
              <div className="text-sm text-gray-500 mt-1 sm:mt-0">
                {formatDate(event.created_at)}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {sortedEvents.length > 3 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-2 text-gray-500"
          onClick={() => setShowAllEvents(!showAllEvents)}
        >
          {showAllEvents ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Ver {sortedEvents.length - 3} eventos más
            </>
          )}
        </Button>
      )}
    </div>
  )
}