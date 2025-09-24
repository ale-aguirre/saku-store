import { Metadata } from "next";
import Link from "next/link";
// import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nosotros | Sakú Lencería",
  description:
    "Conoce la historia de Sakú Lencería, nuestra misión y valores. Lencería de calidad premium para mujeres que buscan comodidad y elegancia.",
};

export default function SobreNosotrosPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            Nuestra Historia
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Sobre Sakú Lencería
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Desde 2020, nos dedicamos a crear lencería que celebra la feminidad,
            combinando comodidad, calidad y elegancia en cada pieza.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Nuestra Misión
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              En Sakú Lencería creemos que cada mujer merece sentirse hermosa y
              cómoda en su propia piel. Por eso, diseñamos y seleccionamos
              cuidadosamente cada pieza de nuestra colección, priorizando la
              calidad de los materiales y la atención al detalle.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nuestro compromiso va más allá de la venta: queremos acompañarte
              en tu búsqueda de la lencería perfecta, ofreciéndote asesoramiento
              personalizado y un servicio excepcional.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Hecho con amor</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Calidad premium</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <Heart className="h-16 w-16 text-primary mx-auto" />
                <p className="text-lg font-medium text-foreground">
                  Diseñado para ti
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Cada pieza es seleccionada pensando en tu comodidad y
                  elegancia
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Nuestros Valores
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los principios que guían cada decisión que tomamos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Calidad</h3>
                <p className="text-muted-foreground text-sm">
                  Seleccionamos solo los mejores materiales y trabajamos con
                  proveedores que comparten nuestros estándares de excelencia.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Comodidad</h3>
                <p className="text-muted-foreground text-sm">
                  Creemos que la lencería debe ser cómoda para el uso diario,
                  sin sacrificar estilo ni elegancia.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Atención Personal</h3>
                <p className="text-muted-foreground text-sm">
                  Cada cliente es única, por eso ofrecemos asesoramiento
                  personalizado para encontrar la talla y estilo perfecto.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-muted/30 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">4+</div>
              <div className="text-sm text-muted-foreground">
                Años de experiencia
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">
                Clientas satisfechas
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">
                Productos únicos
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">4.8</div>
              <div className="text-sm text-muted-foreground">
                Calificación promedio
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Nuestro Equipo
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conoce a las personas apasionadas que hacen posible Sakú Lencería
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">S</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Sofia</h3>
                  <p className="text-sm text-muted-foreground">
                    Fundadora & Diseñadora
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Apasionada por la moda íntima y el diseño, Sofia fundó Sakú
                  con la visión de crear lencería que empodere a las mujeres.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">M</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">María</h3>
                  <p className="text-sm text-muted-foreground">
                    Asesora de Talles
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Con años de experiencia en lencería, María ayuda a nuestras
                  clientas a encontrar el ajuste perfecto.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">L</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Lucia</h3>
                  <p className="text-sm text-muted-foreground">
                    Atención al Cliente
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lucia se asegura de que cada cliente tenga una experiencia
                  excepcional desde el primer contacto.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 bg-primary/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-foreground">
            ¿Lista para encontrar tu lencería perfecta?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra colección y descubre piezas diseñadas especialmente
            para ti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ver Productos
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
