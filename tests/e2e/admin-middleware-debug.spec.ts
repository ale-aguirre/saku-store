import { test, expect } from '@playwright/test'

test.describe('Debug Middleware Admin', () => {
  test('debe debuggear el comportamiento del middleware en rutas admin', async ({ page }) => {
    // Interceptar requests para ver qué está pasando
    const requests: string[] = []
    const responses: { url: string; status: number; headers: Record<string, string> }[] = []
    
    page.on('request', request => {
      requests.push(`${request.method()} ${request.url()}`)
    })
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: Object.fromEntries(
          response.headers() ? Object.entries(response.headers()) : []
        )
      })
    })

    // Ir directamente a admin sin login
    console.log('🔍 Navegando a /admin sin autenticación...')
    await page.goto('http://localhost:3000/admin')
    
    // Verificar redirección a login
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 })
    console.log('✅ Redirigido correctamente a login')
    console.log('📍 URL actual:', page.url())
    
    // Hacer login
    console.log('🔐 Iniciando sesión...')
    await page.fill('input[type="email"]', 'admin@saku.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Esperar procesamiento del login
    await page.waitForTimeout(3000)
    console.log('📍 URL después del login:', page.url())
    
    // Verificar cookies
    const cookies = await page.context().cookies()
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('auth') || cookie.name.includes('sb-')
    )
    console.log('🍪 Cookies de autenticación:', authCookies.map(c => c.name))
    
    // Intentar navegar a admin nuevamente
    console.log('🔍 Navegando a /admin después del login...')
    await page.goto('http://localhost:3000/admin')
    await page.waitForTimeout(3000)
    
    console.log('📍 URL final:', page.url())
    
    // Verificar si estamos en admin o fuimos redirigidos
    const currentUrl = page.url()
    const isInAdmin = currentUrl.includes('/admin')
    const isInHome = currentUrl === 'http://localhost:3000/' || currentUrl.endsWith('/')
    
    console.log('🏠 ¿Está en home?', isInHome)
    console.log('⚙️ ¿Está en admin?', isInAdmin)
    
    // Verificar elementos de la página
    const h1Elements = await page.locator('h1').allTextContents()
    console.log('📝 Elementos H1 encontrados:', h1Elements)
    
    // Verificar si hay elementos específicos de admin
    const adminElements = await page.locator('[data-testid*="admin"], .admin, #admin').count()
    console.log('🔧 Elementos de admin encontrados:', adminElements)
    
    // Verificar si hay elementos de carga
    const loadingElements = await page.locator('.animate-pulse, [data-testid="loading"]').count()
    console.log('⏳ Elementos de carga encontrados:', loadingElements)
    
    // Verificar si hay texto específico de admin
    const adminText = await page.locator('text="Panel de Administración"').count()
    console.log('🎛️ Texto "Panel de Administración" encontrado:', adminText)
    
    // Verificar errores en consola
    const consoleMessages: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(`ERROR: ${msg.text()}`)
      }
    })
    
    // Esperar un poco más para que se complete la carga
    await page.waitForTimeout(5000)
    
    // Verificar nuevamente después de esperar
    const h1ElementsAfterWait = await page.locator('h1').allTextContents()
    console.log('📝 Elementos H1 después de esperar:', h1ElementsAfterWait)
    
    const loadingElementsAfterWait = await page.locator('.animate-pulse, [data-testid="loading"]').count()
    console.log('⏳ Elementos de carga después de esperar:', loadingElementsAfterWait)
    
    console.log('🚨 Errores de consola:', consoleMessages)
    
    // Log de requests importantes
    const adminRequests = requests.filter(req => req.includes('/admin'))
    console.log('📡 Requests a /admin:', adminRequests)
    
    // Log de responses con redirects
    const redirectResponses = responses.filter(res => res.status >= 300 && res.status < 400)
    console.log('↩️ Redirects detectados:', redirectResponses.map(r => `${r.status} ${r.url}`))
    
    // Verificar si el middleware está funcionando
    const middlewareHeaders = responses.find(res => 
      res.headers['x-middleware-next'] || res.headers['x-middleware-rewrite']
    )
    console.log('🔧 Headers de middleware:', middlewareHeaders?.headers)
    
    // Test assertion - por ahora solo verificamos que no crashee
    expect(currentUrl).toBeDefined()
  })
})