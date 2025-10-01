'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, User, Package, LogOut, Settings } from 'lucide-react'

export default function AccountPage() {
  const { user, loading } = useAuth()
  const [signOutLoading, setSignOutLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    setSignOutLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setSignOutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando tu cuenta...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mi Cuenta</h1>
              <p className="text-muted-foreground">
                Bienvenida, {user.user_metadata?.first_name || user.email}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signOutLoading}
            >
              {signOutLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Account Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Gestiona tu información de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                {user.user_metadata?.first_name && (
                  <div>
                    <p className="text-sm font-medium">Nombre completo</p>
                    <p className="text-sm text-muted-foreground">
                      {user.user_metadata.first_name} {user.user_metadata.last_name}
                    </p>
                  </div>
                )}
                {user.user_metadata?.phone && (
                  <div>
                    <p className="text-sm font-medium">Teléfono</p>
                    <p className="text-sm text-muted-foreground">
                      {user.user_metadata.phone}
                    </p>
                  </div>
                )}
                <div className="pt-2">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Mis Pedidos
                </CardTitle>
                <CardDescription>
                  Revisa el estado de tus compras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Aquí podrás ver todos tus pedidos y su estado actual.
                </p>
                <Link href="/cuenta/pedidos">
                  <Button variant="outline" size="sm">
                    Ver Pedidos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones más utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/productos">
                  <Button variant="outline" className="w-full">
                    Seguir Comprando
                  </Button>
                </Link>
                <Link href="/cuenta/pedidos">
                  <Button variant="outline" className="w-full">
                    Ver Pedidos
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" disabled>
                  Lista de Deseos
                  <span className="ml-2 text-xs text-muted-foreground">(Próximamente)</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cuenta creada:</span>
                <span>{new Date(user.created_at).toLocaleDateString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último acceso:</span>
                <span>{new Date(user.last_sign_in_at || user.created_at).toLocaleDateString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <span className="text-green-600">Activa</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}