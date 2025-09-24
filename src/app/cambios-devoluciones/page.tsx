import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Package, RefreshCw, AlertTriangle, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cambios y Devoluciones | Sakú Lencería',
  description: 'Política de cambios y devoluciones de Sakú Lencería. Conoce nuestros términos y condiciones para cambios de productos.',
}

export default function CambiosDevolucionesPage() {
  return (
    <div className="min-h-screen py-safe-section">
      <div className="container mx-auto px-safe-x max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Cambios y Devoluciones
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tu satisfacción es nuestra prioridad. Conoce nuestra política de cambios y devoluciones.
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Por razones de higiene y salud, la lencería no puede ser devuelta una vez retirada de la tienda o recibida en domicilio. Solo se aceptan cambios por defectos de fabricación.
          </AlertDescription>
        </Alert>

        {/* Policy Sections */}
        <div className="grid gap-8 mb-12">
          {/* Cambios por Defectos */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Cambios por Defectos de Fabricación</h2>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Si tu producto presenta defectos de fabricación, puedes solicitar un cambio siguiendo estos pasos:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <span>Contacta nuestro servicio al cliente dentro de las 48 horas posteriores a la recepción</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <span>Envía fotos del defecto y tu número de pedido</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <span>Nuestro equipo evaluará el caso y te contactará con la solución</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <span>Si procede, coordinaremos el retiro y envío del producto de reemplazo</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Condiciones */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Condiciones para Cambios</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">✅ Aceptamos cambios por:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Defectos de fabricación</li>
                    <li>• Costuras defectuosas</li>
                    <li>• Materiales dañados</li>
                    <li>• Producto incorrecto enviado</li>
                    <li>• Daños durante el envío</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">❌ No aceptamos cambios por:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Cambio de opinión</li>
                    <li>• Talla incorrecta elegida</li>
                    <li>• Color diferente al esperado</li>
                    <li>• Uso normal del producto</li>
                    <li>• Productos en oferta o liquidación</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Tiempos */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Tiempos y Proceso</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">48h</div>
                <div className="text-sm font-medium">Tiempo para reportar</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Desde la recepción del producto
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">24-48h</div>
                <div className="text-sm font-medium">Evaluación</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tiempo de respuesta del equipo
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">3-5 días</div>
                <div className="text-sm font-medium">Resolución</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cambio o reembolso procesado
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">¿Necesitas ayuda?</h2>
          <p className="text-muted-foreground mb-6">
            Nuestro equipo de atención al cliente está aquí para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contacto" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contactar por Email
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://wa.me/5493515123456" target="_blank" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}