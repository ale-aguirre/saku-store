import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CopyBlock } from '@/types/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Sakú Lencería',
  description: 'Términos y condiciones de uso de Sakú Lencería',
}

async function getTermsContent() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('copy_blocks')
      .select('content, title')
      .eq('key', 'terms_and_conditions')
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return {
        title: 'Términos y Condiciones',
        content: `
          <h2>1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso.</p>
          
          <h2>2. Uso del Sitio</h2>
          <p>Este sitio web está destinado para uso personal y no comercial. No puede utilizar este sitio para ningún propósito ilegal o no autorizado.</p>
          
          <h2>3. Productos y Servicios</h2>
          <p>Todos los productos están sujetos a disponibilidad. Nos reservamos el derecho de limitar las cantidades de cualquier producto o servicio que ofrecemos.</p>
          
          <h2>4. Precios y Pagos</h2>
          <p>Los precios están sujetos a cambios sin previo aviso. Todos los pagos deben realizarse en el momento de la compra.</p>
          
          <h2>5. Envíos y Devoluciones</h2>
          <p>Por razones de higiene, no se aceptan devoluciones de productos de lencería. Todos los envíos están sujetos a nuestras políticas de envío.</p>
          
          <h2>6. Privacidad</h2>
          <p>Su privacidad es importante para nosotros. Consulte nuestra Política de Privacidad para obtener información sobre cómo recopilamos y utilizamos su información.</p>
          
          <h2>7. Modificaciones</h2>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
          
          <h2>8. Contacto</h2>
          <p>Si tiene preguntas sobre estos términos, puede contactarnos a través de nuestros canales de atención al cliente.</p>
        `
      }
    }

    return {
      title: (data as CopyBlock).title || 'Términos y Condiciones',
      content: (data as CopyBlock).content
    }
  } catch (error) {
    console.error('Error fetching terms content:', error)
    return null
  }
}

export default async function TermsPage() {
  const termsData = await getTermsContent()

  if (!termsData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 max-w-4xl mx-auto">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8 font-marcellus">
            {termsData.title}
          </h1>
          
          <div 
            className="text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: termsData.content }}
          />
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}