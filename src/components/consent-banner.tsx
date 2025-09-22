'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Settings } from 'lucide-react'
import { ConsentPreferences } from '@/types/content'

const CONSENT_STORAGE_KEY = 'saku-cookie-consent'

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!savedConsent) {
      setShowBanner(true)
    } else {
      const parsed = JSON.parse(savedConsent)
      setPreferences(parsed)
      // Apply consent settings
      applyConsentSettings(parsed)
    }
  }, [])

  const applyConsentSettings = (consent: ConsentPreferences) => {
    // Apply Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied',
      })
    }

    // Apply Meta Pixel consent
    if (typeof window !== 'undefined' && window.fbq) {
      if (consent.marketing) {
        window.fbq('consent', 'grant')
      } else {
        window.fbq('consent', 'revoke')
      }
    }
  }

  const saveConsent = (consent: ConsentPreferences) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
    applyConsentSettings(consent)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    saveConsent(allAccepted)
  }

  const acceptEssentialOnly = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
    }
    setPreferences(essentialOnly)
    saveConsent(essentialOnly)
  }

  const saveCustomPreferences = () => {
    saveConsent(preferences)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl border-border bg-background/95 backdrop-blur-sm">
        <CardContent className="p-6">
          {!showSettings ? (
            // Main banner
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Utilizamos cookies para mejorar tu experiencia
                </h3>
                <p className="text-sm text-muted-foreground">
                  Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales para análisis y marketing. 
                  Puedes gestionar tus preferencias en cualquier momento.{' '}
                  <Link href="/cookies" className="underline hover:no-underline">
                    Más información
                  </Link>
                </p>
              </div>
              
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptEssentialOnly}
                >
                  Solo esenciales
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-saku-beige hover:bg-saku-beige/90 text-black"
                >
                  Aceptar todas
                </Button>
              </div>
            </div>
          ) : (
            // Settings panel
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  Configuración de Cookies
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium text-foreground">Cookies Esenciales</h4>
                    <p className="text-sm text-muted-foreground">
                      Necesarias para el funcionamiento básico del sitio
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Siempre activas
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium text-foreground">Cookies de Análisis</h4>
                    <p className="text-sm text-muted-foreground">
                      Nos ayudan a entender cómo usas el sitio web
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-saku-beige/20 dark:peer-focus:ring-saku-beige/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-saku-beige"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium text-foreground">Cookies de Marketing</h4>
                    <p className="text-sm text-muted-foreground">
                      Para mostrar anuncios relevantes y medir campañas
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-saku-beige/20 dark:peer-focus:ring-saku-beige/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-saku-beige"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={acceptEssentialOnly}
                  className="flex-1"
                >
                  Solo esenciales
                </Button>
                <Button
                  onClick={saveCustomPreferences}
                  className="flex-1 bg-saku-beige hover:bg-saku-beige/90 text-black"
                >
                  Guardar preferencias
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}