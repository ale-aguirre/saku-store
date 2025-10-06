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
 * Obtiene productos con sus variantes y stock (optimizado con JOIN)
 */
export async function getProducts(
  filters: ProductFilters = {},
  sortBy: SortOption = 'featured',
  page = 1,
  limit = 12
): Promise<{
  products: ProductWithVariantsAndStock[]
  totalItems: number
  totalPages: number
}> {
  try {
    // Verificar si las variables de entorno están disponibles
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseAnonKey.includes('placeholder')) {
      console.log('Supabase environment variables not properly configured')
      return { products: [], totalItems: 0, totalPages: 0 }
    }

    // Verificar que el cliente de Supabase esté disponible
    if (!supabase) {
      console.error('Supabase client not available')
      return { products: [], totalItems: 0, totalPages: 0 }
    }

    // Construir query optimizada con JOIN para obtener todo en una sola consulta
    let baseQuery = supabase
        .from('products')
        .select(`
          *,
          product_variants!inner (
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
        `, { count: 'exact' })
        .eq('is_active', true)
        .eq('product_variants.is_active', true)

    // Aplicar filtros
    if (filters.category_id) {
      baseQuery = baseQuery.eq('category_id', filters.category_id)
    }

    if (filters.is_featured) {
      baseQuery = baseQuery.eq('is_featured', true)
    }

    if (filters.search) {
      baseQuery = baseQuery.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%`)
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case 'price_asc':
        baseQuery = baseQuery.order('base_price', { ascending: true })
        break
      case 'price_desc':
        baseQuery = baseQuery.order('base_price', { ascending: false })
        break
      case 'newest':
        baseQuery = baseQuery.order('created_at', { ascending: false })
        break
      case 'name':
        baseQuery = baseQuery.order('name', { ascending: true })
        break
      case 'featured':
      default:
        baseQuery = baseQuery.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
        break
    }

    // Obtener productos con paginación (ya incluye variantes y categorías por JOIN)
    const { data: rawProducts, error: productsError, count: totalItems } = await baseQuery
      .range((page - 1) * limit, page * limit - 1)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return { products: [], totalItems: 0, totalPages: 0 }
    }

    if (!rawProducts || rawProducts.length === 0) {
      return { products: [], totalItems: 0, totalPages: 0 }
    }

    const totalPages = Math.ceil((totalItems || 0) / limit)

    // Agrupar productos por ID (ya que el JOIN puede duplicar productos con múltiples variantes)
    const productsMap = new Map<string, any>()
    
    rawProducts.forEach((item: any) => {
      if (!productsMap.has(item.id)) {
        productsMap.set(item.id, {
          ...item,
          product_variants: [],
          categories: item.categories
        })
      }
      
      // Agregar variantes al producto
      if (item.product_variants && item.product_variants.length > 0) {
        const existingProduct = productsMap.get(item.id)!
        item.product_variants.forEach((variant: any) => {
          // Evitar duplicados de variantes
          if (!existingProduct.product_variants.find((v: any) => v.id === variant.id)) {
            existingProduct.product_variants.push(variant)
          }
        })
      }
    })

    // Procesar productos con variantes y stock (optimizado)
    const processedProducts: ProductWithVariantsAndStock[] = Array.from(productsMap.values())
      .map((product: any) => {
        const variants = product.product_variants || []
        const category = product.categories
        
        const variantsWithStock: VariantWithStock[] = variants.map((variant: any) => ({
          ...variant,
          is_in_stock: variant.stock_quantity > 0,
          is_low_stock: variant.stock_quantity <= variant.low_stock_threshold && variant.stock_quantity > 0
        }))

        // Filtrar por stock si se requiere
        const availableVariants = filters.in_stock_only 
          ? variantsWithStock.filter(v => v.is_in_stock)
          : variantsWithStock

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
          available_sizes: [...new Set(variantsWithStock.map(v => v.size).filter((size): size is string => Boolean(size)))],
          available_colors: [...new Set(variantsWithStock.map(v => v.color).filter((color): color is string => Boolean(color)))],
          price_range: {
            min: minPrice,
            max: maxPrice
          },
          total_stock: variantsWithStock.reduce((sum, v) => sum + (v.stock_quantity || 0), 0),
          categories: category
        }
      })
      .filter((product) => {
        // Filtrar por rango de precio después del procesamiento
        if (filters.min_price && product.price_range.max < filters.min_price) return false
        if (filters.max_price && product.price_range.min > filters.max_price) return false
        
        // Filtrar productos sin variantes válidas después de aplicar filtros
        if (product.variants.length === 0) return false
        
        return true
      })

    return {
      products: processedProducts,
      totalItems: totalItems || 0,
      totalPages
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    // Durante el build, retornar array vacío en lugar de fallar
    return { products: [], totalItems: 0, totalPages: 0 }
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
    const prices = variants.map(v => (product.base_price || 0) + (v.price_adjustment || 0))
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
      total_stock: variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
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

    return response.products
  } catch (error) {
    console.error('Error fetching products:', error)
    // Durante el build, retornar array vacío en lugar de fallar
    return []
  }
}

/**
 * Obtiene el rango de precios disponible para filtros
 */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  try {
    // Verificar si las variables de entorno están disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase environment variables not found, using placeholder values for build')
      return { min: 0, max: 20000 }
    }

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        base_price,
        product_variants (
          price_adjustment
        )
      `)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching price range:', error)
      return { min: 0, max: 20000 }
    }

    if (!products || products.length === 0) {
      return { min: 0, max: 20000 }
    }

    const allPrices: number[] = []
    
    products.forEach((product: any) => {
      const basePrice = product.base_price
      if (product.product_variants && product.product_variants.length > 0) {
        product.product_variants.forEach((variant: any) => {
          allPrices.push(basePrice + variant.price_adjustment)
        })
      } else {
        allPrices.push(basePrice)
      }
    })

    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)

    return {
      min: Math.floor(minPrice / 500) * 500, // Redondear hacia abajo a múltiplo de 500
      max: Math.ceil(maxPrice / 500) * 500   // Redondear hacia arriba a múltiplo de 500
    }
  } catch (error) {
    console.error('Error fetching price range:', error)
    return { min: 0, max: 20000 }
  }
}

/**
 * Función optimizada para búsqueda de productos
 */
export async function searchProducts(
  searchTerm: string,
  limit: number = 10
): Promise<{ products: ProductWithVariantsAndStock[]; totalItems: number }> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { products: [], totalItems: 0 }
    }

    // Búsqueda simplificada para depuración
    const { data: products, error, count } = await supabase
      .from('products')
      .select(`
        *,
        product_variants!inner (
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
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('product_variants.is_active', true)
      .or(`name.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching products:', error)
      return { products: [], totalItems: 0 }
    }

    if (!products || products.length === 0) {
      return { products: [], totalItems: 0 }
    }

    // Transformar datos al formato esperado usando el mismo patrón que getProducts
    const productsMap = new Map()
    
    products.forEach((product: any) => {
      if (!productsMap.has(product.id)) {
        productsMap.set(product.id, {
          ...product,
          product_variants: []
        })
      }
      
      if (product.product_variants) {
        const existingProduct = productsMap.get(product.id)
        product.product_variants.forEach((variant: any) => {
          if (!existingProduct.product_variants.find((v: any) => v.id === variant.id)) {
            existingProduct.product_variants.push(variant)
          }
        })
      }
    })

    // Procesar productos con variantes y stock
    const processedProducts: ProductWithVariantsAndStock[] = Array.from(productsMap.values())
      .map((product: any) => {
        const variants = product.product_variants || []
        const category = product.categories
        
        const variantsWithStock: VariantWithStock[] = variants.map((variant: any) => ({
          ...variant,
          is_in_stock: variant.stock_quantity > 0,
          is_low_stock: variant.stock_quantity <= variant.low_stock_threshold && variant.stock_quantity > 0
        }))

        // Calcular rangos de precio
        const prices = variantsWithStock.map(v => product.base_price + v.price_adjustment)
        const minPrice = prices.length > 0 ? Math.min(...prices) : product.base_price
        const maxPrice = prices.length > 0 ? Math.max(...prices) : product.base_price

        return {
          ...product,
          variants: variantsWithStock,
          available_sizes: [...new Set(variantsWithStock.map(v => v.size).filter((size): size is string => Boolean(size)))],
          available_colors: [...new Set(variantsWithStock.map(v => v.color).filter((color): color is string => Boolean(color)))],
          price_range: {
            min: minPrice,
            max: maxPrice
          },
          total_stock: variantsWithStock.reduce((sum, v) => sum + (v.stock_quantity || 0), 0),
          categories: category
        }
      })

    return {
      products: processedProducts,
      totalItems: count || 0
    }
  } catch (error) {
    console.error('Error in searchProducts:', error)
    return { products: [], totalItems: 0 }
  }
}