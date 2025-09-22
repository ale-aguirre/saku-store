'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

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
  size: string
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

export function useProducts(filters: ProductFilters = {}, sortBy: string = 'created_at') {
  const supabase = createClient()

  return useQuery({
    queryKey: ['products', filters, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_variants (*)
        `)
        .eq('is_active', true)

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Sort
      switch (sortBy) {
        case 'name':
          query = query.order('name')
          break
        case 'price-low':
          // We'll sort by minimum variant price on the client side
          break
        case 'price-high':
          // We'll sort by maximum variant price on the client side
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'featured':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      let products = data as Product[]

      // Filter by variant properties (size, color, price)
      if (filters.size || filters.color || filters.minPrice || filters.maxPrice) {
        products = products.filter(product => {
          const variants = product.product_variants.filter(variant => {
            if (!variant.is_active || variant.stock_quantity <= 0) return false
            
            if (filters.size && variant.size !== filters.size) return false
            if (filters.color && variant.color !== filters.color) return false
            if (filters.minPrice && variant.price < filters.minPrice) return false
            if (filters.maxPrice && variant.price > filters.maxPrice) return false
            
            return true
          })
          
          return variants.length > 0
        })
      }

      // Client-side sorting for price-based sorts
      if (sortBy === 'price-low') {
        products.sort((a, b) => {
          const minPriceA = Math.min(...a.product_variants.map(v => v.price))
          const minPriceB = Math.min(...b.product_variants.map(v => v.price))
          return minPriceA - minPriceB
        })
      } else if (sortBy === 'price-high') {
        products.sort((a, b) => {
          const maxPriceA = Math.max(...a.product_variants.map(v => v.price))
          const maxPriceB = Math.max(...b.product_variants.map(v => v.price))
          return maxPriceB - maxPriceA
        })
      }

      return products
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProduct(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
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

      if (error) throw error
      return data as Product
    },
    enabled: !!id,
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
        .eq('is_active', true) as { data: { category: string | null }[] | null, error: any }

      if (error) {
        throw error
      }

      if (!data) {
        return []
      }

      const categories = [...new Set(data.map(item => item.category).filter(Boolean))] as string[]
      return categories.map(category => ({ id: category, name: category }))
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
        .gt('stock_quantity', 0) as { data: { size: string | null }[] | null, error: any }

      if (error) {
        throw error
      }

      if (!data) {
        return []
      }

      const sizes = [...new Set(data.map(item => item.size).filter(Boolean))] as string[]
      return sizes.sort().map(size => ({ id: size, name: size }))
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useProductColors() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['product-colors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('color')
        .eq('is_active', true)
        .gt('stock_quantity', 0) as { data: { color: string | null }[] | null, error: any }

      if (error) {
        throw error
      }

      if (!data) {
        return []
      }

      const colors = [...new Set(data.map(item => item.color).filter(Boolean))] as string[]
      return colors.sort().map(color => ({ id: color, name: color }))
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}