'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useOrderConfirmationEmail, useEmailConfigCheck } from '@/hooks/use-order-emails'
import { CheckCircle, XCircle, Mail, Settings } from 'lucide-react'

export function EmailTest() {
  const [orderId, setOrderId] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  const orderEmailMutation = useOrderConfirmationEmail()
  const configCheckMutation = useEmailConfigCheck()

  const handleSendTestEmail = () => {
    if (!orderId || !customerEmail) {
      alert('Por favor completa todos los campos')
      return
    }

    orderEmailMutation.mutate({
      orderId,
      customerEmail,
    })
  }

  const handleCheckConfig = () => {
    configCheckMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Verificar Configuración de Email
          </CardTitle>
          <CardDescription>
            Verifica que la configuración SMTP esté correcta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCheckConfig}
            disabled={configCheckMutation.isPending}
            variant="outline"
          >
            {configCheckMutation.isPending ? 'Verificando...' : 'Verificar Configuración'}
          </Button>

          {configCheckMutation.data && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Configuración válida: {configCheckMutation.data.messageId}
              </AlertDescription>
            </Alert>
          )}

          {configCheckMutation.error && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Error: {configCheckMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Email de Confirmación de Prueba
          </CardTitle>
          <CardDescription>
            Envía un email de confirmación para una orden específica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderId">ID de Orden</Label>
            <Input
              id="orderId"
              placeholder="ej: 123e4567-e89b-12d3-a456-426614174000"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email del Cliente</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="cliente@ejemplo.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSendTestEmail}
            disabled={orderEmailMutation.isPending || !orderId || !customerEmail}
            className="w-full"
          >
            {orderEmailMutation.isPending ? 'Enviando...' : 'Enviar Email de Prueba'}
          </Button>

          {orderEmailMutation.data && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Email enviado exitosamente. ID: {orderEmailMutation.data.messageId}
              </AlertDescription>
            </Alert>
          )}

          {orderEmailMutation.error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Error: {orderEmailMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}