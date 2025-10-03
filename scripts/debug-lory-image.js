import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

// Usar el mismo cliente que usa el frontend
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugLoryImage() {
  console.log('🔍 Debuggeando imagen del producto "lory"...\n')

  try {
    // Simular exactamente la misma query que hace el frontend
    console.log('1️⃣ Query desde el frontend (useProduct hook):')
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', 'lory')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('❌ Error al obtener producto:', error.message)
      return
    }

    if (!product) {
      console.log('⚠️  Producto "lory" no encontrado o no está activo')
      return
    }

    console.log('📦 Producto encontrado:')
    console.log('   ID:', product.id)
    console.log('   Nombre:', product.name)
    console.log('   Slug:', product.slug)
    console.log('   Activo:', product.is_active)
    console.log('   Imágenes (raw):', JSON.stringify(product.images, null, 2))
    console.log('   Tipo de images:', typeof product.images)
    console.log('   Es array:', Array.isArray(product.images))
    
    if (Array.isArray(product.images)) {
      console.log('   Primera imagen (product.images[0]):', product.images[0])
      console.log('   Longitud del array:', product.images.length)
      
      product.images.forEach((img, index) => {
        console.log(`   Imagen ${index}:`, `"${img}"`)
        console.log(`   Longitud: ${img ? img.length : 'null'}`)
        console.log(`   Contiene salto de línea: ${img ? img.includes('\n') : 'N/A'}`)
        console.log(`   Contiene espacios: ${img ? img.includes(' ') : 'N/A'}`)
      })
    }

    console.log('\n2️⃣ Simulando lo que ve ProductCard:')
    const primaryImage = product.images?.[0]
    console.log('   primaryImage:', `"${primaryImage}"`)
    console.log('   primaryImage válida:', !!primaryImage)
    console.log('   primaryImage limpia:', primaryImage ? primaryImage.trim() : 'N/A')

    console.log('\n3️⃣ Verificando acceso directo a la URL:')
    if (primaryImage) {
      const cleanUrl = primaryImage.trim().replace(/\s+/g, '')
      console.log('   URL limpia:', cleanUrl)
      
      try {
        const response = await fetch(cleanUrl, { method: 'HEAD' })
        console.log('   Status HTTP:', response.status)
        console.log('   Content-Type:', response.headers.get('content-type'))
        console.log('   Accesible:', response.ok ? '✅' : '❌')
      } catch (fetchError) {
        console.log('   Error al acceder:', fetchError.message)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

debugLoryImage()