import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header con toggle de tema */}
      <header className="flex justify-between items-center p-6 border-b">
        <h1 className="text-2xl font-serif font-bold text-primary">Sakú Lencería</h1>
        <ThemeToggle />
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif mb-8 text-center">
            Tokens de Diseño - Sakú Lencería
          </h2>
          
          {/* Paleta de colores */}
          <section className="mb-12">
            <h3 className="text-2xl font-serif mb-6">Paleta de Colores</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-full h-24 bg-[#d8ceb5] rounded-lg mb-2 border"></div>
                <p className="font-medium">Sakú Base</p>
                <p className="text-sm text-muted-foreground">#d8ceb5</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 bg-white border rounded-lg mb-2"></div>
                <p className="font-medium">Sakú White</p>
                <p className="text-sm text-muted-foreground">#ffffff</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 bg-black rounded-lg mb-2"></div>
                <p className="font-medium">Sakú Black</p>
                <p className="text-sm text-muted-foreground">#000000</p>
              </div>
            </div>
          </section>

          {/* Tipografías */}
          <section className="mb-12">
            <h3 className="text-2xl font-serif mb-6">Tipografías</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-2">Marcellus (Headings)</h4>
                <p className="font-serif text-3xl">Sakú Lencería</p>
                <p className="font-serif text-xl">Elegancia y Comodidad</p>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-2">Inter (Body)</h4>
                <p className="text-base">
                  Lencería íntima de calidad premium para la mujer moderna. 
                  Diseños únicos que combinan elegancia, comodidad y sensualidad.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Texto secundario en Inter con diferentes pesos y tamaños.
                </p>
              </div>
            </div>
          </section>

          {/* Componentes de ejemplo */}
          <section className="mb-12">
            <h3 className="text-2xl font-serif mb-6">Componentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                  Botón Primario
                </button>
                <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                  Botón Secundario
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-card text-card-foreground p-4 rounded-lg border">
                  <h4 className="font-serif text-lg mb-2">Card de Producto</h4>
                  <p className="text-sm text-muted-foreground">
                    Ejemplo de tarjeta con los colores del tema actual.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Instrucciones */}
          <section className="text-center">
            <p className="text-muted-foreground">
              Usa el botón en la esquina superior derecha para cambiar entre tema claro y oscuro.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
