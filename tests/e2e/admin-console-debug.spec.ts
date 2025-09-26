import { test, expect } from '@playwright/test'

test.describe('Admin Console Debug', () => {
  test('debug console errors during login', async ({ page }) => {
    const consoleMessages: string[] = []
    const errors: string[] = []

    // Capturar mensajes de consola
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`)
    })

    // Capturar errores de página
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`)
    })

    // Capturar errores de red
    page.on('response', response => {
      if (response.status() >= 400) {
        errors.push(`Network Error: ${response.status()} ${response.url()}`)
      }
    })

    console.log('1. Navegando al login...')
    await page.goto('http://localhost:3000/auth/login')

    console.log('2. Llenando credenciales...')
    await page.fill('input[type="email"]', 'admin@saku.com')
    await page.fill('input[type="password"]', 'admin123')

    console.log('3. Haciendo click en submit...')
    await page.click('button[type="submit"]')

    console.log('4. Esperando procesamiento del login...')
    await page.waitForTimeout(5000)

    console.log('5. URL actual:', page.url())

    // Verificar cookies de Supabase
    const cookies = await page.context().cookies()
    const authCookies = cookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('sb-')
    )

    console.log('6. Cookies de autenticación encontradas:', authCookies.length)
    authCookies.forEach(cookie => {
      console.log(`   - ${cookie.name}: ${cookie.value.substring(0, 50)}...`)
    })

    console.log('7. Mensajes de consola:')
    consoleMessages.forEach(msg => console.log(`   ${msg}`))

    console.log('8. Errores encontrados:')
    errors.forEach(error => console.log(`   ${error}`))

    // Verificar localStorage
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {}
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          items[key] = window.localStorage.getItem(key) || ''
        }
      }
      return items
    })

    console.log('9. LocalStorage items:')
    Object.entries(localStorage).forEach(([key, value]) => {
      if (key.includes('supabase') || key.includes('auth')) {
        console.log(`   - ${key}: ${value.substring(0, 100)}...`)
      }
    })

    // El test siempre pasa, solo es para depuración
    expect(true).toBe(true)
  })
})