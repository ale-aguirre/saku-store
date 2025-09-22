export interface CopyBlock {
  title?: string
  content: string
}

export interface AnalyticsEvent {
  event_name: string
  parameters?: Record<string, unknown>
}

export interface AnalyticsItem {
  item_id: string
  item_name: string
  category?: string
  quantity?: number
  price?: number
}

export interface ConsentPreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}