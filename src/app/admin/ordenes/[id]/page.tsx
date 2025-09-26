'use client'

import { useState, useEffect, useCallback } from 'react'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/ui/product-image'
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
import { OrderShippingManager } from '@/components/admin/order-shipping-manager'
import { OrderSummary } from '@/components/admin/order-summary'

interface OrderDetail {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  discount_amount: number
  tax_amount: number
  created_at: string
  updated_at: string
  shipping_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  tracking_code: string | null
  tracking_number: string | null
  tracking_url: string | null
  shipping_method: string | null
  payment_method: string
  payment_status: string
  payment_id: string | null
  user_id: string
  notes: string | null
  profiles: {
    email: string
    full_name: string | null
    phone: string | null
  } | null
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product_variants: {
      size: string
      color: string
      sku: string
      products: {
        name: string
        image_url: string | null
      }
    }
  }>
  order_events: Array<{
    id: string
    type: string
    description: string | null
    metadata: Record<string, unknown> | null
    created_at: string
  }>
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading: authLoading } = useAuth()
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
            full_name,
            phone
          ),
          order_items (
            id,
            quantity,
            price,
            product_variants (
              size,
              color,
              sku,
              products (
                name,
                image_url
              )
            )
          ),
          order_events (
            id,
            event_type,
            event_data,
            created_at
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        return
      }

      setOrder(data as OrderDetail)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (user && !authLoading && orderId) {
      fetchOrder()
    }
  }, [user, authLoading, orderId, fetchOrder])

  // No se necesitan funciones adicionales ya que se han movido a los componentes

  if (authLoading || loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Orden no encontrada</h1>
        <p className="text-gray-600">La orden que buscas no existe.</p>
        <Link href="/admin/ordenes">
          <Button className="mt-4">Volver a órdenes</Button>
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
            <h1 className="text-3xl font-bold">Orden #{order.order_number}</h1>
            <p className="text-gray-600">
              Creada el {new Date(order.created_at).toLocaleDateString('es-AR')}
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
          <OrderSummary 
            order={{
              id: order.id,
              order_number: order.order_number,
              status: order.status,
              payment_status: order.payment_status,
              payment_method: order.payment_method,
              payment_id: order.payment_id,
              created_at: order.created_at,
              updated_at: order.updated_at,
              subtotal: order.subtotal,
              discount_amount: order.discount_amount,
              shipping_amount: order.shipping_cost,
              tax_amount: order.tax_amount,
              total_amount: order.total,
              user_id: order.user_id,
              profiles: order.profiles
            }}
            onUpdate={fetchOrder}
          />

          {/* Información de envío */}
          <OrderShippingManager 
            order={{
              id: order.id,
              order_number: order.order_number,
              status: order.status,
              tracking_number: order.tracking_number,
              tracking_url: order.tracking_url,
              shipping_method: order.shipping_method,
              shipping_address: order.shipping_address,
              user_id: order.user_id
            }}
            onUpdate={fetchOrder}
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
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product_variants.products.image_url ? (
                        <ProductImage
                          src={item.product_variants.products.image_url}
                          alt={item.product_variants.products.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_variants.products.name}</h4>
                      <p className="text-sm text-gray-600">
                        Talle {item.product_variants.size} • {item.product_variants.color}
                      </p>
                      <p className="text-sm text-gray-600">SKU: {item.product_variants.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Cantidad: {item.quantity}</p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} c/u
                      </p>
                      <p className="font-medium">
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
          {/* Historial de eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderEventTimeline events={order.order_events} />
            </CardContent>
          </Card>
          
          {/* Notas internas */}
          <Card>
            <CardHeader>
              <CardTitle>Notas internas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {order.notes || 'No hay notas para esta orden.'}
              </p>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Agregar nota
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}