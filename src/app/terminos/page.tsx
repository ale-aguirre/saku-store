'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_CONTENT = {
  title: 'Términos y Condiciones',
  content: `
    <h2>1. Aceptación de los Términos</h2>
    <p>Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso.</p>
    
    <h2>2. Uso del Sitio Web</h2>
    <p>Este sitio web está destinado para uso personal y no comercial. Usted se compromete a:</p>
    <ul>
      <li>Utilizar el sitio de manera legal y apropiada</li>
      <li>No interferir con el funcionamiento del sitio</li>
      <li>No intentar acceder a áreas restringidas</li>
      <li>Proporcionar información veraz y actualizada</li>
    </ul>
    
    <h2>3. Productos y Servicios</h2>
    <p>Nos esforzamos por mostrar los colores y detalles de nuestros productos con la mayor precisión posible. Sin embargo, no podemos garantizar que la visualización en su dispositivo sea completamente exacta.</p>
    
    <h2>4. Precios y Pagos</h2>
    <p>Todos los precios están expresados en pesos argentinos e incluyen IVA. Nos reservamos el derecho de modificar los precios sin previo aviso.</p>
    
    <h2>5. Envíos y Entregas</h2>
    <p>Los tiempos de entrega son estimativos y pueden variar según la ubicación y disponibilidad del producto.</p>
    
    <h2>6. Política de Devoluciones</h2>
    <p>Por razones de higiene y salud, no aceptamos devoluciones de productos de lencería íntima. Sin embargo, si el producto presenta defectos de fabricación, puede contactarnos para una solución.</p>
    
    <h2>7. Limitación de Responsabilidad</h2>
    <p>Sakú Lencería no será responsable por daños indirectos, incidentales o consecuentes que puedan surgir del uso de este sitio web o nuestros productos.</p>
    
    <h2>8. Modificaciones</h2>
    <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
    
    <h2>9. Contacto</h2>
    <p>Si tiene preguntas sobre estos términos y condiciones, puede contactarnos a través de nuestros canales de atención al cliente.</p>
  `
}

export default function TermsPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('copy_blocks')
          .select('content, title')
          .eq('key', 'terms_conditions')
          .eq('is_active', true)
          .single()

        if (data && !error) {
          setContent({
            title: (data as any).title || DEFAULT_CONTENT.title,
            content: (data as any).content
          })
        }
      } catch (error) {
        console.error('Error fetching terms content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="py-8 max-w-4xl mx-auto">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 max-w-4xl mx-auto">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8 font-marcellus">
            {content.title}
          </h1>
          
          <div 
            className="text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
          
        </div>
      </div>
    </div>
  )
}