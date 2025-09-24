import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, Smartphone, Building, Shield, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Métodos de Pago | Sakú Lencería',
  description: 'Métodos de pago disponibles en Sakú Lencería. Paga con tarjeta de crédito, débito, transferencia bancaria y más opciones seguras.',
}

export default function MetodosPagoPage() {
  return (
    <div className="min-h-screen py-safe-section">
      <div className="container mx-auto px-safe-x max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Métodos de Pago
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elegí la forma de pago que más te convenga. Todas nuestras transacciones son 100% seguras.
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 px-4 py-2 rounded-full">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Pagos 100% Seguros con Mercado Pago</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid gap-8 mb-12">
          {/* Credit Cards */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Tarjetas de Crédito</h2>
              <Badge variant="default">Más Popular</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Tarjetas Aceptadas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                    <span className="text-sm">Visa</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                    <span className="text-sm">Mastercard</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>
                    <span className="text-sm">American Express</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-5 bg-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">NAR</div>
                    <span className="text-sm">Naranja</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Cuotas Disponibles</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    1 pago sin interés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    3 cuotas sin interés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    6 cuotas sin interés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Hasta 12 cuotas con interés
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Debit Cards */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Tarjetas de Débito</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Débito Inmediato</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Visa Débito
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Mastercard Débito
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Maestro
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">Acreditación Inmediata</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  El pago se procesa al instante y tu pedido se confirma inmediatamente.
                </p>
              </div>
            </div>
          </Card>

          {/* Digital Wallets */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Billeteras Digitales</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">MP</span>
                </div>
                <h3 className="font-semibold">Mercado Pago</h3>
                <p className="text-xs text-muted-foreground mt-1">Dinero en cuenta</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">$</span>
                </div>
                <h3 className="font-semibold">Cuenta DNI</h3>
                <p className="text-xs text-muted-foreground mt-1">Banco Provincia</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <h3 className="font-semibold">Rapipago</h3>
                <p className="text-xs text-muted-foreground mt-1">Pago en efectivo</p>
              </div>
            </div>
          </Card>

          {/* Bank Transfer */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Transferencia Bancaria</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Cómo Pagar</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <span>Selecciona &ldquo;Transferencia&rdquo; en el checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <span>Recibirás los datos bancarios por email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <span>Realiza la transferencia desde tu banco</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <span>Envía el comprobante por WhatsApp</span>
                  </li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-700 dark:text-yellow-300">Tiempo de Acreditación</span>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  24-48 horas hábiles para confirmar el pago y procesar tu pedido.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Information */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-semibold">Seguridad Garantizada</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Encriptación SSL</h3>
              <p className="text-sm text-muted-foreground">
                Todos los datos se transmiten de forma segura y encriptada
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">PCI Compliance</h3>
              <p className="text-sm text-muted-foreground">
                Cumplimos con los estándares de seguridad internacionales
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Mercado Pago</h3>
              <p className="text-sm text-muted-foreground">
                Procesamos pagos a través de la plataforma más confiable
              </p>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">¿Problemas con tu pago?</h2>
          <p className="text-muted-foreground mb-6">
            Si tenés algún inconveniente con tu pago, contactanos y te ayudamos a resolverlo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contacto" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Contactar Soporte
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/faq" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Ver FAQ de Pagos
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}