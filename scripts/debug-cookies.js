const { chromium } = require('playwright')

async function debugCookies() {
  console.log('🍪 Iniciando debug de cookies...')
  
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    // 1. Ir a la página de login
    console.log('📍 Navegando a la página de login...')
    await page.goto('http://localhost:3000/auth/login')
    await page.waitForLoadState('networkidle')
    
    // Ver cookies antes del login
    const cookiesBeforeLogin = await context.cookies()
    console.log('🍪 Cookies antes del login:', cookiesBeforeLogin.length)
    cookiesBeforeLogin.forEach(cookie => {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 50)}...`)
    })
    
    // 2. Hacer login
    console.log('📝 Haciendo login...')
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    await page.fill('input[type="email"]', 'admin@saku.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Esperar redirección
    await page.waitForTimeout(3000)
    console.log('📍 URL después del login:', page.url())
    
    // Ver cookies después del login
    const cookiesAfterLogin = await context.cookies()
    console.log('🍪 Cookies después del login:', cookiesAfterLogin.length)
    cookiesAfterLogin.forEach(cookie => {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 50)}...`)
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        console.log(`    📋 Cookie completa: ${cookie.name} = ${cookie.value}`)
        console.log(`    🔧 Domain: ${cookie.domain}, Path: ${cookie.path}, HttpOnly: ${cookie.httpOnly}, Secure: ${cookie.secure}`)
      }
    })
    
    // 3. Intentar acceder a /admin directamente
    console.log('🔧 Intentando acceder a /admin...')
    await page.goto('http://localhost:3000/admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    console.log('📍 URL final:', page.url())
    
    // Ver cookies después de intentar acceder a admin
    const cookiesAfterAdmin = await context.cookies()
    console.log('🍪 Cookies después de intentar /admin:', cookiesAfterAdmin.length)
    
    // 4. Verificar si las cookies de Supabase están presentes
    const supabaseCookies = cookiesAfterAdmin.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('sb-')
    )
    
    console.log('🔍 Cookies de Supabase encontradas:', supabaseCookies.length)
    supabaseCookies.forEach(cookie => {
      console.log(`  📋 ${cookie.name}:`)
      console.log(`    Value: ${cookie.value}`)
      console.log(`    Domain: ${cookie.domain}`)
      console.log(`    Path: ${cookie.path}`)
      console.log(`    HttpOnly: ${cookie.httpOnly}`)
      console.log(`    Secure: ${cookie.secure}`)
      console.log(`    SameSite: ${cookie.sameSite}`)
    })
    
    // 5. Probar hacer una petición manual a /admin con las cookies
    console.log('🌐 Probando petición manual a /admin...')
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/admin', {
          method: 'GET',
          credentials: 'include'
        })
        return {
          status: res.status,
          url: res.url,
          redirected: res.redirected
        }
      } catch (error) {
        return { error: error.message }
      }
    })
    
    console.log('📊 Respuesta de /admin:', response)
    
  } catch (error) {
    console.error('❌ Error en debug:', error.message)
  } finally {
    await browser.close()
  }
}

async function main() {
  await debugCookies()
}

main()