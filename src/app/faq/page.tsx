import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  CreditCard, 
  Truck, 
  RefreshCw, 
  Shield,
  MessageCircle,
  Clock,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | Sakú Lencería',
  description: 'Encuentra respuestas a las preguntas más comunes sobre productos, envíos, devoluciones y más en Sakú Lencería.',
}

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">
            Preguntas Frecuentes
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">
            ¿Cómo podemos ayudarte?
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Encuentra respuestas rápidas a las preguntas más comunes sobre nuestros productos y servicios.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <Package className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Productos</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Envíos</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Pagos</p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <RefreshCw className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Devoluciones</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {/* Products FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Productos y Talles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Cómo sé qué talla elegir?</h4>
                    <p className="text-sm text-muted-foreground">
                      Te recomendamos consultar nuestra <Link href="/guia-talles" className="text-primary hover:underline">Guía de Talles</Link> donde encontrarás instrucciones detalladas para tomar tus medidas correctamente. Si tienes dudas, nuestro equipo está disponible para asesorarte personalmente.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Qué materiales utilizan en sus productos?</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilizamos materiales de alta calidad como algodón orgánico, microfibra transpirable, encajes delicados y elásticos de larga duración. Cada producto especifica su composición en la descripción.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Tienen productos para talles grandes?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sí, nuestro rango de talles va desde 85 hasta 100 en brasieres, y desde S hasta XL en bombachas y conjuntos. Creemos que toda mujer merece sentirse hermosa y cómoda.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Cómo cuido mis prendas de lencería?</h4>
                    <p className="text-sm text-muted-foreground">
                      Consulta nuestra <Link href="/cuidado-prendas" className="text-primary hover:underline">Guía de Cuidado</Link> donde encontrarás instrucciones detalladas para lavar, secar y almacenar tu lencería correctamente para que dure más tiempo.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Shipping FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Envíos y Entregas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Cuánto cuesta el envío?</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Envío nacional:</strong> $2.500 a todo el país</p>
                      <p><strong>Córdoba Capital:</strong> $1.500 con nuestro cadete</p>
                      <p>Los envíos son gratuitos en compras superiores a $15.000</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Cuánto demora la entrega?</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Córdoba Capital:</strong> 24-48 horas hábiles</p>
                      <p><strong>Interior del país:</strong> 3-7 días hábiles</p>
                      <p><strong>CABA y GBA:</strong> 2-4 días hábiles</p>
                      <p>Los tiempos pueden variar durante temporadas altas o feriados.</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Puedo rastrear mi pedido?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sí, una vez que tu pedido sea despachado, recibirás un email con el código de seguimiento. Para envíos con Correo Argentino, podrás rastrear tu paquete en su sitio web oficial.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Hacen entregas en el mismo día?</h4>
                    <p className="text-sm text-muted-foreground">
                      En Córdoba Capital ofrecemos entrega express el mismo día para pedidos realizados antes de las 14:00 hs. Este servicio tiene un costo adicional de $800.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Payment FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Pagos y Facturación</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Qué métodos de pago aceptan?</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Tarjetas de crédito:</strong> Visa, Mastercard, American Express</p>
                      <p><strong>Tarjetas de débito:</strong> Visa Débito, Maestro</p>
                      <p><strong>Transferencia bancaria</strong></p>
                      <p><strong>Mercado Pago</strong> (todas las opciones disponibles)</p>
                      <p>Todos los pagos son procesados de forma segura a través de Mercado Pago.</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Puedo pagar en cuotas?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sí, aceptamos pagos en cuotas sin interés hasta 3 cuotas con tarjetas de crédito participantes. Para más cuotas, consulta las opciones disponibles en Mercado Pago al momento del checkout.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Emiten factura?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sí, emitimos factura A o B según corresponda. Puedes solicitar la facturación durante el proceso de compra proporcionando tus datos fiscales.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Es seguro comprar en su sitio?</h4>
                    <p className="text-sm text-muted-foreground">
                      Absolutamente. Utilizamos certificados SSL para proteger tus datos y procesamos todos los pagos a través de Mercado Pago, que cumple con los más altos estándares de seguridad PCI DSS.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Returns FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>Cambios y Devoluciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Puedo devolver un producto?</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p><strong>Importante:</strong> Por razones de higiene y salud, no aceptamos devoluciones de ropa interior una vez que el producto ha sido usado o probado.</p>
                      <p>Solo aceptamos devoluciones por defectos de fábrica o errores en el envío, siempre que el producto esté en su empaque original y sin usar.</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Puedo cambiar la talla?</h4>
                    <p className="text-sm text-muted-foreground">
                      Los cambios de talla solo son posibles si el producto no ha sido usado y conserva todas sus etiquetas originales. Debes contactarnos dentro de las 48 horas de recibido el producto. El costo del envío del cambio corre por cuenta del cliente.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Qué hago si recibo un producto defectuoso?</h4>
                    <p className="text-sm text-muted-foreground">
                      Si recibes un producto con defectos de fábrica, contáctanos inmediatamente a través de WhatsApp o email con fotos del defecto. Nos haremos cargo del cambio y los costos de envío.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Cuánto demora un reembolso?</h4>
                    <p className="text-sm text-muted-foreground">
                      Los reembolsos por defectos de fábrica o errores nuestros se procesan en 5-10 días hábiles una vez que recibimos el producto devuelto. El dinero se acredita al mismo medio de pago utilizado en la compra.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Account FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Cuenta y Privacidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Necesito crear una cuenta para comprar?</h4>
                    <p className="text-sm text-muted-foreground">
                      No es obligatorio, pero te recomendamos crear una cuenta para poder rastrear tus pedidos, guardar tus direcciones favoritas y recibir ofertas exclusivas.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Cómo protegen mis datos personales?</h4>
                    <p className="text-sm text-muted-foreground">
                      Cumplimos con la Ley de Protección de Datos Personales. Tus datos están encriptados y solo los utilizamos para procesar tus pedidos y mejorar tu experiencia de compra. Nunca compartimos información personal con terceros sin tu consentimiento.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Puedo modificar mis datos de cuenta?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sí, puedes modificar tus datos personales, direcciones y preferencias desde tu panel de usuario. Si tienes problemas, contáctanos y te ayudaremos.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">¿Cómo me doy de baja de los emails?</h4>
                    <p className="text-sm text-muted-foreground">
                      Puedes darte de baja de nuestros emails promocionales haciendo clic en el enlace &ldquo;Desuscribirse&rdquo; que aparece al final de cada email, o contactándonos directamente.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div className="text-center space-y-6 bg-primary/5 rounded-2xl p-8">
          <MessageCircle className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nuestro equipo está aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <MessageCircle className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-medium">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">+54 351 123-4567</p>
            </div>
            <div className="text-center space-y-2">
              <Clock className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-medium">Horarios</h3>
              <p className="text-sm text-muted-foreground">Lun-Vie 9-18hs</p>
            </div>
            <div className="text-center space-y-2">
              <MapPin className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-medium">Ubicación</h3>
              <p className="text-sm text-muted-foreground">Córdoba, Argentina</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contacto">Contactar Soporte</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/productos">Ver Productos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}