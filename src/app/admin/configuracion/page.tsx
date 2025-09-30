'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { User, Camera, Save, Eye, EyeOff } from 'lucide-react'

// Schema de validación para datos personales
const personalDataSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido')
})

// Schema de validación para cambio de contraseña
const passwordSchema = z.object({
  current_password: z.string().min(1, 'Contraseña actual requerida'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirm_password: z.string().min(1, 'Confirmar contraseña requerida')
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"]
})

type PersonalDataForm = z.infer<typeof personalDataSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Formulario para datos personales
  const personalForm = useForm<PersonalDataForm>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || ''
    }
  })

  // Formulario para cambio de contraseña
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  })

  // Actualizar datos personales
  const onUpdateProfile = async (data: PersonalDataForm) => {
    setIsUpdatingProfile(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: data.email,
        data: { full_name: data.full_name }
      })

      if (error) throw error

      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error("No se pudieron actualizar los datos. Inténtalo de nuevo.")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Cambiar contraseña
  const onUpdatePassword = async (data: PasswordForm) => {
    setIsUpdatingPassword(true)
    try {
      // Verificar contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.current_password
      })

      if (signInError) {
        throw new Error('Contraseña actual incorrecta')
      }

      // Actualizar contraseña
      const { error } = await supabase.auth.updateUser({
        password: data.new_password
      })

      if (error) throw error

      toast.success("Contraseña actualizada correctamente")

      passwordForm.reset()
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar la contraseña.")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Cargando...</h2>
          <p className="text-muted-foreground">Obteniendo información del usuario</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Foto de perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Foto de perfil
            </CardTitle>
            <CardDescription>
              Actualiza tu imagen de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-saku-base text-foreground text-lg">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" disabled>
                <Camera className="h-4 w-4 mr-2" />
                Cambiar foto
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Próximamente disponible
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Datos personales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información personal
            </CardTitle>
            <CardDescription>
              Actualiza tu nombre y email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={personalForm.handleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre completo</Label>
                  <Input
                    id="full_name"
                    {...personalForm.register('full_name')}
                    placeholder="Tu nombre completo"
                  />
                  {personalForm.formState.errors.full_name && (
                    <p className="text-sm text-destructive">
                      {personalForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...personalForm.register('email')}
                    placeholder="tu@email.com"
                  />
                  {personalForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {personalForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <>Guardando...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Cambio de contraseña */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current_password">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? "text" : "password"}
                    {...passwordForm.register('current_password')}
                    placeholder="Contraseña actual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordForm.formState.errors.current_password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.current_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    {...passwordForm.register('new_password')}
                    placeholder="Nueva contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordForm.formState.errors.new_password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    {...passwordForm.register('confirm_password')}
                    placeholder="Confirmar contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? (
                  <>Actualizando...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cambiar contraseña
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}