import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ruler, Info, Heart, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Guía de Talles | Sakú Lencería",
  description:
    "Encuentra tu talla perfecta con nuestra guía completa de talles para brasieres y conjuntos de lencería.",
};

export default function GuiaTallesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">
            Guía de Talles
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">
            Encuentra tu Talla Perfecta
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Una guía completa para ayudarte a elegir la talla correcta y
            sentirte cómoda y segura.
          </p>
        </div>

        {/* Important Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Cada marca puede tener variaciones en
            sus talles. Si tienes dudas, no dudes en contactarnos para
            asesoramiento personalizado.
          </AlertDescription>
        </Alert>

        {/* How to Measure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ruler className="h-5 w-5" />
              <span>Cómo Tomar tus Medidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Contorno de Busto (Banda)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mide alrededor de tu torso, justo debajo del busto,
                  manteniendo la cinta métrica paralela al suelo y ajustada pero
                  no apretada.
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium">Consejos:</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Usa un brasier sin relleno</li>
                    <li>• Mantén los brazos relajados</li>
                    <li>• Toma la medida al exhalar</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contorno de Copa</h3>
                <p className="text-sm text-muted-foreground">
                  Mide alrededor de la parte más prominente de tu busto,
                  manteniendo la cinta métrica paralela al suelo.
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium">Consejos:</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• No comprimas el busto</li>
                    <li>• Mantén la postura erguida</li>
                    <li>• Pide ayuda si es necesario</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bra Size Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tabla de Talles - Brasieres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Talla</th>
                    <th className="text-left p-3 font-semibold">
                      Contorno Banda (cm)
                    </th>
                    <th className="text-left p-3 font-semibold">Copa A (cm)</th>
                    <th className="text-left p-3 font-semibold">Copa B (cm)</th>
                    <th className="text-left p-3 font-semibold">Copa C (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">85</td>
                    <td className="p-3">68-72</td>
                    <td className="p-3">82-84</td>
                    <td className="p-3">84-86</td>
                    <td className="p-3">86-88</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">90</td>
                    <td className="p-3">73-77</td>
                    <td className="p-3">87-89</td>
                    <td className="p-3">89-91</td>
                    <td className="p-3">91-93</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">95</td>
                    <td className="p-3">78-82</td>
                    <td className="p-3">92-94</td>
                    <td className="p-3">94-96</td>
                    <td className="p-3">96-98</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">100</td>
                    <td className="p-3">83-87</td>
                    <td className="p-3">97-99</td>
                    <td className="p-3">99-101</td>
                    <td className="p-3">101-103</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Si tu medida está entre dos talles, te
                recomendamos elegir el talle mayor para mayor comodidad.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Panty Size Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tabla de Talles - Bombachas y Conjuntos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Talla</th>
                    <th className="text-left p-3 font-semibold">
                      Contorno Cadera (cm)
                    </th>
                    <th className="text-left p-3 font-semibold">
                      Contorno Cintura (cm)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">S</td>
                    <td className="p-3">88-92</td>
                    <td className="p-3">68-72</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">M</td>
                    <td className="p-3">93-97</td>
                    <td className="p-3">73-77</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">L</td>
                    <td className="p-3">98-102</td>
                    <td className="p-3">78-82</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">XL</td>
                    <td className="p-3">103-107</td>
                    <td className="p-3">83-87</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Fit Tips */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Señales de un Buen Ajuste</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>La banda se mantiene horizontal y no se sube</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>
                    Las copas cubren completamente el busto sin desbordarse
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Los tirantes no se caen ni marcan los hombros</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Te sientes cómoda y segura durante todo el día</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Señales de Mal Ajuste</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>La banda se sube por la espalda</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Las copas arrugan o el busto se desborda</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Los tirantes se clavan o se caen constantemente</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Sientes incomodidad o marcas en la piel</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Care Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Consejos de Cuidado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🧺</span>
                </div>
                <h4 className="font-medium">Lavado</h4>
                <p className="text-sm text-muted-foreground">
                  Lava a mano con agua fría y jabón neutro para mantener la
                  forma y elasticidad.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🌬️</span>
                </div>
                <h4 className="font-medium">Secado</h4>
                <p className="text-sm text-muted-foreground">
                  Seca al aire libre, evita la exposición directa al sol y nunca
                  uses secadora.
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">👗</span>
                </div>
                <h4 className="font-medium">Almacenamiento</h4>
                <p className="text-sm text-muted-foreground">
                  Guarda los brasieres sin doblar las copas para mantener su
                  forma original.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-6 bg-primary/5 rounded-2xl p-8">
          <MessageCircle className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">
            ¿Necesitas Ayuda Personalizada?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nuestro equipo de expertas está aquí para ayudarte a encontrar la
            talla perfecta. Contáctanos para asesoramiento personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contacto">Contactar Asesora</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/productos">Ver Productos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
