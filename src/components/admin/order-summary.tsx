'use client'

import { useState } from 'react'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  ShoppingBag
} from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface OrderSummaryProps {
  order: {
    id: string
    order_number: string
    status: string
    payment_status: string
    payment_method: string | null
    payment_id: string | null
    created_at: string
    updated_at: string
    subtotal: number
    discount_amount: number
    shipping_cost: number
    tax_amount: number
    total_amount: number
    user_id: string
    profiles?: {
      email: string
      full_name: string | null
      phone: string | null
    } | null
  }
  onUpdate: () => void
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Pagado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'processing', label: 'Procesando', icon: Package, color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Enviado', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Entregado', icon: ShoppingBag, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Reembolsado', icon: CreditCard, color: 'bg-gray-100 text-gray-800' }
]

export function OrderSummary({ order, onUpdate }: OrderSummaryProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  
  const getStatusConfig = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0]
  }
  
  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon
  
  const updateOrderStatus = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const supabase = createAdminClient()
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)

      if (error) throw error

      // Create order event
      await supabase
        .from('order_events')
        .insert({
          order_id: order.id,
          type: 'status_change',
          metadata: { 
            old_status: order.status,
            new_status: newStatus 
          }
        })

      onUpdate()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado de la orden')
    } finally {
      setIsUpdating(false)
    }
  }
  
  const cancelOrder = async () => {
    await updateOrderStatus('cancelled')
    setShowCancelDialog(false)
  }
  

  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Orden #{order.order_number}
            </div>
            <Badge className={statusConfig.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Fecha
              </p>
              <p>{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center">
                <CreditCard className="mr-1 h-4 w-4" />
                Método de pago
              </p>
              <p>{order.payment_method || 'No especificado'}</p>
            </div>
          </div>
          
          {/* Cliente */}
          {order.profiles && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium flex items-center mb-2">
                <User className="mr-1 h-4 w-4" />
                Cliente
              </h4>
              <div className="space-y-1 text-sm">
                <p>{order.profiles.full_name || 'Sin nombre'}</p>
                <p className="flex items-center">
                  <Mail className="mr-1 h-3 w-3" />
                  {order.profiles.email}
                </p>
                {order.profiles.phone && (
                  <p className="flex items-center">
                    <Phone className="mr-1 h-3 w-3" />
                    {order.profiles.phone}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <Separator />
          
          {/* Resumen financiero */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
            {order.tax_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Impuestos</span>
                <span>{formatPrice(order.tax_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Acciones */}
          <div className="space-y-3">
            <div>
              <p className="text-sm mb-2">Cambiar estado</p>
              <Select
                value={order.status}
                onValueChange={updateOrderStatus}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center">
                        <status.icon className="mr-2 h-4 w-4" />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              {order.status !== 'cancelled' && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Cancelar orden
                </Button>
              )}
              
              {order.status === 'pending' && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => updateOrderStatus('paid')}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Marcar como pagada
                </Button>
              )}
              
              {order.status === 'paid' && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => updateOrderStatus('processing')}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <Package className="mr-1 h-4 w-4" />
                  Iniciar procesamiento
                </Button>
              )}
              
              {order.status === 'shipped' && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => updateOrderStatus('delivered')}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <ShoppingBag className="mr-1 h-4 w-4" />
                  Marcar como entregada
                </Button>
              )}
            </div>
          </div>
          
          {/* Advertencia de estado */}
          {order.status === 'cancelled' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Orden cancelada</p>
                <p className="text-xs text-red-700">
                  Esta orden ha sido cancelada y no puede ser procesada.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmación para cancelar */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La orden #{order.order_number} será cancelada y no podrá ser procesada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={cancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, cancelar orden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}