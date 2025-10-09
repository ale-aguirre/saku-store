'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, LogOut, Trash2 } from 'lucide-react'
export function AuthReset() {
  const [isResetting, setIsResetting] = useState(false)
  const [resetStatus, setResetStatus] = useState<string | null>(null)

  const performCompleteReset = async () => {
    setIsResetting(true)
    setResetStatus('Iniciando reset completo...')

    try {
      // Paso 1: Cerrar sesión en Supabase
      setResetStatus('1/5 Cerrando sesión en Supabase...')
      await supabase.auth.signOut()

      // Paso 2: Limpiar localStorage
      setResetStatus('2/5 Limpiando localStorage...')
      localStorage.clear()

      // Paso 3: Limpiar sessionStorage
      setResetStatus('3/5 Limpiando sessionStorage...')
      sessionStorage.clear()

      // Paso 4: Limpiar cookies de Supabase específicamente
      setResetStatus('4/5 Limpiando cookies...')
      
      // Limpiar cookies relacionadas con Supabase
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        'supabase.auth.token'
      ]

      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`
      })

      // Paso 5: Verificar limpieza
      setResetStatus('5/5 Verificando limpieza...')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setResetStatus('⚠️ Advertencia: Aún hay una sesión activa')
      } else {
        setResetStatus('✅ Reset completo exitoso')
      }

      // Esperar un momento para que el usuario vea el resultado
      setTimeout(() => {
        setResetStatus('🔄 Redirigiendo al login...')
        // Redirigir al login después del reset
        window.location.href = '/auth/login'
      }, 2000)

    } catch (error) {
      console.error('Error durante reset:', error)
      setResetStatus(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsResetting(false)
    }
  }

  const quickRefresh = () => {
    window.location.reload()
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="h-5 w-5" />
          Reset de Autenticación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700">
          <p className="mb-2">
            Si tienes problemas con la subida de imágenes, es probable que tu sesión esté corrupta.
          </p>
          <p>
            Usa estas herramientas para limpiar completamente el estado de autenticación:
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={quickRefresh}
            disabled={isResetting}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refrescar Página
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={performCompleteReset}
            disabled={isResetting}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isResetting ? 'Reseteando...' : 'Reset Completo'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = '/auth/login'}
            disabled={isResetting}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Ir a Login
          </Button>
        </div>

        {resetStatus && (
          <div className="text-sm p-3 bg-white rounded border border-orange-200">
            <div className="font-medium text-orange-800">Estado del Reset:</div>
            <div className="text-orange-700">{resetStatus}</div>
          </div>
        )}

        <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
          <strong>Instrucciones:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Haz clic en &quot;Reset Completo&quot;</li>
            <li>Espera a que termine el proceso</li>
            <li>Serás redirigido al login automáticamente</li>
            <li>Ingresa tus credenciales: admin@saku.com / admin123</li>
            <li>Regresa a esta página y prueba subir una imagen</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}