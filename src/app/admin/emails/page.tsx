import { EmailTest } from '@/components/admin/email-test'

export default function AdminEmailsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestión de Emails</h1>
        <p className="text-muted-foreground mt-2">
          Configura y prueba el envío de emails transaccionales
        </p>
      </div>

      <EmailTest />
    </div>
  )
}

export const metadata = {
  title: 'Gestión de Emails - Admin',
  description: 'Configuración y pruebas de emails transaccionales',
}