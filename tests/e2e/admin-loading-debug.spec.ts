import { test, expect } from '@playwright/test'

test('Diagnosticar problema de carga en página de admin', async ({ page }) => {
  console.log('🔍 Iniciando diagnóstico de carga de admin...')
  
  // Navegar a login
  await page.goto('/auth/login')
  
  // Login
  await page.fill('input[name="email"]', 'admin@saku.com')
  await page.fill('input[name="password"]', 'admin123')
  await page.click('button[type="submit"]')
  
  // Esperar redirección
  await page.waitForURL('/admin')
  console.log('📍 Redirigido a admin')
  
  // Esperar más tiempo para que la página cargue completamente
  console.log('⏳ Esperando 15 segundos para carga completa...')
  await page.waitForTimeout(15000)
  
  // Verificar si hay elementos de carga
  const loadingElements = await page.locator('[data-testid*="loading"], .loading, [class*="loading"], [class*="spinner"]').count()
  console.log(`⏳ Elementos de carga encontrados: ${loadingElements}`)
  
  // Verificar si hay errores en consola
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  // Buscar elementos específicos del dashboard
  const h1Elements = await page.locator('h1').count()
  const panelTitle = await page.locator('text=Panel de Administración').count()
  const statsCards = await page.locator('[data-testid="stats-card"], .stats-card, [class*="stats"]').count()
  const quickActions = await page.locator('text=Acciones Rápidas').count()
  
  console.log(`📝 Elementos H1: ${h1Elements}`)
  console.log(`🎛️ Título Panel: ${panelTitle}`)
  console.log(`📊 Tarjetas de stats: ${statsCards}`)
  console.log(`⚡ Acciones rápidas: ${quickActions}`)
  
  // Verificar el contenido completo de la página
  const pageContent = await page.content()
  const hasReactError = pageContent.includes('Error') || pageContent.includes('error')
  const hasLoadingState = pageContent.includes('loading') || pageContent.includes('Loading')
  
  console.log(`❌ Contiene errores: ${hasReactError}`)
  console.log(`⏳ Contiene estados de carga: ${hasLoadingState}`)
  
  // Verificar si hay elementos específicos del dashboard
  const dashboardElements = await page.locator('text=Dashboard, text=Productos, text=Órdenes, text=Usuarios').count()
  console.log(`🎛️ Elementos de navegación: ${dashboardElements}`)
  
  // Verificar el estado de autenticación
  const authResponse = await page.request.get('/api/debug/auth')
  const authData = await authResponse.json()
  console.log('🔧 Estado de auth:', authData)
  
  // Verificar las consultas de base de datos
  const dbResponse = await page.request.get('/api/debug/test-queries')
  const dbData = await dbResponse.json()
  console.log('🗄️ Estado de DB:', dbData.summary)
  
  // Tomar screenshot para análisis visual
  await page.screenshot({ path: 'admin-loading-debug.png', fullPage: true })
  console.log('📸 Screenshot guardado como admin-loading-debug.png')
  
  // El test pasa independientemente para obtener información de diagnóstico
  expect(true).toBe(true)
})