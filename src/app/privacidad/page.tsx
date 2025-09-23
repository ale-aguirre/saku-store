'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_CONTENT = {
  title: 'Política de Privacidad',
  content: `
    <h2>1. Información que Recopilamos</h2>
    <p>Recopilamos información que usted nos proporciona directamente, como cuando crea una cuenta, realiza una compra o se comunica con nosotros.</p>
    
    <h2>2. Cómo Utilizamos su Información</h2>
    <p>Utilizamos la información recopilada para:</p>
    <ul>
      <li>Procesar y completar sus pedidos</li>
      <li>Comunicarnos con usted sobre su cuenta y pedidos</li>
      <li>Mejorar nuestros productos y servicios</li>
      <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
    </ul>
    
    <h2>3. Compartir Información</h2>
    <p>No vendemos, intercambiamos ni transferimos su información personal a terceros sin su consentimiento, excepto según se describe en esta política.</p>
    
    <h2>4. Cookies y Tecnologías Similares</h2>
    <p>Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web y para fines analíticos.</p>
    
    <h2>5. Seguridad de los Datos</h2>
    <p>Implementamos medidas de seguridad apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.</p>
    
    <h2>6. Sus Derechos</h2>
    <p>Usted tiene derecho a:</p>
    <ul>
      <li>Acceder a su información personal</li>
      <li>Corregir información inexacta</li>
      <li>Solicitar la eliminación de su información</li>
      <li>Oponerse al procesamiento de su información</li>
    </ul>
    
    <h2>7. Retención de Datos</h2>
    <p>Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política.</p>
    
    <h2>8. Cambios a esta Política</h2>
    <p>Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos.</p>
    
    <h2>9. Contacto</h2>
    <p>Si tiene preguntas sobre esta política de privacidad, puede contactarnos a través de nuestros canales de atención al cliente.</p>
  `
}

export default function PrivacyPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('copy_blocks')
          .select('content, title')
          .eq('key', 'privacy_policy')
          .eq('is_active', true)
          .single()

        if (data && !error) {
          setContent({
            title: (data as any).title || DEFAULT_CONTENT.title,
            content: (data as any).content
          })
        }
      } catch (error) {
        console.error('Error fetching privacy content:', error)
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