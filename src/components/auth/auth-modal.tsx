'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  children: React.ReactNode
  defaultMode?: AuthMode
  onSuccess?: () => void
}

export function AuthModal({ children, defaultMode = 'login', onSuccess }: AuthModalProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>(defaultMode)

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  const switchToLogin = () => setMode('login')
  const switchToRegister = () => setMode('register')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </DialogTitle>
        </DialogHeader>
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}