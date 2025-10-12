'use server'

import { createSupabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schema para validar datos de producto (solo campos que existen en la tabla)
const ProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().nullable().optional(),
  slug: z.string().min(1, 'El slug es requerido'),
  category_id: z.string().uuid('ID de categoría inválido').nullable().optional(),
  base_price: z.number().positive('El precio debe ser positivo'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().nullable().default(false),
  images: z.any().nullable().optional(), // Json type
  material: z.any().nullable().optional(), // Json type
  care_instructions: z.string().nullable().optional(),
  size_guide: z.any().nullable().optional(), // Json type
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional()
})

export async function createProduct(formData: FormData) {
  try {
    const supabase = createSupabaseAdmin()
    
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      slug: formData.get('slug') as string,
      category_id: formData.get('category_id') as string || null,
      base_price: parseFloat(formData.get('base_price') as string),
      is_active: formData.get('is_active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
      images: formData.get('images') ? JSON.parse(formData.get('images') as string) : null,
      material: formData.get('material') ? JSON.parse(formData.get('material') as string) : null,
      care_instructions: formData.get('care_instructions') as string || null,
      size_guide: formData.get('size_guide') ? JSON.parse(formData.get('size_guide') as string) : null,
      meta_title: formData.get('meta_title') as string || null,
      meta_description: formData.get('meta_description') as string || null
    }

    const validatedData = ProductSchema.parse(data)

    const { data: product, error } = await supabase
      .from('products')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/productos')
    return { success: true, data: product }
  } catch (error) {
    console.error('Error in createProduct:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: 'Error interno del servidor' }
  }
}

// Función auxiliar para generar slug único
async function generateUniqueSlug(supabase: any, name: string, currentProductId: string): Promise<string> {
  const baseSlug = name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  let slug = baseSlug
  let counter = 1

  while (true) {
    // Verificar si el slug ya existe (excluyendo el producto actual)
    const { error } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .neq('id', currentProductId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No se encontró producto con este slug, es único
      return slug
    }

    if (error) {
      // Error inesperado
      throw error
    }

    // Si existe, agregar contador
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const supabase = createSupabaseAdmin()
    
    // Obtener el producto actual para preservar su slug si es posible
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('slug, name')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching current product:', fetchError)
      return { success: false, error: 'Error al obtener el producto actual' }
    }

    const newName = formData.get('name') as string
    let slug = currentProduct.slug

    // Si el nombre cambió o no hay slug, generar uno nuevo único
    if (!slug || currentProduct.name !== newName) {
      slug = await generateUniqueSlug(supabase, newName, id)
    }
    
    const data = {
      name: newName,
      description: formData.get('description') as string || null,
      sku: formData.get('sku') as string,
      slug: slug,
      category_id: formData.get('category_id') as string || null,
      base_price: parseFloat(formData.get('base_price') as string),
      is_active: formData.get('is_active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
      images: formData.get('images') ? JSON.parse(formData.get('images') as string) : null
    }

    const validatedData = ProductSchema.parse(data)

    const { data: product, error } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/productos')
    return { success: true, data: product }
  } catch (error) {
    console.error('Error in updateProduct:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: 'Error interno del servidor' }
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = createSupabaseAdmin()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteProduct:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}