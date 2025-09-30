// Script de depuración para probar la función getProducts
import { getProducts } from './src/lib/supabase/products.js'

async function debugProducts() {
  console.log('Testing getProducts function...')
  
  try {
    const result = await getProducts({}, 'featured', 1, 12)
    console.log('Result:', result)
    console.log('Products count:', result.products.length)
    console.log('Total items:', result.totalItems)
    console.log('Total pages:', result.totalPages)
    
    if (result.products.length > 0) {
      console.log('First product:', result.products[0])
    }
  } catch (error) {
    console.error('Error testing getProducts:', error)
  }
}

debugProducts()