import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nosotros | Sakú Lencería',
  description: 'Conoce la historia de Sakú Lencería, nuestra misión y valores.',
}

export default function NosotrosPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Sobre Nosotros</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre la historia detrás de Sakú Lencería y nuestra pasión por la elegancia y comodidad.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Nuestra Historia</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sakú Lencería nació de la pasión por crear piezas íntimas que combinen elegancia, 
              comodidad y calidad. Desde nuestros inicios, nos hemos dedicado a diseñar lencería 
              que haga sentir especial a cada mujer.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Cada pieza es cuidadosamente seleccionada pensando en la diversidad de cuerpos y 
              gustos, ofreciendo opciones que van desde lo clásico hasta lo más atrevido, 
              siempre manteniendo los más altos estándares de calidad.
            </p>
          </div>
          <div className="bg-muted rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">👗</div>
            <h3 className="text-lg font-semibold mb-2">Calidad Premium</h3>
            <p className="text-sm text-muted-foreground">
              Materiales seleccionados y acabados de primera calidad
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground text-center">Nuestros Valores</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold">Elegancia</h3>
              <p className="text-sm text-muted-foreground">
                Diseños sofisticados que realzan la belleza natural de cada mujer.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🤗</span>
              </div>
              <h3 className="font-semibold">Comodidad</h3>
              <p className="text-sm text-muted-foreground">
                Piezas diseñadas para el uso diario sin sacrificar el estilo.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="font-semibold">Calidad</h3>
              <p className="text-sm text-muted-foreground">
                Materiales premium y confección artesanal en cada pieza.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-muted rounded-lg p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Nuestra Misión</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Empoderar a cada mujer a través de lencería que la haga sentir segura, 
            cómoda y hermosa. Creemos que la ropa interior es la base de la confianza 
            y trabajamos cada día para ofrecer piezas que celebren la feminidad en 
            todas sus formas.
          </p>
        </div>
      </div>
    </div>
  )
}