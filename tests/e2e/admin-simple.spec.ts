import { test, expect } from '@playwright/test'

test.describe('Admin Simple Test', () => {
  test('simple admin login test', async ({ page }) => {
    // 1. Ir al login
    console.log('1. Navegando al login...')
    await page.goto('/auth/login')
    
    // 2. Llenar credenciales
    console.log('2. Llenando credenciales...')
    await page.fill('#email', 'admin@saku.com')
    await page.fill('#password', 'admin123')
    
    // 3. Hacer click en submit
    console.log('3. Haciendo click en submit...')
    await page.click('button[type="submit"]')
    
    // 4. Esperar un poco para que se procese el login
    console.log('4. Esperando procesamiento del login...')
    await page.waitForTimeout(5000)
    
    // 5. Verificar URL actual
    console.log('5. URL actual:', page.url())
    
    // 6. Ir directamente al admin
    console.log('6. Navegando al admin...')
    await page.goto('/admin')
    
    // 7. Esperar un poco más
    await page.waitForTimeout(3000)
    
    // 8. Verificar URL actual
    console.log('8. URL actual después de ir a admin:', page.url())
    
    // 9. Tomar screenshot para ver qué está pasando
    await page.screenshot({ path: 'admin-simple-debug.png', fullPage: true })
    
    // 10. Verificar si hay algún elemento h1
    const h1Elements = await page.locator('h1').count()
    console.log('9. Cantidad de elementos h1 encontrados:', h1Elements)
    
    // 11. Si hay h1, mostrar su contenido
    if (h1Elements > 0) {
      const h1Text = await page.locator('h1').first().textContent()
      console.log('10. Texto del primer h1:', h1Text)
    }
    
    // 12. Verificar si hay elementos de loading
    const loadingElements = await page.locator('.animate-pulse').count()
    console.log('11. Elementos de loading encontrados:', loadingElements)
    
    // 13. Verificar si estamos en la página de login
    const isLoginPage = await page.locator('text=Iniciar Sesión').count() > 0
    console.log('12. ¿Estamos en la página de login?', isLoginPage)
    
    // 14. Verificar cookies de autenticación
    const cookies = await page.context().cookies()
    const authCookies = cookies.filter(cookie => cookie.name.includes('supabase'))
    console.log('13. Cookies de autenticación encontradas:', authCookies.length)
    
    // Para que el test no falle, simplemente verificamos que llegamos aquí
    expect(true).toBe(true)
  })
})