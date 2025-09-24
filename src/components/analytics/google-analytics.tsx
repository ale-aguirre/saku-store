"use client";

import Script from "next/script";
import { useEffect } from "react";
import { AnalyticsItem } from "@/types/content";
import { useConsentGuard } from "@/components/consent/consent-provider";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA4_ID;
  const { canUseAnalytics } = useConsentGuard();

  useEffect(() => {
    if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
      // Initialize gtag with default consent settings
      window.gtag =
        window.gtag ||
        function (...args: unknown[]) {
          // Initialize gtag queue if it doesn't exist
          const gtagWithQueue = window.gtag as any;
          gtagWithQueue.q = gtagWithQueue.q || [];
          gtagWithQueue.q.push(args);
        };

      // Configure Google Analytics only if consent is given
      if (canUseAnalytics) {
        window.gtag("config", GA_MEASUREMENT_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    }
  }, [GA_MEASUREMENT_ID, canUseAnalytics]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
          `,
        }}
      />
    </>
  );
}

// Helper functions for tracking events
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    // Check consent before tracking
    const consentEvent = new CustomEvent("checkConsent", {
      detail: "analytics",
    });
    window.dispatchEvent(consentEvent);

    // Only track if analytics consent is granted
    const hasConsent = localStorage.getItem("saku-consent-settings");
    if (hasConsent) {
      const settings = JSON.parse(hasConsent);
      if (settings.analytics) {
        window.gtag("event", eventName, parameters);
      }
    }
  }
};

export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string = "ARS",
  items?: AnalyticsItem[]
) => {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
};

export const trackAddToCart = (
  currency: string = "ARS",
  value: number,
  items?: AnalyticsItem[]
) => {
  trackEvent("add_to_cart", {
    currency,
    value,
    items,
  });
};

export const trackViewItem = (
  currency: string = "ARS",
  value: number,
  items?: AnalyticsItem[]
) => {
  trackEvent("view_item", {
    currency,
    value,
    items,
  });
};

export const trackBeginCheckout = (
  currency: string = "ARS",
  value: number,
  items?: AnalyticsItem[]
) => {
  trackEvent("begin_checkout", {
    currency,
    value,
    items,
  });
};
