import { test, expect } from '@playwright/test'

test('Debug auth state after login', async ({ page }) => {
  console.log('🔍 Iniciando debug de autenticación...')
  
  // Ir a la página de login
  await page.goto('http://localhost:3000/auth/login')
  
  // Hacer login
  await page.fill('input[type="email"]', 'admin@saku.com')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')
  
  // Esperar a que se complete el login
  await page.waitForTimeout(3000)
  
  console.log('📍 URL después del login:', page.url())
  
  // Verificar cookies en el navegador
  const cookies = await page.context().cookies()
  const authCookies = cookies.filter(c => c.name.includes('auth'))
  console.log('🍪 Cookies de auth en navegador:', authCookies.length)
  console.log('🍪 Todas las cookies:', cookies.map(c => ({ name: c.name, domain: c.domain })))
  
  // Llamar al endpoint de debug
  const response = await page.request.get('http://localhost:3000/api/debug/auth')
  const debugData = await response.json()
  
  console.log('🔧 Debug API response:', JSON.stringify(debugData, null, 2))
  
  // Verificar si el usuario está autenticado en el servidor
  if (debugData.user) {
    console.log('✅ Usuario autenticado en servidor:', debugData.user.email)
    console.log('👤 Rol del usuario:', debugData.profile?.role || 'No profile')
  } else {
    console.log('❌ Usuario NO autenticado en servidor')
    console.log('🚨 Error de auth:', debugData.error || 'No error')
  }
  
  // Intentar acceder a /admin
  console.log('🔍 Intentando acceder a /admin...')
  await page.goto('http://localhost:3000/admin')
  await page.waitForTimeout(2000)
  
  console.log('📍 URL final después de ir a /admin:', page.url())
  
  // Verificar si estamos en admin o fuimos redirigidos
  const isInAdmin = page.url().includes('/admin') && !page.url().includes('/auth/login')
  console.log('⚙️ ¿Está en admin?', isInAdmin)
  
  if (isInAdmin) {
    // Verificar contenido de la página
    const h1Elements = await page.locator('h1').allTextContents()
    console.log('📝 Elementos H1 en admin:', h1Elements)
    
    const adminText = await page.locator('text="Panel de Administración"').count()
    console.log('🎛️ Texto "Panel de Administración" encontrado:', adminText)
  }
})