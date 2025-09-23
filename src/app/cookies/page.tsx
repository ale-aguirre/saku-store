'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_CONTENT = {
  title: 'Política de Cookies',
  content: `
    <h2>¿Qué son las Cookies?</h2>
    <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Nos ayudan a mejorar su experiencia de navegación.</p>
    
    <h2>Tipos de Cookies que Utilizamos</h2>
    
    <h3>Cookies Esenciales</h3>
    <p>Estas cookies son necesarias para el funcionamiento básico del sitio web y no se pueden desactivar:</p>
    <ul>
      <li>Cookies de sesión para mantener su carrito de compras</li>
      <li>Cookies de autenticación para mantener su sesión iniciada</li>
      <li>Cookies de preferencias de tema (modo oscuro/claro)</li>
    </ul>
    
    <h3>Cookies de Rendimiento</h3>
    <p>Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web:</p>
    <ul>
      <li>Google Analytics para análisis de tráfico web</li>
      <li>Métricas de rendimiento del sitio</li>
    </ul>
    
    <h3>Cookies de Marketing</h3>
    <p>Utilizadas para mostrar anuncios relevantes y medir la efectividad de nuestras campañas:</p>
    <ul>
      <li>Meta Pixel para seguimiento de conversiones</li>
      <li>Cookies de remarketing</li>
    </ul>
    
    <h2>Gestión de Cookies</h2>
    <p>Puede gestionar sus preferencias de cookies a través de:</p>
    <ul>
      <li>Nuestro banner de consentimiento de cookies</li>
      <li>La configuración de su navegador</li>
      <li>Herramientas de opt-out específicas de terceros</li>
    </ul>
    
    <h2>Cookies de Terceros</h2>
    <p>Algunos de nuestros socios pueden establecer cookies en nuestro sitio web:</p>
    <ul>
      <li><strong>Google Analytics:</strong> Para análisis web</li>
      <li><strong>Meta (Facebook):</strong> Para publicidad y análisis</li>
      <li><strong>Mercado Pago:</strong> Para procesamiento de pagos</li>
    </ul>
    
    <h2>Duración de las Cookies</h2>
    <p>Las cookies pueden ser:</p>
    <ul>
      <li><strong>De sesión:</strong> Se eliminan cuando cierra su navegador</li>
      <li><strong>Persistentes:</strong> Permanecen hasta su fecha de vencimiento o hasta que las elimine</li>
    </ul>
    
    <h2>Cómo Desactivar las Cookies</h2>
    <p>Puede desactivar las cookies a través de la configuración de su navegador, pero esto puede afectar la funcionalidad del sitio web.</p>
    
    <h2>Actualizaciones de esta Política</h2>
    <p>Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en nuestras prácticas o por otros motivos operativos, legales o reglamentarios.</p>
    
    <h2>Contacto</h2>
    <p>Si tiene preguntas sobre nuestra política de cookies, puede contactarnos a través de nuestros canales de atención al cliente.</p>
  `
}

export default function CookiesPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('copy_blocks')
          .select('content, title')
          .eq('key', 'cookies_policy')
          .eq('is_active', true)
          .single()

        if (data && !error) {
          setContent({
            title: (data as any).title || DEFAULT_CONTENT.title,
            content: (data as any).content
          })
        }
      } catch (error) {
        console.error('Error fetching cookies content:', error)
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