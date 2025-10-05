import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ErrorDetailsProps {
  error?: string
}

function ErrorDetails({ error }: ErrorDetailsProps) {
  const errorMessages: Record<string, string> = {
    'access_denied': 'Acceso denegado. Has cancelado el proceso de autenticación.',
    'session_exchange_failed': 'Error al procesar la sesión. El código de autorización puede haber expirado.',
    'unexpected_error': 'Error inesperado durante la autenticación.',
  }

  const message = error ? errorMessages[error] : 'El enlace de autenticación puede haber expirado o ser inválido.'
  
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground text-center">
        {message}
      </p>
      {error && process.env.NODE_ENV === 'development' && (
        <p className="text-xs text-muted-foreground text-center font-mono bg-muted p-2 rounded">
          Error code: {error}
        </p>
      )}
    </div>
  )
}

interface AuthCodeErrorPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AuthCodeErrorPage({ searchParams }: AuthCodeErrorPageProps) {
  const params = await searchParams
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Error de Autenticación
          </CardTitle>
          <CardDescription>
            Hubo un problema al procesar tu solicitud de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ErrorDetails error={params.error} />
          
          <p className="text-sm text-muted-foreground text-center">
            Por favor, intenta iniciar sesión nuevamente.
          </p>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Volver al Login
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Ir al Inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}