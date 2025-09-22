import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Error en el pago
          </h1>
          <p className="text-gray-600">
            No se pudo procesar tu pago. Tu pedido no ha sido confirmado.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>¿Qué puedes hacer?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Verifica que tu tarjeta tenga fondos suficientes
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Asegúrate de que los datos de la tarjeta sean correctos
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Intenta con otro método de pago
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Contacta a tu banco si el problema persiste
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-800 mb-2">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Si continúas teniendo problemas, no dudes en contactarnos. 
            Estamos aquí para ayudarte.
          </p>
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
            Contactar soporte
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90">
            <Link href="/checkout">
              <RefreshCw className="mr-2 w-4 h-4" />
              Intentar nuevamente
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="flex-1">
            <Link href="/productos">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Volver a productos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}