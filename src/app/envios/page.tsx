import type { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, MapPin, Clock, Package, Calculator, Phone } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Envíos | Sakú Lencería',
  description: 'Información sobre envíos de Sakú Lencería. Conoce nuestras opciones de envío, tiempos de entrega y costos.',
}

export default function EnviosPage() {
  return (
    <div className="min-h-screen py-safe-section">
      <div className="container mx-auto px-safe-x max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Información de Envíos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conoce nuestras opciones de envío y tiempos de entrega para que recibas tu pedido de la mejor manera.
          </p>
        </div>

        {/* Shipping Options */}
        <div className="grid gap-8 mb-12">
          {/* Envío Nacional */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Envío Nacional</h2>
              <Badge variant="secondary">Correo Argentino</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Características</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Envío a todo el país
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    3-7 días hábiles
                  </li>
                  <li className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Tarifa fija nacional
                  </li>
                </ul>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">$2.500</div>
                  <div className="text-sm text-muted-foreground">Costo fijo a todo el país</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Envío Córdoba */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Envío en Córdoba Capital</h2>
              <Badge variant="default">Cadete</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Características</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Solo Córdoba Capital
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    24-48 horas
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Coordinación telefónica
                  </li>
                </ul>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">$1.500</div>
                  <div className="text-sm text-muted-foreground">Entrega rápida en Córdoba</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Shipping Process */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Proceso de Envío</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Confirmación</h3>
              <p className="text-sm text-muted-foreground">
                Confirmamos tu pedido y procesamos el pago
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Preparación</h3>
              <p className="text-sm text-muted-foreground">
                Preparamos tu pedido con cuidado especial
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Envío</h3>
              <p className="text-sm text-muted-foreground">
                Despachamos tu pedido y te enviamos el tracking
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Entrega</h3>
              <p className="text-sm text-muted-foreground">
                Recibís tu pedido en la dirección indicada
              </p>
            </div>
          </div>
        </Card>

        {/* Important Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">📦 Preparación de Pedidos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Los pedidos se procesan de lunes a viernes</li>
              <li>• Horario de preparación: 9:00 a 17:00 hs</li>
              <li>• Pedidos después de las 15:00 hs se procesan al día siguiente</li>
              <li>• Embalaje discreto y seguro</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">📍 Seguimiento</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Número de tracking por email</li>
              <li>• Seguimiento en tiempo real</li>
              <li>• Notificaciones de estado</li>
              <li>• Soporte para consultas</li>
            </ul>
          </Card>
        </div>

        {/* Contact for Shipping */}
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">¿Preguntas sobre tu envío?</h2>
          <p className="text-muted-foreground mb-6">
            Contactanos para consultas específicas sobre envíos o seguimiento de pedidos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contacto" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contactar Soporte
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/faq" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Ver FAQ
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}