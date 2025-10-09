const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

// Función para generar slug desde el nombre
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones duplicados
}

async function fixProductSlugs() {
  try {
    console.log('Obteniendo productos sin slug...')
    
    // Obtener productos sin slug
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug')
      .is('slug', null)
    
    if (error) {
      console.error('Error al obtener productos:', error)
      return
    }
    
    console.log(`Encontrados ${products.length} productos sin slug`)
    
    if (products.length === 0) {
      console.log('Todos los productos ya tienen slug')
      return
    }
    
    // Generar y actualizar slugs
    for (const product of products) {
      const slug = generateSlug(product.name)
      console.log(`Generando slug para "${product.name}": ${slug}`)
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ slug })
        .eq('id', product.id)
      
      if (updateError) {
        console.error(`Error al actualizar producto ${product.id}:`, updateError)
      } else {
        console.log(`✓ Slug actualizado para "${product.name}"`)
      }
    }
    
    console.log('\n¡Slugs generados exitosamente!')
    
    // Verificar resultados
    const { data: updatedProducts, error: verifyError } = await supabase
      .from('products')
      .select('id, name, slug')
      .limit(10)
    
    if (!verifyError && updatedProducts) {
      console.log('\nPrimeros 10 productos con sus slugs:')
      updatedProducts.forEach(product => {
        console.log(`${product.name}: /productos/${product.slug}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixProductSlugs()