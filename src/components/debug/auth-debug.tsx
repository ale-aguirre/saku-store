'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, User, Upload } from 'lucide-react'

export function AuthDebug() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<string | null>(null)

  const checkAuthState = async () => {
    setLoading(true)
    try {
      // Verificar sesión
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Verificar usuario
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      setAuthState({
        session: session ? {
          user: session.user.email,
          expires_at: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'No expiry',
          access_token: session.access_token ? 'Presente' : 'Ausente'
        } : null,
        user: user ? {
          email: user.email,
          id: user.id,
          role: user.user_metadata?.role || 'No definido'
        } : null,
        sessionError: sessionError?.message,
        userError: userError?.message
      })
    } catch (error) {
      console.error('Error checking auth state:', error)
      setAuthState({ error: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }

  const testImageUpload = async () => {
    setTestResult('Probando...')
    try {
      // Crear un archivo de prueba pequeño
      const testContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header
      const fileName = `test-debug-${Date.now()}.png`
      const filePath = `home/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, testContent, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) {
        setTestResult(`❌ Error: ${uploadError.message}`)
        return
      }

      // Limpiar archivo de prueba
      await supabase.storage.from('images').remove([uploadData.path])
      setTestResult('✅ Subida exitosa')
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  if (loading) {
    return (
      <Card className="mb-6 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Verificando autenticación...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <User className="h-5 w-5" />
          Debug: Estado de Autenticación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de Sesión */}
        <div>
          <h4 className="font-medium mb-2">Sesión</h4>
          {authState?.session ? (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Activa</Badge>
                <span>{authState.session.user}</span>
              </div>
              <div>Expira: {authState.session.expires_at}</div>
              <div>Token: {authState.session.access_token}</div>
            </div>
          ) : (
            <Badge variant="destructive">Sin sesión</Badge>
          )}
          {authState?.sessionError && (
            <div className="text-red-600 text-sm mt-1">Error: {authState.sessionError}</div>
          )}
        </div>

        {/* Estado de Usuario */}
        <div>
          <h4 className="font-medium mb-2">Usuario</h4>
          {authState?.user ? (
            <div className="space-y-1 text-sm">
              <div>Email: {authState.user.email}</div>
              <div>ID: {authState.user.id}</div>
              <div>Rol: {authState.user.role}</div>
            </div>
          ) : (
            <Badge variant="destructive">No autenticado</Badge>
          )}
          {authState?.userError && (
            <div className="text-red-600 text-sm mt-1">Error: {authState.userError}</div>
          )}
        </div>

        {/* Test de Subida */}
        <div>
          <h4 className="font-medium mb-2">Test de Subida de Imagen</h4>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={testImageUpload}
              disabled={!authState?.user}
            >
              <Upload className="h-4 w-4 mr-2" />
              Probar Subida
            </Button>
            {testResult && (
              <span className="text-sm">{testResult}</span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" onClick={checkAuthState}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.reload()
            }}
          >
            Limpiar Storage
          </Button>
        </div>

        {authState?.error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            Error general: {authState.error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}