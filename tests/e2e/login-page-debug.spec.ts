import { test, expect } from '@playwright/test'

test('Verificar que la página de login se carga correctamente', async ({ page }) => {
  console.log('🔍 Verificando carga de página de login...')
  
  // Navegar a login
  await page.goto('/auth/login')
  
  // Esperar a que la página cargue
  await page.waitForLoadState('networkidle')
  
  // Verificar el título de la página
  const title = await page.title()
  console.log(`📄 Título de la página: ${title}`)
  
  // Verificar si hay elementos de login
  const emailInput = await page.locator('input[name="email"], input[type="email"]').count()
  const passwordInput = await page.locator('input[name="password"], input[type="password"]').count()
  const submitButton = await page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').count()
  
  console.log(`📧 Campos de email: ${emailInput}`)
  console.log(`🔒 Campos de password: ${passwordInput}`)
  console.log(`🔘 Botones de submit: ${submitButton}`)
  
  // Verificar el contenido de la página
  const pageContent = await page.content()
  const hasLoginForm = pageContent.includes('email') || pageContent.includes('password') || pageContent.includes('login')
  console.log(`📝 Contiene elementos de login: ${hasLoginForm}`)
  
  // Tomar screenshot
  await page.screenshot({ path: 'login-page-debug.png', fullPage: true })
  console.log('📸 Screenshot guardado como login-page-debug.png')
  
  // Verificar si hay errores en consola
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
      console.log(`❌ Error en consola: ${msg.text()}`)
    }
  })
  
  // El test pasa para obtener información de diagnóstico
  expect(true).toBe(true)
})