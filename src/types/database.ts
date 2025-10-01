export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: 'customer' | 'admin' | 'super_admin'
          email_verified: boolean
          phone_verified: boolean
          marketing_consent: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'super_admin'
          email_verified?: boolean
          phone_verified?: boolean
          marketing_consent?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'super_admin'
          email_verified?: boolean
          phone_verified?: boolean
          marketing_consent?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          type: 'billing' | 'shipping'
          first_name: string
          last_name: string
          company: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'billing' | 'shipping'
          first_name: string
          last_name: string
          company?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'billing' | 'shipping'
          first_name?: string
          last_name?: string
          company?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          sku: string
          category_id: string | null
          base_price: number
          compare_at_price: number | null
          cost_price: number | null
          weight: number | null
          dimensions: Json | null
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
          is_active: boolean
          is_featured: boolean
          requires_shipping: boolean
          track_inventory: boolean
          allow_backorder: boolean
          hygiene_notice: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          sku: string
          category_id?: string | null
          base_price: number
          compare_at_price?: number | null
          cost_price?: number | null
          weight?: number | null
          dimensions?: Json | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          is_active?: boolean
          is_featured?: boolean
          requires_shipping?: boolean
          track_inventory?: boolean
          allow_backorder?: boolean
          hygiene_notice?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          sku?: string
          category_id?: string | null
          base_price?: number
          compare_at_price?: number | null
          cost_price?: number | null
          weight?: number | null
          dimensions?: Json | null
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          is_active?: boolean
          is_featured?: boolean
          requires_shipping?: boolean
          track_inventory?: boolean
          allow_backorder?: boolean
          hygiene_notice?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          size: string | null
          color: string | null
          material: string | null
          price_adjustment: number
          weight_adjustment: number | null
          stock_quantity: number
          low_stock_threshold: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          size?: string | null
          color?: string | null
          material?: string | null
          price_adjustment?: number
          weight_adjustment?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string
          size?: string | null
          color?: string | null
          material?: string | null
          price_adjustment?: number
          weight_adjustment?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inventory_movements: {
        Row: {
          id: string
          variant_id: string
          type: 'adjustment' | 'sale' | 'return' | 'damage' | 'restock'
          quantity_change: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          variant_id: string
          type: 'adjustment' | 'sale' | 'return' | 'damage' | 'restock'
          quantity_change: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          variant_id?: string
          type?: 'adjustment' | 'sale' | 'return' | 'damage' | 'restock'
          quantity_change?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed_amount' | 'free_shipping'
          value: number
          minimum_amount: number | null
          maximum_discount: number | null
          usage_limit: number | null
          usage_count: number
          is_active: boolean
          starts_at: string | null
          ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: 'percentage' | 'fixed_amount' | 'free_shipping'
          value: number
          minimum_amount?: number | null
          maximum_discount?: number | null
          usage_limit?: number | null
          usage_count?: number
          is_active?: boolean
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'percentage' | 'fixed_amount' | 'free_shipping'
          value?: number
          minimum_amount?: number | null
          maximum_discount?: number | null
          usage_limit?: number | null
          usage_count?: number
          is_active?: boolean
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      coupon_usages: {
        Row: {
          id: string
          coupon_id: string
          user_id: string
          order_id: string
          discount_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          user_id: string
          order_id: string
          discount_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          coupon_id?: string
          user_id?: string
          order_id?: string
          discount_amount?: number
          created_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          coupon_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          coupon_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          coupon_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          variant_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          variant_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          variant_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
          payment_method: string | null
          payment_id: string | null
          subtotal: number
          discount_amount: number
          shipping_amount: number
          tax_amount: number
          total_amount: number
          currency: string
          shipping_address: Json
          billing_address: Json
          shipping_method: string | null
          tracking_number: string | null
          tracking_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id: string
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
          payment_method?: string | null
          payment_id?: string | null
          subtotal: number
          discount_amount?: number
          shipping_amount?: number
          tax_amount?: number
          total_amount: number
          currency?: string
          shipping_address: Json
          billing_address: Json
          shipping_method?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
          payment_method?: string | null
          payment_id?: string | null
          subtotal?: number
          discount_amount?: number
          shipping_amount?: number
          tax_amount?: number
          total_amount?: number
          currency?: string
          shipping_address?: Json
          billing_address?: Json
          shipping_method?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string
          quantity: number
          unit_price: number
          total_price: number
          product_snapshot: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          variant_id: string
          quantity: number
          unit_price: number
          total_price: number
          product_snapshot: Json
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          variant_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          product_snapshot?: Json
          created_at?: string
        }
      }
      order_events: {
        Row: {
          id: string
          order_id: string
          type: string
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          type: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          type?: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      customer_segments: {
        Row: {
          id: string
          user_id: string
          segment: 'new' | 'active' | 'at_risk' | 'lost' | 'vip'
          rfm_score: string | null
          recency_score: number | null
          frequency_score: number | null
          monetary_score: number | null
          last_order_date: string | null
          total_orders: number
          total_spent: number
          avg_order_value: number
          calculated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          segment: 'new' | 'active' | 'at_risk' | 'lost' | 'vip'
          rfm_score?: string | null
          recency_score?: number | null
          frequency_score?: number | null
          monetary_score?: number | null
          last_order_date?: string | null
          total_orders?: number
          total_spent?: number
          avg_order_value?: number
          calculated_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          segment?: 'new' | 'active' | 'at_risk' | 'lost' | 'vip'
          rfm_score?: string | null
          recency_score?: number | null
          frequency_score?: number | null
          monetary_score?: number | null
          last_order_date?: string | null
          total_orders?: number
          total_spent?: number
          avg_order_value?: number
          calculated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      nps_surveys: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          score: number | null
          feedback: string | null
          sent_at: string
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          score?: number | null
          feedback?: string | null
          sent_at: string
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          score?: number | null
          feedback?: string | null
          sent_at?: string
          responded_at?: string | null
          created_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          html_content: string
          text_content: string | null
          variables: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          html_content: string
          text_content?: string | null
          variables?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          html_content?: string
          text_content?: string | null
          variables?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          name: string
          type: 'email' | 'sms' | 'whatsapp'
          template_id: string
          segment_filter: Json | null
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
          scheduled_at: string | null
          sent_at: string | null
          recipients_count: number
          opened_count: number
          clicked_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'email' | 'sms' | 'whatsapp'
          template_id: string
          segment_filter?: Json | null
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
          scheduled_at?: string | null
          sent_at?: string | null
          recipients_count?: number
          opened_count?: number
          clicked_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'email' | 'sms' | 'whatsapp'
          template_id?: string
          segment_filter?: Json | null
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
          scheduled_at?: string | null
          sent_at?: string | null
          recipients_count?: number
          opened_count?: number
          clicked_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      automations: {
        Row: {
          id: string
          name: string
          type: 'abandoned_cart' | 'nps_survey' | 'winback' | 'welcome'
          trigger_event: string
          delay_hours: number
          template_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'abandoned_cart' | 'nps_survey' | 'winback' | 'welcome'
          trigger_event: string
          delay_hours: number
          template_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'abandoned_cart' | 'nps_survey' | 'winback' | 'welcome'
          trigger_event?: string
          delay_hours?: number
          template_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      automation_executions: {
        Row: {
          id: string
          automation_id: string
          user_id: string
          trigger_data: Json | null
          status: 'pending' | 'sent' | 'failed' | 'cancelled'
          scheduled_at: string
          executed_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          automation_id: string
          user_id: string
          trigger_data?: Json | null
          status?: 'pending' | 'sent' | 'failed' | 'cancelled'
          scheduled_at: string
          executed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          automation_id?: string
          user_id?: string
          trigger_data?: Json | null
          status?: 'pending' | 'sent' | 'failed' | 'cancelled'
          scheduled_at?: string
          executed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          type: 'string' | 'number' | 'boolean' | 'json'
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          type: 'string' | 'number' | 'boolean' | 'json'
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          type?: 'string' | 'number' | 'boolean' | 'json'
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      copy_blocks: {
        Row: {
          id: string
          key: string
          title: string | null
          content: string
          locale: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          title?: string | null
          content: string
          locale?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          title?: string | null
          content?: string
          locale?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}