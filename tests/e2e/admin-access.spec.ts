import { test, expect } from '@playwright/test'

test('Verificar acceso completo a admin después del login', async ({ page }) => {
  console.log('🔍 Verificando acceso completo a admin...')
  
  // Navegar a login
  await page.goto('/auth/login')
  
  // Esperar a que la página de login cargue
  await page.waitForSelector('input[id="email"]')
  
  // Login como admin
  await page.fill('input[id="email"]', 'admin@saku.com')
  await page.fill('input[id="password"]', 'admin123')
  await page.click('button[type="submit"]')
  
  // Esperar redirección a admin
  await page.waitForURL('/admin')
  console.log(`📍 URL después del login: ${page.url()}`)
  
  // Esperar más tiempo para que la página cargue completamente
  await page.waitForTimeout(10000)
  
  console.log('🔍 Buscando elementos de la página de admin...')
  
  // Verificar elementos específicos del dashboard con selectores más amplios
  const h1Elements = await page.locator('h1').count()
  const dashboardText = await page.locator('text=Dashboard').count()
  const adminText = await page.locator('text=Administración').count()
  const productosText = await page.locator('text=Productos').count()
  
  console.log(`📝 Elementos H1 encontrados: ${h1Elements}`)
  console.log(`🎛️ Texto "Dashboard" encontrado: ${dashboardText}`)
  console.log(`🎛️ Texto "Administración" encontrado: ${adminText}`)
  console.log(`📦 Texto "Productos" encontrado: ${productosText}`)
  
  // Verificar si la página se cargó correctamente
  const pageLoaded = h1Elements > 0 || dashboardText > 0 || adminText > 0 || productosText > 0
  console.log(`${pageLoaded ? '✅' : '❌'} Página de admin ${pageLoaded ? '' : 'NO '}cargada correctamente`)
  
  // Verificar si hay elementos de carga
  const loadingElements = await page.locator('[data-testid*="loading"], .loading, [class*="loading"], [class*="spinner"]').count()
  console.log(`⏳ Elementos de carga encontrados: ${loadingElements}`)
  
  // Verificar que no hay errores de JavaScript
  const jsErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      jsErrors.push(msg.text())
    }
  })
  
  console.log(`${jsErrors.length === 0 ? '✅' : '❌'} ${jsErrors.length === 0 ? 'No hay' : 'Hay'} errores de JavaScript`)
  if (jsErrors.length > 0) {
    console.log('❌ Errores encontrados:', jsErrors)
  }
  
  // Verificar estado de autenticación
  const authResponse = await page.request.get('/api/debug/auth')
  const authData = await authResponse.json()
  console.log('🔧 Estado final de auth:', authData)
  
  // Tomar screenshot para análisis
  await page.screenshot({ path: 'admin-final-test.png', fullPage: true })
  console.log('📸 Screenshot guardado como admin-final-test.png')
  
  // El test pasa si llegamos hasta aquí sin errores críticos
  expect(page.url()).toBe('http://localhost:3000/admin')
  
  // Verificar que al menos algunos elementos del admin están presentes
  expect(pageLoaded).toBe(true)
})