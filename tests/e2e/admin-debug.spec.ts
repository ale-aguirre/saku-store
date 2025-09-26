import { test, expect } from '@playwright/test'

test.describe('Debug Admin Auth', () => {
  test('debug admin login step by step', async ({ page }) => {
    console.log('1. Navegando a login...')
    await page.goto('/auth/login')
    
    console.log('2. Rellenando credenciales...')
    await page.fill('#email', 'admin@saku.com')
    await page.fill('#password', 'admin123')
    
    console.log('3. Haciendo clic en submit...')
    await page.click('button[type="submit"]')
    
    console.log('4. Esperando redirección...')
    await page.waitForTimeout(3000)
    
    console.log('5. URL actual:', page.url())
    
    console.log('6. Navegando a /admin...')
    await page.goto('/admin')
    
    console.log('7. Esperando que desaparezca el loading...')
    // Esperar a que desaparezca el estado de loading
    await page.waitForSelector('.animate-pulse', { state: 'detached', timeout: 10000 })
    
    console.log('8. Esperando el título de la página...')
    // Esperar a que aparezca el título
    await page.waitForSelector('h1:has-text("Panel de Administración")', { timeout: 10000 })
    
    console.log('9. URL después de ir a admin:', page.url())
    
    // Verificar si hay algún elemento h1
    const h1Elements = await page.locator('h1').all()
    console.log('10. Elementos h1 encontrados:', h1Elements.length)
    
    for (let i = 0; i < h1Elements.length; i++) {
      const text = await h1Elements[i].textContent()
      console.log(`   H1 ${i + 1}: "${text}"`)
    }
    
    // Verificar si estamos en login
    const isLoginPage = await page.locator('text=Iniciar Sesión').isVisible()
    console.log('11. ¿Está en página de login?', isLoginPage)
    
    // Verificar si hay cookies de sesión
    const cookies = await page.context().cookies()
    console.log('12. Cookies encontradas:', cookies.length)
    cookies.forEach(cookie => {
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        console.log(`    Cookie: ${cookie.name} = ${cookie.value.substring(0, 50)}...`)
      }
    })
  })
})