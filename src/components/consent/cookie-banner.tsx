"use client"

import { useConsent } from "./consent-provider"
import { ConsentPreferences } from "./consent-preferences"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Cookie, Settings } from "lucide-react"

export interface ConsentSettings {
  essential: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
  version?: string
}

export function CookieBanner() {
  const { 
    showBanner, 
    showPreferences, 
    setShowPreferences, 
    updateSettings, 
    settings 
  } = useConsent()

  const handleAcceptAll = () => {
    updateSettings({
      essential: true,
      analytics: true,
      marketing: true
    })
  }

  const handleRejectOptional = () => {
    updateSettings({
      essential: true,
      analytics: false,
      marketing: false
    })
  }

  const handleCustomize = () => {
    setShowPreferences(true)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t">
        <Card className="mx-auto max-w-4xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-5 w-5 text-saku-base mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="font-medium text-sm">Usamos cookies para mejorar tu experiencia</h3>
                  <p className="text-xs text-muted-foreground">
                    Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales 
                    para análisis y marketing. Puedes personalizar tus preferencias.{" "}
                    <a 
                      href="/cookies" 
                      className="underline hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Más información
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomize}
                  className="text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Personalizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectOptional}
                  className="text-xs"
                >
                  Solo Esenciales
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-saku-base hover:bg-saku-base/90 text-saku-black text-xs"
                >
                  Aceptar Todas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences Modal */}
      {showPreferences && settings && (
        <ConsentPreferences 
          currentSettings={settings}
          onSave={updateSettings}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </>
  )
}

// Initialize Google Consent Mode
if (typeof window !== 'undefined') {
  // Set default consent state
  window.gtag = window.gtag || function(...args) {
    (window.dataLayer = window.dataLayer || []).push(args)
  }
  
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  })
}