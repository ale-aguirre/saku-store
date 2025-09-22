"use client";

import Script from "next/script";
import { useEffect } from "react";
import { AnalyticsEvent, AnalyticsItem } from "@/types/content";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA4_ID;

  useEffect(() => {
    if (typeof window !== "undefined" && GA_MEASUREMENT_ID) {
      // Initialize gtag with default consent settings
      window.gtag =
        window.gtag ||
        function (...args: unknown[]) {
          // Initialize gtag queue if it doesn't exist
          (window.gtag as any).q = (window.gtag as any).q || [];
          (window.gtag as any).q.push(args);
        };

      // Set default consent to denied
      window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500,
      });

      // Configure Google Analytics
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [GA_MEASUREMENT_ID]);

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
    window.gtag("event", eventName, parameters);
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
