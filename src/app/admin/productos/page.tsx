'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/utils'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy,
  Package,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import Image from 'next/image'

interface ProductVariant {
  id: string
  size: string
  color: string
  stock_quantity: number
  low_stock_threshold: number
}

interface Product {
  id: string
  name: string
  description: string
  base_price: number
  price: number
  promotional_price?: number
  status: string
  created_at: string
  tags?: string[]
  images?: string[]
  product_variants: ProductVariant[]
}

const ITEMS_PER_PAGE = 20

export default function AdminProductsPage() {
  const { user, loading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      let query = supabase
        .from('products')
        .select(`
          *,
          product_variants (
            id,
            size,
            color,
            stock_quantity,
            low_stock_threshold
          )
        `, { count: 'exact' })

      // Aplicar filtros
      if (statusFilter !== 'all') {
        if (statusFilter === 'no_stock') {
          // Este filtro se aplicará después en el cliente
        } else {
          query = query.eq('status', statusFilter)
        }
      }

      // Aplicar búsqueda
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // Aplicar ordenamiento
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'a_z':
          query = query.order('name', { ascending: true })
          break
        case 'z_a':
          query = query.order('name', { ascending: false })
          break
      }

      // Aplicar paginación
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      let filteredData = data || []

      // Filtrar productos sin stock en el cliente
      if (statusFilter === 'no_stock') {
        filteredData = filteredData.filter((product: Product) => 
          getTotalStock(product.product_variants) === 0
        )
      }

      setProducts(filteredData)
      setTotalProducts(count || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter, sortBy])

  useEffect(() => {
    if (!loading && user) {
      fetchProducts()
    }
  }, [user, loading, fetchProducts])

  const getTotalStock = (variants: ProductVariant[]) => {
    return variants.reduce((sum, variant) => sum + variant.stock_quantity, 0)
  }

  const getVariantChips = (variants: ProductVariant[]) => {
    const sizes = [...new Set(variants.map(v => v.size))].sort()
    const colors = [...new Set(variants.map(v => v.color))]
    
    return { sizes, colors }
  }

  const hasLowStock = (variants: ProductVariant[]) => {
    return variants.some(variant => 
      variant.stock_quantity <= variant.low_stock_threshold && variant.stock_quantity > 0
    )
  }

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE)

  if (loading || isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Acceso restringido</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">{totalProducts} productos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Organizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Link href="/admin/productos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar producto
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Busca por nombre, SKU o tags"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="no_stock">Sin stock</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más nuevo</SelectItem>
                  <SelectItem value="oldest">Más antiguo</SelectItem>
                  <SelectItem value="a_z">A-Z</SelectItem>
                  <SelectItem value="z_a">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Producto</TableHead>
                <TableHead className="w-[100px]">Stock</TableHead>
                <TableHead className="w-[120px]">Precio</TableHead>
                <TableHead className="w-[120px]">Promocional</TableHead>
                <TableHead className="w-[200px]">Variantes</TableHead>
                <TableHead className="w-[120px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const totalStock = getTotalStock(product.product_variants)
                const { sizes, colors } = getVariantChips(product.product_variants)
                const lowStock = hasLowStock(product.product_variants)
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images && product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.description}
                          </p>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {product.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {product.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className={`font-medium ${
                          totalStock === 0 
                            ? 'text-red-600' 
                            : lowStock
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                        }`}>
                          {totalStock}
                        </span>
                        {totalStock === 0 && (
                          <Badge variant="destructive" className="text-xs w-fit">
                            Sin stock
                          </Badge>
                        )}
                        {lowStock && totalStock > 0 && (
                          <Badge variant="outline" className="text-xs w-fit text-yellow-600">
                            Stock bajo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatPrice(product.base_price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.promotional_price ? (
                        <span className="font-medium text-green-600">
                          {formatPrice(product.promotional_price)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {sizes.map((size) => (
                            <Badge key={size} variant="outline" className="text-xs">
                              {size}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {colors.map((color) => (
                            <Badge key={color} variant="secondary" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/productos/${product.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {products.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No se encontraron productos' : 'No hay productos'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Comienza agregando tu primer producto'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/admin/productos/nuevo">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Producto
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} de {totalProducts} productos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}