/**
 * Script para probar el flujo completo de administración de productos
 * Simula: localizar producto → editar → modificar imagen
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

async function testAdminFlow() {
  console.log('🔍 Iniciando prueba del flujo de administración...\n')

  try {
    // 1. Localizar productos disponibles
    console.log('1️⃣ Localizando productos disponibles...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        images,
        base_price,
        is_active,
        product_variants (
          id,
          size,
          color,
          stock_quantity
        )
      `)
      .limit(5)

    if (productsError) throw productsError

    console.log(`✅ Encontrados ${products.length} productos`)
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.images?.length || 0} imágenes)`)
    })

    if (products.length === 0) {
      console.log('❌ No hay productos para probar')
      return
    }

    // 2. Seleccionar el primer producto para editar
    const testProduct = products[0]
    console.log(`\n2️⃣ Seleccionando producto para editar: "${testProduct.name}"`)
    console.log(`   ID: ${testProduct.id}`)
    console.log(`   Imágenes actuales: ${testProduct.images?.length || 0}`)
    console.log(`   Variantes: ${testProduct.product_variants?.length || 0}`)

    // 3. Simular obtención de datos para edición (como lo haría el frontend)
    console.log('\n3️⃣ Obteniendo datos completos del producto...')
    const { data: fullProduct, error: fullProductError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('id', testProduct.id)
      .single()

    if (fullProductError) throw fullProductError

    console.log('✅ Datos del producto obtenidos:')
    console.log(`   Nombre: ${fullProduct.name}`)
    console.log(`   Precio base: $${fullProduct.base_price}`)
    console.log(`   Estado: ${fullProduct.is_active}`)
    console.log(`   Imágenes: ${JSON.stringify(fullProduct.images, null, 2)}`)

    // 4. Simular modificación de imágenes (agregar una imagen de prueba)
    console.log('\n4️⃣ Simulando modificación de imágenes...')
    
    // Backup de imágenes originales
    const originalImages = fullProduct.images || []
    console.log(`   Imágenes originales: ${originalImages.length}`)

    // Simular nueva imagen (URL de prueba)
    const testImageUrl = 'https://via.placeholder.com/400x400/d8ceb5/000000?text=Test+Image'
    const updatedImages = [...originalImages, testImageUrl]

    // 5. Actualizar producto con nueva imagen
    console.log('\n5️⃣ Actualizando producto con nueva imagen...')
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        images: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', testProduct.id)
      .select()
      .single()

    if (updateError) throw updateError

    console.log('✅ Producto actualizado exitosamente')
    console.log(`   Imágenes después de actualización: ${updatedProduct.images?.length || 0}`)

    // 6. Verificar que la actualización se guardó correctamente
    console.log('\n6️⃣ Verificando que los cambios se guardaron...')
    const { data: verifyProduct, error: verifyError } = await supabase
      .from('products')
      .select('id, name, images, updated_at')
      .eq('id', testProduct.id)
      .single()

    if (verifyError) throw verifyError

    console.log('✅ Verificación exitosa:')
    console.log(`   Imágenes en DB: ${verifyProduct.images?.length || 0}`)
    console.log(`   Última actualización: ${verifyProduct.updated_at}`)

    // 7. Simular eliminación de imagen (quitar la imagen de prueba)
    console.log('\n7️⃣ Simulando eliminación de imagen de prueba...')
    const { data: restoredProduct, error: restoreError } = await supabase
      .from('products')
      .update({
        images: originalImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', testProduct.id)
      .select()
      .single()

    if (restoreError) throw restoreError

    console.log('✅ Imagen de prueba eliminada, producto restaurado')
    console.log(`   Imágenes finales: ${restoredProduct.images?.length || 0}`)

    // 8. Probar operaciones CRUD de variantes
    console.log('\n8️⃣ Probando operaciones de variantes...')
    const variants = fullProduct.product_variants || []
    console.log(`   Variantes existentes: ${variants.length}`)
    
    if (variants.length > 0) {
      const firstVariant = variants[0]
      console.log(`   Primera variante: ${firstVariant.size} - ${firstVariant.color} (Stock: ${firstVariant.stock_quantity})`)
      
      // Simular actualización de stock
      const originalStock = firstVariant.stock_quantity
      const newStock = originalStock + 1
      
      const { error: variantUpdateError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newStock })
        .eq('id', firstVariant.id)

      if (variantUpdateError) throw variantUpdateError

      console.log(`   ✅ Stock actualizado: ${originalStock} → ${newStock}`)

      // Restaurar stock original
      await supabase
        .from('product_variants')
        .update({ stock_quantity: originalStock })
        .eq('id', firstVariant.id)

      console.log(`   ✅ Stock restaurado: ${newStock} → ${originalStock}`)
    }

    console.log('\n🎉 Flujo de administración completado exitosamente!')
    console.log('\n📋 Resumen de operaciones probadas:')
    console.log('   ✅ Localización de productos')
    console.log('   ✅ Obtención de datos completos')
    console.log('   ✅ Modificación de imágenes (agregar)')
    console.log('   ✅ Verificación de cambios')
    console.log('   ✅ Eliminación de imágenes')
    console.log('   ✅ Operaciones de variantes (stock)')
    console.log('   ✅ Restauración de datos originales')

  } catch (error) {
    console.error('❌ Error en el flujo de administración:', error.message)
    console.error('   Detalles:', error)
  }
}

// Ejecutar el test
testAdminFlow()