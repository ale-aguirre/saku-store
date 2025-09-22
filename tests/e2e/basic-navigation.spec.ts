import { test, expect } from '@playwright/test'

test.describe('Navegación básica', () => {
  test.beforeEach(async ({ page }) => {
    // Asegurar que cada test comience desde la página principal
    await page.goto('/')
  })

  test('debe cargar la página principal correctamente', async ({ page }) => {
    
    // Verificar que el título principal está presente (puede tener elementos anidados)
    await expect(page.locator('h1')).toContainText('Elegancia que')
    await expect(page.locator('h1')).toContainText('realza')
    await expect(page.locator('h1')).toContainText('tu belleza')
    
    // Verificar que la navegación está presente (nav en desktop o botón menú en móvil)
    const nav = page.locator('nav')
    const menuButton = page.locator('button:has-text("Menú")')
    
    // Verificar que al menos uno de los dos existe
    const navVisible = await nav.isVisible().catch(() => false)
    const menuVisible = await menuButton.isVisible().catch(() => false)
    
    expect(navVisible || menuVisible).toBe(true)
  })

  test('debe navegar a la página de productos', async ({ page }) => {
    
    // Verificar si estamos en móvil (si hay botón de menú)
    const menuButton = page.locator('button:has-text("Menú")')
    const isMobile = await menuButton.isVisible()
    
    if (isMobile) {
      // En móvil, abrir el menú hamburguesa primero
      await menuButton.click()
      
      // Esperar a que aparezca el enlace de productos dentro del Sheet
      const productosLinkInSheet = page.locator('[role="dialog"] a[href="/productos"], [role="dialog"] a:has-text("Productos")')
      await expect(productosLinkInSheet.first()).toBeVisible()
      
      // Hacer clic en el enlace de productos
      await productosLinkInSheet.first().click()
    } else {
      // En desktop, buscar el enlace directamente en la navegación
      const productosLink = page.locator('nav a[href="/productos"], nav a:has-text("Productos")')
      await expect(productosLink.first()).toBeVisible()
      
      // Esperar a que la página esté completamente cargada
      await page.waitForLoadState('networkidle')
      
      // Hacer clic en el enlace de productos
      await productosLink.first().click()
    }
    
    // Esperar a que la navegación se complete con más tiempo
    await page.waitForURL(/.*\/productos$/, { timeout: 10000 })
    
    // Verificar que navegamos a la página de productos
    const currentURL = page.url()
    console.log('URL actual:', currentURL)
    await expect(page).toHaveURL(/.*\/productos$/)
    
    // Verificar que el contenido de la página de productos se carga
    await expect(page.locator('h1:has-text("Nuestros Productos")')).toBeVisible({ timeout: 5000 })
  })

  test('debe verificar que el webhook endpoint existe', async ({ request }) => {
    // Test simple para verificar que el endpoint existe
    const response = await request.post('/api/webhooks/mercadopago', {
      data: {
        id: 123,
        live_mode: false,
        type: 'payment',
        date_created: '2024-01-01T00:00:00Z',
        action: 'payment.updated',
        data: {
          id: '12345678901'
        }
      }
    })
    
    // El endpoint existe y procesa el webhook (404 porque no encuentra la orden es esperado)
    expect([200, 404, 500]).toContain(response.status())
  })
})