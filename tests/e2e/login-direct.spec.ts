import { test, expect } from '@playwright/test'

test('Test login directo con API', async ({ page }) => {
  console.log('🔍 Probando login directo...')
  
  // Ir a la página de login
  await page.goto('http://localhost:3000/auth/login')
  
  // Interceptar las requests de Supabase
  const authRequests: any[] = []
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('auth')) {
      authRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      })
    }
  })
  
  // Interceptar las responses
  const authResponses: any[] = []
  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('auth')) {
      authResponses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers()
      })
    }
  })
  
  // Hacer login
  await page.fill('input[type="email"]', 'admin@saku.com')
  await page.fill('input[type="password"]', 'admin123')
  
  console.log('📝 Enviando formulario de login...')
  await page.click('button[type="submit"]')
  
  // Esperar a que se procese
  await page.waitForTimeout(5000)
  
  console.log('📍 URL después del login:', page.url())
  console.log('🌐 Requests de auth:', authRequests.length)
  console.log('📡 Responses de auth:', authResponses.length)
  
  // Log de requests y responses
  authRequests.forEach((req, i) => {
    console.log(`📤 Request ${i + 1}:`, req.method, req.url)
  })
  
  authResponses.forEach((res, i) => {
    console.log(`📥 Response ${i + 1}:`, res.status, res.url)
  })
  
  // Verificar cookies después del login
  const cookies = await page.context().cookies()
  const authCookies = cookies.filter(c => 
    c.name.includes('auth') || 
    c.name.includes('supabase') ||
    c.name.includes('sb-')
  )
  
  console.log('🍪 Cookies de auth encontradas:', authCookies.length)
  authCookies.forEach(cookie => {
    console.log(`🍪 Cookie: ${cookie.name} = ${cookie.value.substring(0, 50)}...`)
  })
  
  // Verificar si hay errores en la consola
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  
  if (consoleErrors.length > 0) {
    console.log('❌ Errores de consola:', consoleErrors)
  }
  
  // Llamar al endpoint de debug después del login
  try {
    const response = await page.request.get('http://localhost:3000/api/debug/auth')
    const debugData = await response.json()
    console.log('🔧 Estado de auth en servidor:', JSON.stringify(debugData, null, 2))
  } catch (error) {
    console.log('❌ Error al llamar debug API:', error)
  }
})