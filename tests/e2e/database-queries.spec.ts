import { test, expect } from '@playwright/test'

test('Verificar consultas de base de datos para dashboard', async ({ page }) => {
  console.log('🔍 Verificando consultas de base de datos...')
  
  // Crear endpoint de test para verificar las consultas
  const testQueries = async () => {
    const response = await page.request.post('http://localhost:3000/api/debug/test-queries', {
      data: {}
    })
    return response.json()
  }
  
  try {
    const result = await testQueries()
    console.log('🔧 Resultado de consultas:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.log('❌ Error al probar consultas:', error)
  }
})