'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { mockProducts } from '@/lib/mock-data'
import { getProductBySlug, getPriceRange, getProducts } from '@/lib/supabase/products'

export interface Product {
  id: string
  name: string
  description: string
  category: string
  image_url: string
  is_active: boolean
  created_at: string
  updated_at: string
  product_variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string
  price: number
  compare_at_price: number | null
  stock_quantity: number
  sku: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  category?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'created_at'
}

export interface UseProductsParams {
  categoryId?: string
  sortBy?: 'featured' | 'name' | 'price_asc' | 'price_desc' | 'newest'
  page?: number
  limit?: number
  search?: string
  sizes?: string[]
  colors?: string[]
  minPrice?: number
  maxPrice?: number
}

export function useProducts({
  categoryId,
  sortBy = 'featured',
  page = 1,
  limit = 12,
  search,
  sizes,
  colors,
  minPrice,
  maxPrice
}: UseProductsParams = {}) {
  const _supabase = createClient()

  return useQuery({
    queryKey: ['products', { categoryId, sortBy, page, limit, search, sizes, colors, minPrice, maxPrice }],
    queryFn: () => {
      const filters = {
        category_id: categoryId,
        search,
        sizes,
        colors,
        min_price: minPrice,
        max_price: maxPrice
      }
      return getProducts(filters)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}



export function useProduct(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
        // Use mock data when Supabase is not configured
        console.warn('Supabase not configured, using mock data')
        const mockProduct = mockProducts.find(p => p.id === id)
        if (!mockProduct) {
          throw new Error('Product not found')
        }
        return mockProduct
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (
            id,
            size,
            color,
            price,
            compare_at_price,
            stock_quantity,
            sku,
            is_active
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        // Use mock data when Supabase is not available
        console.warn('Supabase error, using mock data:', error.message)
        const mockProduct = mockProducts.find(p => p.id === id)
        if (!mockProduct) {
          throw new Error('Product not found')
        }
        return mockProduct
      }
      return data as Product
    },
    enabled: !!id,
  })
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  })
}

export function useProductCategories() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)

      if (error) {
        throw error
      }

      if (!data) {
        return []
      }

      const categories = [...new Set(data.map((item: any) => item.category).filter(Boolean))] as string[]
      return categories.map(category => ({ 
        id: category, 
        name: category, 
        slug: category.toLowerCase().replace(/\s+/g, '-') 
      }))
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useProductSizes() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['product-sizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('size')
        .eq('is_active', true)
        .gt('stock_quantity', 0)

      if (error) {
        throw error
      }

      if (!data) {
        return []
      }

      const sizes = [...new Set(data.map((item: any) => item.size).filter(Boolean))] as string[]
      return sizes.sort().map(size => ({ id: size, name: size }))
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useProductColors() {
  return useQuery({
    queryKey: ['product-colors'],
    queryFn: async () => {
      try {
        const _supabase = createClient()
        const { data, error } = await _supabase
          .from('product_variants')
          .select('color')
          .eq('is_active', true)
          .gt('stock_quantity', 0)

        if (error) throw error

        // Get unique colors
        const uniqueColors = [...new Set(data.map((variant: any) => variant.color))]
        return uniqueColors.filter(Boolean)
      } catch (error) {
        console.error('Error fetching product colors:', error)
        return ['negro', 'rojo', 'blanco'] // fallback colors
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function usePriceRange() {
  return useQuery({
    queryKey: ['price-range'],
    queryFn: async () => {
      try {
        return await getPriceRange()
      } catch (error) {
        console.error('Error fetching price range:', error)
        return { min: 5000, max: 15000 } // fallback range
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}