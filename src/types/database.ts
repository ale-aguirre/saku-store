export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          postal_code: string
          state: string
          street_address: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code: string
          state: string
          street_address: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code?: string
          state?: string
          street_address?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string | null
          created_at: string | null
          id: string
          product_variant_id: string | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          product_variant_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          product_variant_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      copy_blocks: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          locale: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          locale?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          locale?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_amount: number | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      order_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          order_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string
          product_name: string
          quantity: number
          sku: string
          variant_color: string
          variant_size: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id: string
          product_name: string
          quantity: number
          sku: string
          variant_color: string
          variant_size: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
          sku?: string
          variant_color?: string
          variant_size?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          coupon_code: string | null
          created_at: string | null
          discount_amount: number | null
          email: string
          id: string
          notes: string | null
          payment_id: string | null
          payment_method: string | null
          shipping_address: Json
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          coupon_code?: string | null
          created_at?: string | null
          discount_amount?: number | null
          email: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          payment_method?: string | null
          shipping_address: Json
          shipping_cost: number
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          coupon_code?: string | null
          created_at?: string | null
          discount_amount?: number | null
          email?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          payment_method?: string | null
          shipping_address?: Json
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string
          created_at: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          low_stock_threshold: number | null
          material: string | null
          price: number | null
          price_adjustment: number | null
          product_id: string | null
          size: string
          sku: string
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          material?: string | null
          price?: number | null
          price_adjustment?: number | null
          product_id?: string | null
          size: string
          sku: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          material?: string | null
          price?: number | null
          price_adjustment?: number | null
          product_id?: string | null
          size?: string
          sku?: string
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          brand: string | null
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          sku: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          brand?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          sku: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          brand?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          sku?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          type: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_avatar_url: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_variant_primary_image: {
        Args:
          | { product_images: string[]; variant_images: string[] }
          | { variant_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_id?: string }
        Returns: boolean
      }
      set_admin_role_for_email: {
        Args: { user_email: string }
        Returns: undefined
      }
      test_auth_trigger_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_exists: boolean
          recent_profiles_count: number
          trigger_exists: boolean
        }[]
      }
      test_profile_creation_with_auth: {
        Args: { test_email: string }
        Returns: string
      }
      test_role_assignment: {
        Args: { test_email: string }
        Returns: string
      }
      update_avatar_url: {
        Args: { new_avatar_url: string; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      coupon_type: "percentage" | "fixed"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      user_role: "customer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      coupon_type: ["percentage", "fixed"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      user_role: ["customer", "admin"],
    },
  },
} as const
