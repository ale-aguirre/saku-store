"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { ConsentSettings } from "./cookie-banner"

interface ConsentContextType {
  settings: ConsentSettings | null
  updateSettings: (newSettings: Omit<ConsentSettings, 'timestamp'>) => void
  showBanner: boolean
  showPreferences: boolean
  setShowPreferences: (show: boolean) => void
  hasConsent: (type: keyof Omit<ConsentSettings, 'timestamp'>) => boolean
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

const CONSENT_STORAGE_KEY = 'saku-consent-settings'
const CONSENT_VERSION = '1.0'

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConsentSettings | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load consent settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentSettings
        
        // Check if consent is still valid (not older than 1 year)
        const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000)
        if (parsed.timestamp > oneYearAgo) {
          setSettings(parsed)
          setShowBanner(false)
        } else {
          // Consent expired, show banner again
          localStorage.removeItem(CONSENT_STORAGE_KEY)
          setShowBanner(true)
        }
      } else {
        setShowBanner(true)
      }
    } catch (error) {
      console.error('Error loading consent settings:', error)
      setShowBanner(true)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Update Google Consent Mode when settings change
  useEffect(() => {
    if (settings && typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: settings.analytics ? 'granted' : 'denied',
        ad_storage: settings.marketing ? 'granted' : 'denied',
        ad_user_data: settings.marketing ? 'granted' : 'denied',
        ad_personalization: settings.marketing ? 'granted' : 'denied',
      })
    }
  }, [settings])

  const updateSettings = (newSettings: Omit<ConsentSettings, 'timestamp'>) => {
    const settingsWithTimestamp: ConsentSettings = {
      ...newSettings,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    }

    setSettings(settingsWithTimestamp)
    setShowBanner(false)
    setShowPreferences(false)

    // Save to localStorage
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(settingsWithTimestamp))
    } catch (error) {
      console.error('Error saving consent settings:', error)
    }

    // Trigger custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('consentUpdated', { 
      detail: settingsWithTimestamp 
    }))
  }

  const hasConsent = (type: keyof Omit<ConsentSettings, 'timestamp'>) => {
    if (!settings) return false
    return settings[type] === true
  }

  // Don't render anything until we've loaded the consent state
  if (!isLoaded) {
    return null
  }

  return (
    <ConsentContext.Provider value={{
      settings,
      updateSettings,
      showBanner,
      showPreferences,
      setShowPreferences,
      hasConsent
    }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const context = useContext(ConsentContext)
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }
  return context
}

// Utility hook for conditional analytics/marketing code
export function useConsentGuard() {
  const { hasConsent } = useConsent()

  return {
    canUseAnalytics: hasConsent('analytics'),
    canUseMarketing: hasConsent('marketing'),
    executeIfConsent: (type: 'analytics' | 'marketing', callback: () => void) => {
      if (hasConsent(type)) {
        callback()
      }
    }
  }
}