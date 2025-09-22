import { Clock, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago pendiente
          </h1>
          <p className="text-gray-600">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Estado de tu pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">
                Pago en proceso
              </h3>
              <p className="text-sm text-yellow-700">
                Estamos esperando la confirmación de tu pago. Esto puede tomar algunos minutos 
                dependiendo del método de pago utilizado.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">¿Qué sigue?</h4>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h5 className="font-medium">Confirmación automática</h5>
                  <p className="text-sm text-gray-600">
                    Una vez confirmado el pago, recibirás un email de confirmación
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h5 className="font-medium">Preparación del pedido</h5>
                  <p className="text-sm text-gray-600">
                    Comenzaremos a preparar tu pedido inmediatamente
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">
            Métodos de pago que pueden demorar
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Transferencias bancarias</li>
            <li>• Pagos en efectivo (Rapipago, Pago Fácil)</li>
            <li>• Algunos bancos pueden requerir verificación adicional</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/productos">
              Seguir comprando
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="flex-1">
            <Link href="/cuenta/pedidos">
              Ver estado del pedido
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}