import { Database } from './database'

// Tipos base de la base de datos
export type Product = Database['public']['Tables']['products']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type Category = Database['public']['Tables']['categories']['Row']

// Tipos extendidos para el catálogo
export interface ProductWithVariants extends Product {
  variants: ProductVariant[]
  category?: Category | null
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  product_id: string
  variant_id?: string | null
  url: string
  alt_text?: string | null
  sort_order: number
  is_primary: boolean
}

export interface VariantWithStock extends ProductVariant {
  is_in_stock: boolean
  is_low_stock: boolean
}

export interface ProductWithVariantsAndStock extends Product {
  variants: VariantWithStock[]
  category?: Category | null
  images?: ProductImage[]
  available_sizes: string[]
  available_colors: string[]
  price_range: {
    min: number
    max: number
  }
  total_stock: number
}

// Tipos para filtros y búsqueda
export interface ProductFilters {
  category_id?: string
  size?: string
  color?: string
  min_price?: number
  max_price?: number
  in_stock_only?: boolean
  is_featured?: boolean
  search?: string
}

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'newest' | 'name'

// Tipos para el selector de variantes
export interface VariantSelection {
  size?: string
  color?: string
  material?: string
}

export interface VariantOption {
  value: string
  label: string
  available: boolean
  stock_quantity?: number
}

export interface VariantSelectionState {
  selectedVariant?: ProductVariant | null
  availableOptions: {
    sizes: VariantOption[]
    colors: VariantOption[]
    materials: VariantOption[]
  }
  isValid: boolean
  price: number
  stock_quantity: number
}

// Tipos para el carrito (relacionados con productos)
export interface CartItem {
  id: string
  product_id: string
  variant_id: string
  quantity: number
  product: Product
  variant: ProductVariant
  price_at_time: number
}

// Tipos para la respuesta de la API
export interface ProductsResponse {
  products: ProductWithVariantsAndStock[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface ProductDetailResponse {
  product: ProductWithVariantsAndStock
  related_products?: ProductWithVariantsAndStock[]
}

// Constantes para el catálogo
export const PRODUCT_SIZES = ['85', '90', '95', '100'] as const
export const PRODUCT_COLORS = ['negro', 'rojo', 'blanco'] as const
export const PRODUCTS_PER_PAGE = 12

export type ProductSize = typeof PRODUCT_SIZES[number]
export type ProductColor = typeof PRODUCT_COLORS[number]