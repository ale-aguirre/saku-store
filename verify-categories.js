const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyCategories() {
  console.log('🔍 Verificando categorías y productos...\n')

  try {
    // 1. Obtener todas las categorías
    console.log('📂 Categorías disponibles:')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (categoriesError) {
      console.error('Error obteniendo categorías:', categoriesError)
      return
    }

    if (!categories || categories.length === 0) {
      console.log('❌ No se encontraron categorías')
      return
    }

    categories.forEach(cat => {
      console.log(`  - ${cat.name} (slug: ${cat.slug}, id: ${cat.id}, activa: ${cat.is_active})`)
    })

    console.log('\n📦 Productos por categoría:')

    // 2. Obtener productos por cada categoría
    for (const category of categories) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, category_id')
        .eq('category_id', category.id)
        .eq('is_active', true)

      if (productsError) {
        console.error(`Error obteniendo productos para ${category.name}:`, productsError)
        continue
      }

      console.log(`\n  ${category.name} (${category.slug}):`)
      if (!products || products.length === 0) {
        console.log('    ❌ Sin productos')
      } else {
        products.forEach(product => {
          console.log(`    - ${product.name} (id: ${product.id})`)
        })
      }
    }

    // 3. Verificar productos sin categoría
    console.log('\n🔍 Productos sin categoría:')
    const { data: orphanProducts, error: orphanError } = await supabase
      .from('products')
      .select('id, name, category_id')
      .is('category_id', null)
      .eq('is_active', true)

    if (orphanError) {
      console.error('Error obteniendo productos sin categoría:', orphanError)
    } else if (!orphanProducts || orphanProducts.length === 0) {
      console.log('  ✅ Todos los productos tienen categoría asignada')
    } else {
      orphanProducts.forEach(product => {
        console.log(`  - ${product.name} (id: ${product.id})`)
      })
    }

    // 4. Probar filtro por categoría
    console.log('\n🧪 Probando filtro por categoría "conjuntos":')
    const { data: filteredProducts, error: filterError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        categories!inner (
          id,
          name,
          slug
        )
      `)
      .eq('categories.slug', 'conjuntos')
      .eq('is_active', true)

    if (filterError) {
      console.error('Error filtrando por categoría:', filterError)
    } else if (!filteredProducts || filteredProducts.length === 0) {
      console.log('  ❌ No se encontraron productos con categoría "conjuntos"')
    } else {
      console.log(`  ✅ Encontrados ${filteredProducts.length} productos:`)
      filteredProducts.forEach(product => {
        console.log(`    - ${product.name}`)
      })
    }

  } catch (error) {
    console.error('Error general:', error)
  }
}

verifyCategories()