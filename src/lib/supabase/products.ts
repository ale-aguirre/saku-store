import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import type { 
  ProductFilters, 
  SortOption,
  VariantWithStock,
  ProductWithVariantsAndStock
} from '@/types/catalog'

type Product = Database['public']['Tables']['products']['Row']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type Category = Database['public']['Tables']['categories']['Row']

// Tipos auxiliares para consultas de Supabase
type ProductWithVariantsQuery = Product & {
  product_variants: (ProductVariant & {
    stock_quantity: number
    low_stock_threshold: number
  })[]
  categories?: Category
}

type VariantQuery = ProductVariant & {
  stock_quantity: number
  low_stock_threshold: number
}

const supabase = createClient()

/**
 * Obtiene productos con sus variantes y stock
 */
export async function getProducts(
  filters: ProductFilters = {},
  sortBy: SortOption = 'featured',
  page = 1,
  limit = 12
): Promise<ProductWithVariantsAndStock[]> {
  try {
    // Verificar si las variables de entorno están disponibles
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseAnonKey.includes('placeholder')) {
      console.log('Supabase environment variables not properly configured')
      return []
    }

    // Verificar que el cliente de Supabase esté disponible
    if (!supabase) {
      console.error('Supabase client not available')
      return []
    }

    let query = supabase
        .from('products')
        .select(`
          *,
          product_variants (
            id,
            sku,
            size,
            color,
            material,
            price_adjustment,
            stock_quantity,
            low_stock_threshold,
            is_active
          ),
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)

    // Aplicar filtros
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters.is_featured) {
      query = query.eq('is_featured', true)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%`)
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'price_asc':
        query = query.order('base_price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('base_price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'featured':
      default:
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
        break
    }

    // Aplicar paginación
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    if (!products) {
      return []
    }

    // Procesar productos con variantes y stock
    const processedProducts: ProductWithVariantsAndStock[] = (products as ProductWithVariantsQuery[]).map((product) => {
      const variants: VariantWithStock[] = (product.product_variants || []).map((variant) => ({
        ...variant,
        is_in_stock: variant.stock_quantity > 0,
        is_low_stock: variant.stock_quantity <= variant.low_stock_threshold && variant.stock_quantity > 0
      }))

      // Filtrar por stock si se requiere
      const availableVariants = filters.in_stock_only 
        ? variants.filter(v => v.is_in_stock)
        : variants

      // Filtrar por talle y color
      const filteredVariants = availableVariants.filter(variant => {
        if (filters.size && variant.size !== filters.size) return false
        if (filters.color && variant.color !== filters.color) return false
        return true
      })

      // Calcular rangos de precio
      const prices = filteredVariants.map(v => product.base_price + v.price_adjustment)
      const minPrice = prices.length > 0 ? Math.min(...prices) : product.base_price
      const maxPrice = prices.length > 0 ? Math.max(...prices) : product.base_price

      return {
        ...product,
        variants: filteredVariants,
        available_sizes: [...new Set(variants.map(v => v.size).filter((size): size is string => Boolean(size)))],
        available_colors: [...new Set(variants.map(v => v.color).filter((color): color is string => Boolean(color)))],
        price_range: {
          min: minPrice,
          max: maxPrice
        },
        total_stock: variants.reduce((sum, v) => sum + v.stock_quantity, 0)
      }
    })

    return processedProducts
  } catch (error) {
    console.error('Error fetching products:', error)
    // Durante el build, retornar array vacío en lugar de fallar
    return []
  }
}

/**
 * Obtiene un producto específico por slug con sus variantes
 */
export async function getProductBySlug(slug: string): Promise<ProductWithVariantsAndStock | null> {
  try {
    // Verificar si las variables de entorno están disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not found, using placeholder values for build')
      return null
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          sku,
          size,
          color,
          material,
          price_adjustment,
          stock_quantity,
          low_stock_threshold,
          is_active
        ),
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching product by slug:', error)
      return null
    }

    if (!data) return null

    const product = data as ProductWithVariantsQuery

    // Procesar variantes con stock
    const variants: VariantWithStock[] = (product.product_variants || []).map((variant) => ({
      ...variant,
      is_in_stock: variant.stock_quantity > 0,
      is_low_stock: variant.stock_quantity <= variant.low_stock_threshold && variant.stock_quantity > 0
    }))

    // Calcular rangos de precio
    const prices = variants.map(v => product.base_price + v.price_adjustment)
    const minPrice = prices.length > 0 ? Math.min(...prices) : product.base_price
    const maxPrice = prices.length > 0 ? Math.max(...prices) : product.base_price

    return {
      ...product,
      variants,
      available_sizes: [...new Set(variants.map(v => v.size).filter((size): size is string => Boolean(size)))],
      available_colors: [...new Set(variants.map(v => v.color).filter((color): color is string => Boolean(color)))],
      price_range: {
        min: minPrice,
        max: maxPrice
      },
      total_stock: variants.reduce((sum, v) => sum + v.stock_quantity, 0)
    }
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}

/**
 * Obtiene una variante específica por ID
 */
export async function getVariantById(variantId: string): Promise<VariantWithStock | null> {
  try {
    // Verificar si las variables de entorno están disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not found, using placeholder values for build')
      return null
    }

    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', variantId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching variant:', error)
      return null
    }

    if (!variant) {
      return null
    }

    const variantWithStock = variant as VariantQuery
    return {
      ...variantWithStock,
      is_in_stock: variantWithStock.stock_quantity > 0,
      is_low_stock: variantWithStock.stock_quantity <= variantWithStock.low_stock_threshold && variantWithStock.stock_quantity > 0
    }
  } catch (error) {
    console.error('Error fetching variant by ID:', error)
    return null
  }
}

/**
 * Busca una variante específica por producto y atributos
 */
export async function findVariantByAttributes(
  productId: string,
  size?: string,
  color?: string,
  material?: string
): Promise<VariantWithStock | null> {
  try {
    // Verificar si las variables de entorno están disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not found, using placeholder values for build')
      return null
    }

    let query = supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)

    if (size) query = query.eq('size', size)
    if (color) query = query.eq('color', color)
    if (material) query = query.eq('material', material)

    const { data: variant, error } = await query.single()

    if (error) {
      console.error('Error finding variant by attributes:', error)
      return null
    }

    if (!variant) {
      return null
    }

    const variantWithStock = variant as VariantQuery
    return {
      ...variantWithStock,
      is_in_stock: variantWithStock.stock_quantity > 0,
      is_low_stock: variantWithStock.stock_quantity <= variantWithStock.low_stock_threshold && variantWithStock.stock_quantity > 0
    }
  } catch (error) {
    console.error('Error finding variant by attributes:', error)
    return null
  }
}

/**
 * Obtiene todas las categorías activas
 */
export async function getCategories(): Promise<Category[]> {
  try {
    // Verificar si las variables de entorno están disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not found, using placeholder values for build')
      return []
    }

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return categories || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Obtiene productos destacados para la home
 */
export async function getFeaturedProducts(limit: number = 8): Promise<ProductWithVariantsAndStock[]> {
  try {
    // Verificar si las variables de entorno están disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not found, using placeholder values for build')
      return []
    }

    const response = await getProducts(
      { is_featured: true, in_stock_only: true },
      'featured',
      1,
      limit
    )

    return response
  } catch (error) {
    console.error('Error fetching products:', error)
    // Durante el build, retornar array vacío en lugar de fallar
    return []
  }
}