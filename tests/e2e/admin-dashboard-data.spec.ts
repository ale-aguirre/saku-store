import { test, expect } from '@playwright/test'

test('Verificar que fetchDashboardData funciona correctamente', async ({ page }) => {
  console.log('🔍 Verificando fetchDashboardData...')
  
  // Login como admin
  await page.goto('http://localhost:3000/auth/login')
  await page.fill('input[name="email"]', 'admin@saku.com')
  await page.fill('input[name="password"]', 'admin123')
  await page.click('button[type="submit"]')
  
  // Esperar redirección a admin
  await page.waitForURL('**/admin', { timeout: 10000 })
  console.log('✅ Login exitoso, redirigido a admin')
  
  // Interceptar las llamadas a la API de Supabase para ver si hay errores
  const apiCalls: any[] = []
  const apiErrors: any[] = []
  
  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('supabase.co') || url.includes('rest/v1')) {
      const call = {
        url,
        status: response.status(),
        method: response.request().method()
      }
      
      if (response.status() >= 400) {
        try {
          const errorBody = await response.text()
          apiErrors.push({ ...call, error: errorBody })
          console.log('❌ Error en API:', call, errorBody)
        } catch (e) {
          apiErrors.push({ ...call, error: 'Could not read error body' })
        }
      } else {
        apiCalls.push(call)
        console.log('✅ API call exitosa:', call)
      }
    }
  })
  
  // Esperar un poco para que se ejecuten las consultas
  await page.waitForTimeout(5000)
  
  // Verificar si hay elementos de la página cargados
  const hasH1 = await page.locator('h1').count()
  const hasStats = await page.locator('[data-testid="stats-card"]').count()
  const hasOrders = await page.locator('[data-testid="recent-orders"]').count()
  const hasProducts = await page.locator('[data-testid="products-list"]').count()
  const hasLoading = await page.locator('[data-testid="loading"]').count()
  
  console.log('📊 Elementos encontrados:')
  console.log(`  - H1: ${hasH1}`)
  console.log(`  - Stats cards: ${hasStats}`)
  console.log(`  - Recent orders: ${hasOrders}`)
  console.log(`  - Products list: ${hasProducts}`)
  console.log(`  - Loading indicators: ${hasLoading}`)
  
  console.log('📡 Resumen de API calls:')
  console.log(`  - Calls exitosas: ${apiCalls.length}`)
  console.log(`  - Calls con error: ${apiErrors.length}`)
  
  if (apiErrors.length > 0) {
    console.log('❌ Errores de API encontrados:')
    apiErrors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.method} ${error.url} - Status: ${error.status}`)
      console.log(`     Error: ${error.error}`)
    })
  }
  
  // Verificar el estado de autenticación
  const authResponse = await page.request.get('http://localhost:3000/api/debug/auth')
  const authData = await authResponse.json()
  console.log('🔧 Estado de auth:', authData)
  
  // Verificar si las consultas de base de datos funcionan
  const dbResponse = await page.request.post('http://localhost:3000/api/debug/test-queries')
  const dbData = await dbResponse.json()
  console.log('🗄️ Estado de consultas DB:', dbData.summary)
  
  if (!dbData.summary.allPassed) {
    console.log('❌ Consultas DB que fallaron:')
    Object.entries(dbData.results).forEach(([key, result]: [string, any]) => {
      if (!result.success) {
        console.log(`  - ${key}: ${result.error}`)
      }
    })
  }
})