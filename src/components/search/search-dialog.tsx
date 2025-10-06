'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { searchProducts } from '@/lib/supabase/products'
import { ProductCard } from '@/components/product/product-card'
import type { ProductWithVariantsAndStock } from '@/types/catalog'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ProductWithVariantsAndStock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState([
    'conjunto',
    'brasier',
    'panty',
    'negro',
    'rojo',
    'encaje'
  ])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saku-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Guardar búsqueda reciente
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return
    
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('saku-recent-searches', JSON.stringify(updated))
  }, [recentSearches])

  // Buscar productos cuando cambie el término de búsqueda
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const results = await searchProducts(debouncedSearchTerm, 6)
        setSearchResults(results.products || [])
      } catch (error) {
        console.error('Error searching products:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm])

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    saveRecentSearch(searchTerm.trim())
    router.push(`/productos?buscar=${encodeURIComponent(searchTerm.trim())}`)
    onOpenChange(false)
    setSearchTerm('')
  }

  // Manejar clic en sugerencia
  const handleSuggestionClick = (term: string) => {
    setSearchTerm(term)
    saveRecentSearch(term)
    router.push(`/productos?buscar=${encodeURIComponent(term)}`)
    onOpenChange(false)
    setSearchTerm('')
  }

  // Limpiar búsquedas recientes
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('saku-recent-searches')
  }

  // Limpiar búsqueda actual
  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">Buscar productos</DialogTitle>
        </DialogHeader>
        
        <div className="px-6">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Resultados de búsqueda */}
          {searchTerm && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Resultados
              </h3>
              
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-2" />
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {searchResults.map((product) => (
                      <div key={product.id} onClick={() => onOpenChange(false)}>
                        <ProductCard product={product} compact />
                      </div>
                    ))}
                  </div>
                  
                  {searchResults.length >= 6 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSuggestionClick(searchTerm)}
                    >
                      Ver todos los resultados para &ldquo;{searchTerm}&rdquo;
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron productos para &ldquo;{searchTerm}&rdquo;</p>
                </div>
              )}
            </div>
          )}

          {/* Búsquedas recientes */}
          {!searchTerm && recentSearches.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Búsquedas recientes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs"
                >
                  Limpiar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleSuggestionClick(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Búsquedas populares */}
          {!searchTerm && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Búsquedas populares
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSuggestionClick(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}