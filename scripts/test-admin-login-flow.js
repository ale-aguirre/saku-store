const { chromium } = require('playwright')

async function testAdminLoginFlow() {
  console.log('🚀 Iniciando prueba de flujo de login de admin...')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // 1. Ir a la página de login
    console.log('📍 Navegando a la página de login...')
    await page.goto('http://localhost:3000/auth/login')
    await page.waitForLoadState('networkidle')
    
    // 2. Llenar el formulario de login
    console.log('📝 Llenando formulario de login...')
    
    // Esperar a que aparezcan los campos
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    
    await page.fill('input[type="email"]', 'admin@saku.com')
    await page.fill('input[type="password"]', 'admin123')
    
    // 3. Hacer click en el botón de login
    console.log('🔐 Haciendo login...')
    await page.click('button[type="submit"]')
    
    // 4. Esperar redirección o cambio de URL
    console.log('⏳ Esperando respuesta del login...')
    await page.waitForTimeout(3000) // Esperar 3 segundos
    
    const currentUrl = page.url()
    console.log('📍 URL después del login:', currentUrl)
    
    // 5. Verificar si hay errores en la página
    const errorElements = await page.locator('[role="alert"], .error, .text-red-500, .text-destructive').all()
    if (errorElements.length > 0) {
      console.log('⚠️  Errores encontrados en la página:')
      for (const error of errorElements) {
        const text = await error.textContent()
        if (text && text.trim()) {
          console.log('  -', text.trim())
        }
      }
    }
    
    // 6. Intentar acceder al panel de administración
    console.log('🔧 Navegando al panel de administración...')
    await page.goto('http://localhost:3000/admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    const adminUrl = page.url()
    console.log('📍 URL del admin:', adminUrl)
    
    if (adminUrl.includes('/admin') && !adminUrl.includes('/auth/login')) {
      console.log('✅ Acceso exitoso al panel de administración!')
      
      // Verificar elementos del admin
      try {
        const pageTitle = await page.locator('h1').first().textContent({ timeout: 5000 })
        console.log('📋 Título de la página admin:', pageTitle)
      } catch (e) {
        console.log('⚠️  No se pudo obtener el título de la página')
      }
      
      // Verificar que hay contenido de admin
      const adminContent = await page.locator('main, [role="main"], .admin').first().isVisible().catch(() => false)
      if (adminContent) {
        console.log('✅ Contenido de administración visible')
      } else {
        console.log('⚠️  No se detectó contenido de administración')
      }
      
    } else {
      console.log('❌ No se pudo acceder al panel de administración')
      console.log('📍 URL actual:', adminUrl)
      
      if (adminUrl.includes('/auth/login')) {
        console.log('🔄 Fue redirigido al login - verificar autenticación')
        
        // Verificar si hay un mensaje de redirect
        const redirectParam = new URL(adminUrl).searchParams.get('redirect')
        if (redirectParam) {
          console.log('🎯 Parámetro de redirección:', redirectParam)
        }
      }
    }
    
    // 7. Capturar screenshot para debug
    await page.screenshot({ path: 'admin-test-screenshot.png', fullPage: true })
    console.log('📸 Screenshot guardado como admin-test-screenshot.png')
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
    
    // Capturar screenshot en caso de error
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true })
    console.log('📸 Screenshot de error guardado como error-screenshot.png')
  } finally {
    await browser.close()
  }
}

// Verificar que el servidor esté corriendo
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000')
    if (response.ok) {
      console.log('✅ Servidor está corriendo en puerto 3000')
      return true
    }
  } catch (error) {
    console.log('❌ Servidor no está corriendo en puerto 3000')
    return false
  }
}

async function main() {
  const serverRunning = await checkServer()
  if (!serverRunning) {
    console.log('🚨 Por favor inicia el servidor con: npm run dev')
    return
  }
  
  await testAdminLoginFlow()
}

main()