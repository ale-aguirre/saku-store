"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Shield, BarChart3, Target, Cookie } from "lucide-react"
import { ConsentSettings } from "./cookie-banner"

interface ConsentPreferencesProps {
  currentSettings: ConsentSettings
  onSave: (preferences: Omit<ConsentSettings, 'timestamp'>) => void
  onClose: () => void
}

export function ConsentPreferences({ currentSettings, onSave, onClose }: ConsentPreferencesProps) {
  const [preferences, setPreferences] = useState({
    essential: currentSettings.essential,
    analytics: currentSettings.analytics,
    marketing: currentSettings.marketing
  })

  const handleToggle = (type: keyof typeof preferences) => {
    if (type === 'essential') return // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const handleSave = () => {
    onSave(preferences)
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true
    }
    setPreferences(allAccepted)
    onSave(allAccepted)
  }

  const handleRejectOptional = () => {
    const onlyEssential = {
      essential: true,
      analytics: false,
      marketing: false
    }
    setPreferences(onlyEssential)
    onSave(onlyEssential)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-saku-base" />
            <CardTitle className="text-xl">Preferencias de Cookies</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Gestiona tus preferencias de cookies. Puedes cambiar estas configuraciones en cualquier momento.
          </p>

          {/* Essential Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium">Cookies Esenciales</h3>
                  <p className="text-sm text-muted-foreground">
                    Necesarias para el funcionamiento básico del sitio
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Siempre activas</Badge>
                <Switch checked={true} disabled />
              </div>
            </div>
            <div className="pl-8 text-sm text-muted-foreground">
              <p className="mb-2">Estas cookies son necesarias para:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Mantener tu sesión iniciada</li>
                <li>Recordar el contenido de tu carrito</li>
                <li>Preferencias de tema (modo oscuro/claro)</li>
                <li>Configuraciones de idioma y región</li>
              </ul>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Cookies de Análisis</h3>
                  <p className="text-sm text-muted-foreground">
                    Nos ayudan a entender cómo usas el sitio
                  </p>
                </div>
              </div>
              <Switch 
                checked={preferences.analytics} 
                onCheckedChange={() => handleToggle('analytics')}
              />
            </div>
            <div className="pl-8 text-sm text-muted-foreground">
              <p className="mb-2">Utilizamos Google Analytics para:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Medir el tráfico y uso del sitio web</li>
                <li>Entender qué páginas son más populares</li>
                <li>Mejorar la experiencia de navegación</li>
                <li>Identificar problemas técnicos</li>
              </ul>
              <p className="mt-2 text-xs">
                <strong>Datos recopilados:</strong> Páginas visitadas, tiempo en el sitio, 
                dispositivo usado (anónimo)
              </p>
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-medium">Cookies de Marketing</h3>
                  <p className="text-sm text-muted-foreground">
                    Para mostrarte anuncios relevantes
                  </p>
                </div>
              </div>
              <Switch 
                checked={preferences.marketing} 
                onCheckedChange={() => handleToggle('marketing')}
              />
            </div>
            <div className="pl-8 text-sm text-muted-foreground">
              <p className="mb-2">Utilizamos Meta Pixel para:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Mostrar anuncios personalizados en Facebook e Instagram</li>
                <li>Medir la efectividad de nuestras campañas publicitarias</li>
                <li>Crear audiencias similares para llegar a nuevos clientes</li>
                <li>Optimizar nuestros anuncios para mejores resultados</li>
              </ul>
              <p className="mt-2 text-xs">
                <strong>Datos recopilados:</strong> Productos vistos, compras realizadas, 
                interacciones con anuncios
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              onClick={handleSave}
              className="bg-saku-base hover:bg-saku-base/90 text-saku-black flex-1"
            >
              Guardar Preferencias
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAcceptAll}
              className="flex-1"
            >
              Aceptar Todas
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleRejectOptional}
              className="flex-1"
            >
              Solo Esenciales
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            Puedes cambiar estas preferencias en cualquier momento desde el pie de página.
            <br />
            Para más información, consulta nuestra{" "}
            <a href="/cookies" className="underline hover:text-foreground">
              Política de Cookies
            </a>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  )
}