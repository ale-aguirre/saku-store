'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { formatPrice } from "@/lib/utils"
import { 
  ArrowLeft,
  Package,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

// Importar los nuevos componentes
import { OrderEventTimeline } from '@/components/admin/order-event-timeline'
import OrderShippingManager from '@/components/admin/order-shipping-manager'

interface OrderDetail {
  id: string
  status: string | null
  total: number
  subtotal: number
  shipping_cost: number
  discount_amount: number | null
  created_at: string | null
  updated_at: string | null
  shipping_address: any // JSON field
  billing_address: any | null // JSON field
  tracking_number: string | null
  payment_method: string | null
  payment_id: string | null
  notes: string | null
  email: string
  coupon_code: string | null
  user_id: string | null
  profiles: {
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
  } | null
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product_id: string
    product_name: string
    sku: string
    variant_color: string
    variant_size: string
    created_at: string | null
  }>
  order_events: Array<{
    id: string
    event_type: string
    metadata: any | null
    created_at: string | null
    description: string | null
  }>
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Resolver params como promesa
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name,
            phone
          ),
          order_items (
            *
          ),
          order_events (
            *
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        return
      }

      setOrder(data as unknown as OrderDetail)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId, fetchOrder])

  if (authLoading || loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Orden no encontrada</h1>
        <p className="text-muted-foreground">La orden solicitada no existe o no tienes permisos para verla.</p>
        <Link href="/admin/ordenes">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a órdenes
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/ordenes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Orden #{order.id.slice(-8)}</h1>
            <p className="text-muted-foreground">
              Creada el {new Date(order.created_at || '').toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchOrder}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumen de la orden */}
          {/* Resumen de la orden */}
          <Card>
            <CardHeader>
              <CardTitle>Orden #{order.id.slice(-8)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className="font-medium">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método de pago:</span>
                  <span className="font-medium">{order.payment_method}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de envío */}
          <OrderShippingManager
            order={{
              id: order.id,
              status: order.status ?? 'pending',
              tracking_number: order.tracking_number ?? undefined,
            }}
            onUpdate={() => {
              // Recargar datos después de actualizar envío
              router.refresh()
            }}
          />

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Talle: {item.variant_size} | Color: {item.variant_color}
                      </p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Cantidad: {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} c/u
                      </p>
                      <p className="font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Timeline de eventos */}
          <OrderEventTimeline 
            events={order.order_events.map(event => ({
              id: event.id,
              type: event.event_type,
              description: `Evento: ${event.event_type}`,
              metadata: event.metadata,
              created_at: event.created_at ?? new Date().toISOString()
            }))}
          />
        </div>
      </div>
    </div>
  )
}
