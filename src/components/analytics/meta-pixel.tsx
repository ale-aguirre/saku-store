'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { AnalyticsItem } from '@/types/content'

interface MetaPixelProps {
  pixelId?: string
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  const META_PIXEL_ID = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID

  useEffect(() => {
    if (typeof window !== 'undefined' && META_PIXEL_ID) {
      // Initialize fbq
      window.fbq = window.fbq || function(...args: unknown[]) {
        const fbq = window.fbq as any
        fbq.callMethod 
          ? fbq.callMethod.apply(window.fbq, args)
          : fbq.queue.push(args)
      }
      
      const fbq = window.fbq as any
      if (!fbq.loaded) {
        const f = document.createElement('script')
        f.async = true
        f.src = 'https://connect.facebook.net/en_US/fbevents.js'
        const s = document.getElementsByTagName('script')[0]
        s.parentNode?.insertBefore(f, s)
        fbq.loaded = true
      }
      
      fbq.queue = fbq.queue || []

      // Initialize pixel with consent denied by default
      window.fbq('consent', 'revoke')
      window.fbq('init', META_PIXEL_ID)
      window.fbq('track', 'PageView')
    }
  }, [META_PIXEL_ID])

  if (!META_PIXEL_ID) {
    return null
  }

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
        `,
      }}
    />
  )
}

// Helper functions for tracking events
export const trackMetaEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters)
  }
}

export const trackMetaPurchase = (value: number, currency: string = 'ARS', contentIds?: string[]) => {
  trackMetaEvent('Purchase', {
    value,
    currency,
    content_ids: contentIds,
    content_type: 'product',
  })
}

export const trackMetaAddToCart = (value: number, currency: string = 'ARS', contentIds?: string[]) => {
  trackMetaEvent('AddToCart', {
    value,
    currency,
    content_ids: contentIds,
    content_type: 'product',
  })
}

export const trackMetaViewContent = (value?: number, currency: string = 'ARS', contentIds?: string[]) => {
  trackMetaEvent('ViewContent', {
    value,
    currency,
    content_ids: contentIds,
    content_type: 'product',
  })
}

export const trackMetaInitiateCheckout = (value: number, currency: string = 'ARS', contentIds?: string[]) => {
  trackMetaEvent('InitiateCheckout', {
    value,
    currency,
    content_ids: contentIds,
    content_type: 'product',
  })
}