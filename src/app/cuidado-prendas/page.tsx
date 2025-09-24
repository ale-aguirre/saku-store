import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplets,
  Wind,
  Sun,
  Shirt,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cuidado de Prendas | Sakú Lencería",
  description:
    "Aprende cómo cuidar tu lencería para mantenerla hermosa y duradera. Guía completa de lavado, secado y almacenamiento.",
};

export default function CuidadoPrendasPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">
            Cuidado de Prendas
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">
            Cuida tu Lencería con Amor
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mantén tus prendas íntimas hermosas y duraderas con nuestros
            consejos de cuidado experto.
          </p>
        </div>

        {/* Important Notice */}
        <Alert>
          <Heart className="h-4 w-4" />
          <AlertDescription>
            <strong>Recuerda:</strong> Un cuidado adecuado puede extender la
            vida útil de tu lencería hasta 3 veces más, manteniendo su forma,
            color y elasticidad.
          </AlertDescription>
        </Alert>

        {/* Care Tabs */}
        <Tabs defaultValue="washing" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="washing">Lavado</TabsTrigger>
            <TabsTrigger value="drying">Secado</TabsTrigger>
            <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          </TabsList>

          <TabsContent value="washing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5" />
                  <span>Guía de Lavado</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Recomendado</span>
                    </h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Lava a mano con agua fría (máx. 30°C)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>
                          Usa jabón neutro o detergente para prendas delicadas
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Remoja máximo 15 minutos</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Enjuaga con abundante agua fría</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>
                          Presiona suavemente para eliminar el exceso de agua
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600 flex items-center space-x-2">
                      <XCircle className="h-5 w-5" />
                      <span>Evita</span>
                    </h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>Agua caliente (daña las fibras elásticas)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>
                          Blanqueadores o productos químicos agresivos
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>Frotar o retorcer las prendas</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>Lavadora (excepto en bolsa para delicados)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>Suavizantes (pueden dañar el encaje)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Lavado en Máquina (Solo si es necesario)
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Usa una bolsa para prendas delicadas</li>
                    <li>• Programa ciclo delicado con agua fría</li>
                    <li>• Máximo 600 rpm de centrifugado</li>
                    <li>• Separa por colores</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drying" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wind className="h-5 w-5" />
                  <span>Secado Correcto</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Wind className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-600">
                      Al Aire Libre
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      La mejor opción. Cuelga en un lugar ventilado, evitando la
                      luz solar directa.
                    </p>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                      <Sun className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-yellow-600">Sombra</h3>
                    <p className="text-sm text-muted-foreground">
                      Siempre seca en la sombra para evitar decoloración y daño
                      por UV.
                    </p>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-red-600">
                      Nunca Secadora
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      El calor de la secadora daña irreversiblemente las fibras
                      elásticas.
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip importante:</strong> Para brasieres con copa,
                    cuelga por la banda central, nunca por los tirantes para
                    mantener la forma.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">
                    Tiempo de Secado Estimado
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Brasieres:</span> 4-6 horas
                    </div>
                    <div>
                      <span className="font-medium">Bombachas:</span> 2-3 horas
                    </div>
                    <div>
                      <span className="font-medium">Conjuntos:</span> 4-8 horas
                    </div>
                    <div>
                      <span className="font-medium">Encajes:</span> 3-5 horas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shirt className="h-5 w-5" />
                  <span>Almacenamiento Ideal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Brasieres</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Nunca dobles las copas una sobre otra</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Guarda las copas en su forma natural</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Usa organizadores de cajón si es posible</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Abrocha los ganchos para evitar enganches</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Bombachas y Conjuntos
                    </h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Dobla suavemente sin presionar</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Separa por colores y materiales</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Evita apilar demasiadas prendas</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Usa bolsas de tela para prendas delicadas</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Consejos Pro</span>
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Ambiente:</span> Lugar seco
                      y ventilado
                    </div>
                    <div>
                      <span className="font-medium">Temperatura:</span>{" "}
                      Ambiente, evita calor
                    </div>
                    <div>
                      <span className="font-medium">Humedad:</span> Baja, usa
                      deshumidificador si es necesario
                    </div>
                    <div>
                      <span className="font-medium">Rotación:</span> Usa
                      diferentes prendas para que descansen
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Mantenimiento y Vida Útil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-green-600">
                        Uso Diario
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Para prendas de uso frecuente
                      </p>
                      <ul className="text-sm space-y-2">
                        <li>• Lava después de cada uso</li>
                        <li>• Rota entre 3-4 brasieres</li>
                        <li>• Revisa ganchos y costuras</li>
                        <li>• Vida útil: 6-12 meses</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-blue-600">
                        Uso Ocasional
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Para prendas especiales
                      </p>
                      <ul className="text-sm space-y-2">
                        <li>• Lava después de 2-3 usos</li>
                        <li>• Almacena con cuidado especial</li>
                        <li>• Inspecciona antes de usar</li>
                        <li>• Vida útil: 1-3 años</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-purple-600">
                        Prendas Delicadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Encajes y sedas
                      </p>
                      <ul className="text-sm space-y-2">
                        <li>• Lavado extra cuidadoso</li>
                        <li>• Almacenamiento en bolsas</li>
                        <li>• Revisión frecuente</li>
                        <li>• Vida útil: 2-5 años</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Señales de reemplazo:</strong> Pérdida de
                    elasticidad, decoloración, roturas en costuras, ganchos
                    dañados o copas deformadas.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Calendario de Cuidado</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Semanal:</span> Revisión
                      general de prendas en uso
                    </div>
                    <div>
                      <span className="font-medium">Mensual:</span> Inspección
                      de ganchos y costuras
                    </div>
                    <div>
                      <span className="font-medium">Trimestral:</span>{" "}
                      Evaluación de elasticidad y forma
                    </div>
                    <div>
                      <span className="font-medium">Anual:</span> Renovación de
                      prendas básicas
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Material Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Guía por Materiales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Algodón</h4>
                <p className="text-sm text-muted-foreground">
                  Resistente, lava con agua tibia. Puede encogerse ligeramente.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Encaje</h4>
                <p className="text-sm text-muted-foreground">
                  Muy delicado, solo agua fría y jabón neutro. Nunca retorcer.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Microfibra</h4>
                <p className="text-sm text-muted-foreground">
                  Secado rápido, evita suavizantes que reducen la
                  transpirabilidad.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Seda</h4>
                <p className="text-sm text-muted-foreground">
                  Lavado a mano obligatorio, agua fría, secar en sombra.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-6 bg-primary/5 rounded-2xl p-8">
          <Heart className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">
            Cuida tu Inversión
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Una lencería bien cuidada no solo dura más, sino que también te hace
            sentir mejor. Invierte tiempo en su cuidado y disfruta de prendas
            hermosas por más tiempo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/productos">Explorar Productos</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/contacto">Consultar Dudas</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
