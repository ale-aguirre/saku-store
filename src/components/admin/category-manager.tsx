'use client'

import { useState, useEffect } from 'react'
import { createAdminClient } from '@/lib/supabase/admin-client'
// Removed auxiliary types import - using as any directly
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  FolderTree,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  product_count?: number
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const supabase = createAdminClient()
      
      // Get categories with product count
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          product_count:products(count)
        `)
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      
      // Process data to get product count
      const categoriesWithCount = data.map(category => ({
        ...category,
        product_count: (category.product_count as any)?.[0]?.count || 0
      }))
      
      setCategories(categoriesWithCount)
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('Error al cargar las categorías')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parent_id: category.parent_id || '',
        is_active: category.is_active
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: '',
        is_active: true
      })
    }
    setIsDialogOpen(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) return
    
    try {
      const supabase = createAdminClient()
      
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            parent_id: formData.parent_id || null,
            is_active: formData.is_active
          } as any)
          .eq('id', editingCategory.id)
        
        if (error) throw error
      } else {
        // Create new category
        // Get the next sort order
        const nextSortOrder = categories.length > 0 
          ? Math.max(...categories.map(cat => cat.sort_order)) + 1 
          : 0
        
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            parent_id: formData.parent_id || null,
            is_active: formData.is_active,
            sort_order: nextSortOrder
          } as any)
        
        if (error) throw error
      }
      
      // Refresh categories
      await fetchCategories()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error al guardar la categoría')
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return
    
    try {
      const supabase = createAdminClient()
      
      // Check if category has products
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)
      
      if (countError) throw countError
      
      if (count && count > 0) {
        alert(`No se puede eliminar esta categoría porque tiene ${count} productos asociados.`)
        return
      }
      
      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
      
      if (error) throw error
      
      // Refresh categories
      await fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error al eliminar la categoría')
    }
  }

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    try {
      const categoryIndex = categories.findIndex(c => c.id === categoryId)
      if (categoryIndex === -1) return
      
      // Can't move first category up or last category down
      if (
        (direction === 'up' && categoryIndex === 0) || 
        (direction === 'down' && categoryIndex === categories.length - 1)
      ) {
        return
      }
      
      const supabase = createAdminClient()
      
      const currentCategory = categories[categoryIndex]
      const targetIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1
      const targetCategory = categories[targetIndex]
      
      // Swap sort orders
      const { error: error1 } = await supabase
        .from('categories')
        .update({ sort_order: targetCategory.sort_order } as any)
        .eq('id', currentCategory.id)
      
      if (error1) throw error1
      
      const { error: error2 } = await supabase
        .from('categories')
        .update({ sort_order: currentCategory.sort_order } as any)
        .eq('id', targetCategory.id)
      
      if (error2) throw error2
      
      // Refresh categories
      await fetchCategories()
    } catch (error) {
      console.error('Error moving category:', error)
      alert('Error al mover la categoría')
    }
  }

  const toggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const supabase = createAdminClient()
      
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !isActive } as any)
        .eq('id', categoryId)
      
      if (error) throw error
      
      // Refresh categories
      await fetchCategories()
    } catch (error) {
      console.error('Error toggling category status:', error)
      alert('Error al cambiar el estado de la categoría')
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categorías
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Conjuntos"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Ej: conjuntos"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identificador único para URLs
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción de la categoría"
                  />
                </div>
                
                <div>
                  <Label htmlFor="parent_id">Categoría Padre</Label>
                  <select
                    id="parent_id"
                    value={formData.parent_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Ninguna (Categoría Principal)</option>
                    {categories
                      .filter(c => !editingCategory || c.id !== editingCategory.id)
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <Label htmlFor="is_active">Categoría activa</Label>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.slug}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {category.product_count} productos
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={category.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                        }
                        onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                      >
                        {category.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveCategory(category.id, 'up')}
                          disabled={categories.indexOf(category) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveCategory(category.id, 'down')}
                          disabled={categories.indexOf(category) === categories.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={(category.product_count || 0) > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No hay categorías. Crea una para organizar tus productos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}