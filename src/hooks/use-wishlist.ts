'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: {
    id: string
    name: string
    sku: string
    base_price: number
    images?: string[]
  }
}

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Cargar items de la wishlist
  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([])
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('wishlist')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          product:products(
            id,
            name,
            sku,
            base_price,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading wishlist:', error)
        toast.error('Error al cargar la lista de favoritos')
        return
      }

      setWishlistItems(data || [])
    } catch (error) {
      console.error('Error loading wishlist:', error)
      toast.error('Error al cargar la lista de favoritos')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Agregar producto a la wishlist
  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para agregar favoritos')
      return false
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId
        } as any)

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('Este producto ya está en tus favoritos')
          return false
        }
        console.error('Error adding to wishlist:', error)
        toast.error('Error al agregar a favoritos')
        return false
      }

      toast.success('Producto agregado a favoritos')
      await loadWishlist() // Recargar la lista
      return true
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Error al agregar a favoritos')
      return false
    }
  }

  // Remover producto de la wishlist
  const removeFromWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión')
      return false
    }

    try {
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (error) {
        console.error('Error removing from wishlist:', error)
        toast.error('Error al remover de favoritos')
        return false
      }

      toast.success('Producto removido de favoritos')
      await loadWishlist() // Recargar la lista
      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Error al remover de favoritos')
      return false
    }
  }

  // Verificar si un producto está en la wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.product_id === productId)
  }

  // Toggle producto en wishlist
  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId)
    } else {
      return await addToWishlist(productId)
    }
  }

  // Cargar wishlist cuando el usuario cambie
  useEffect(() => {
    loadWishlist()
  }, [user, loadWishlist])

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    loadWishlist,
    wishlistCount: wishlistItems.length
  }
}