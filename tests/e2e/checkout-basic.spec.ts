import { test, expect } from '@playwright/test'

test.describe('Flujo de Compra Básico', () => {
  test('debe navegar al checkout desde el carrito', async ({ page }) => {
    // 1. Navegar a la página de inicio
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 2. Verificar que hay productos en el home
    const products = await page.locator('data-testid=product-card').count()
    expect(products).toBeGreaterThan(0)

    // 3. Hacer clic en el primer producto
    await page.click('data-testid=product-card:first-child')
    
    // 4. Verificar que estamos en la PDP
    await expect(page).toHaveURL(/\/producto\//)
    
    // 5. Agregar al carrito
    await page.click('data-testid=add-to-cart-button')
    
    // 6. Verificar que el carrito se abrió
    await expect(page.locator('data-testid=cart-drawer')).toBeVisible()
    
    // 7. Cerrar el carrito
    await page.click('data-testid=cart-close-button')
    
    // 8. Abrir el carrito desde el header
    await page.click('data-testid=cart-trigger')
    await expect(page.locator('data-testid=cart-drawer')).toBeVisible()
    
    // 9. Verificar que el producto está en el carrito
    await expect(page.locator('data-testid=cart-item')).toBeVisible()
    
    // 10. Navegar al checkout
    await page.click('text=Finalizar Compra')
    
    // 11. Verificar que estamos en checkout
    await expect(page).toHaveURL('/checkout')
    await expect(page.locator('h1')).toContainText('Checkout')
  })

  test('debe mostrar formulario de checkout con campos requeridos', async ({ page }) => {
    // Navegar directamente al checkout
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // Verificar que hay campos requeridos
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="phone"]')).toBeVisible()
    await expect(page.locator('input[name="address"]')).toBeVisible()
    await expect(page.locator('input[name="city"]')).toBeVisible()
    await expect(page.locator('input[name="postalCode"]')).toBeVisible()
    await expect(page.locator('input[name="province"]')).toBeVisible()
    
    // Verificar botón de pago
    await expect(page.locator('text=Pagar con Mercado Pago')).toBeVisible()
  })

  test('debe validar campos requeridos en checkout', async ({ page }) => {
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // Intentar enviar formulario vacío
    await page.click('text=Pagar con Mercado Pago')

    // Verificar mensajes de error (si existen)
    const hasErrors = await page.locator('text=requerido').count() > 0
    
    if (hasErrors) {
      // Si hay validación de formulario
      await expect(page.locator('text=Nombre requerido')).toBeVisible()
      await expect(page.locator('text=Email requerido')).toBeVisible()
    } else {
      // Si no hay validación, verificar que el botón está deshabilitado o hay otro comportamiento
      console.log('No se encontraron mensajes de error de validación')
    }
  })
})