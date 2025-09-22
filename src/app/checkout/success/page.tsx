import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago exitoso!
          </h1>
          <p className="text-gray-600">
            Tu pedido ha sido confirmado y está siendo procesado
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Próximos pasos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#d8ceb5] rounded-full flex items-center justify-center text-sm font-medium text-black">
                1
              </div>
              <div>
                <h3 className="font-medium">Confirmación por email</h3>
                <p className="text-sm text-gray-600">
                  Recibirás un email con los detalles de tu pedido en los próximos minutos
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#d8ceb5] rounded-full flex items-center justify-center text-sm font-medium text-black">
                2
              </div>
              <div>
                <h3 className="font-medium">Preparación del pedido</h3>
                <p className="text-sm text-gray-600">
                  Preparamos tu pedido con cuidado en 1-2 días hábiles
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#d8ceb5] rounded-full flex items-center justify-center text-sm font-medium text-black">
                3
              </div>
              <div>
                <h3 className="font-medium">Envío</h3>
                <p className="text-sm text-gray-600">
                  Te notificaremos cuando tu pedido esté en camino con el código de seguimiento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-amber-800 mb-2">
            Importante - Política de higiene
          </h3>
          <p className="text-sm text-amber-700">
            Por razones de higiene, no se aceptan devoluciones de lencería. 
            Asegúrate de revisar la guía de talles antes de tu compra.
          </p>
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
              Ver mis pedidos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}