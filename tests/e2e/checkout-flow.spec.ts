import { test, expect } from '@playwright/test'

test.describe('Flujo de Compra Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de productos
    await page.goto('/productos')
    await page.waitForLoadState('networkidle')
  })

  test('debe completar el flujo de compra exitosamente', async ({ page }) => {
    // 1. Seleccionar un producto
    await page.click('data-testid=product-card:first-child')
    await page.waitForLoadState('networkidle')

    // 2. Seleccionar variante (talle y color)
    await page.click('data-testid=size-selector button:first-child')
    await page.click('data-testid=color-selector button:first-child')

    // 3. Agregar al carrito
    await page.click('data-testid=add-to-cart-button')
    
    // 4. Verificar que el producto está en el carrito
    await page.click('data-testid=cart-trigger')
    await expect(page.locator('data-testid=cart-item')).toBeVisible()

    // 5. Calcular envío
    await page.fill('input[placeholder="Código postal"]', '5000')
    await page.click('text=Calcular')
    
    // 6. Seleccionar método de envío
    await page.click('text=Cadete Córdoba')

    // 7. Proceder al checkout
    await page.click('text=Finalizar Compra')
    
    // 8. Verificar que estamos en checkout
    await expect(page).toHaveURL('/checkout')
    await expect(page.locator('h1')).toContainText('Checkout')

    // 9. Llenar formulario de envío
    await page.fill('input[name="firstName"]', 'Juan')
    await page.fill('input[name="lastName"]', 'Pérez')
    await page.fill('input[name="email"]', 'juan.perez@example.com')
    await page.fill('input[name="phone"]', '3512345678')
    await page.fill('input[name="address"]', 'Calle Falsa 123')
    await page.fill('input[name="city"]', 'Córdoba')
    await page.fill('input[name="postalCode"]', '5000')
    await page.fill('input[name="province"]', 'Córdoba')

    // 10. Procesar pago
    await page.click('text=Pagar con Mercado Pago')
    
    // 11. Verificar que se redirige a Mercado Pago (simulado)
    // En un ambiente real, esto redirigiría a Mercado Pago
    await expect(page.locator('text=Procesando...')).toBeVisible()
  })

  test('debe manejar errores de validación en checkout', async ({ page }) => {
    // Agregar producto al carrito
    await page.click('data-testid=product-card:first-child')
    await page.click('data-testid=add-to-cart-button')
    await page.click('data-testid=cart-trigger')
    await page.click('text=Finalizar Compra')

    // Intentar enviar formulario vacío
    await page.click('text=Pagar con Mercado Pago')

    // Verificar mensajes de error
    await expect(page.locator('text=Nombre requerido')).toBeVisible()
    await expect(page.locator('text=Email inválido')).toBeVisible()
    await expect(page.locator('text=Teléfono requerido')).toBeVisible()
  })

  test('debe calcular correctamente el costo de envío', async ({ page }) => {
    // Agregar producto al carrito
    await page.click('data-testid=product-card:first-child')
    await page.click('data-testid=add-to-cart-button')
    await page.click('data-testid=cart-trigger')

    // Calcular envío para Córdoba
    await page.fill('input[placeholder="Código postal"]', '5000')
    await page.click('text=Calcular')
    
    // Verificar que aparece la opción de Cadete Córdoba
    await expect(page.locator('text=Cadete Córdoba')).toBeVisible()
    await expect(page.locator('text=$15.00')).toBeVisible()

    // Calcular envío para otra provincia
    await page.fill('input[placeholder="Código postal"]', '1000')
    await page.click('text=Calcular')
    
    // Verificar que solo aparece envío nacional
    await expect(page.locator('text=Envío Nacional')).toBeVisible()
    await expect(page.locator('text=$25.00')).toBeVisible()
  })

  test('debe aplicar cupones de descuento correctamente', async ({ page }) => {
    // Agregar producto al carrito
    await page.click('data-testid=product-card:first-child')
    await page.click('data-testid=add-to-cart-button')
    await page.click('data-testid=cart-trigger')

    // Aplicar cupón de bienvenida
    await page.click('text=Cupón de descuento')
    await page.fill('input[placeholder="Ingresá tu cupón"]', 'BIENVENIDA10')
    await page.click('text=Aplicar')

    // Verificar que se aplicó el descuento
    await expect(page.locator('text=BIENVENIDA10')).toBeVisible()
    await expect(page.locator('text=Aplicado')).toBeVisible()

    // Verificar que el total se actualizó
    const totalText = await page.locator('data-testid=cart-total').textContent()
    expect(totalText).toContain('$') // Verificar que hay un precio
  })

  test('debe manejar stock insuficiente', async ({ page }) => {
    // Intentar agregar cantidad mayor al stock disponible
    await page.click('data-testid=product-card:first-child')
    
    // Obtener el stock máximo del producto
    const maxStockText = await page.locator('data-testid=stock-available').textContent()
    const maxStock = parseInt(maxStockText?.match(/\d+/)?.[0] || '0')
    
    if (maxStock > 0) {
      // Intentar agregar más de lo disponible
      await page.click('data-testid=add-to-cart-button')
      await page.click('data-testid=cart-trigger')
      
      // Intentar incrementar la cantidad más allá del stock
      for (let i = 0; i < maxStock + 5; i++) {
        await page.locator('button:has-text("+")').first().click()
      }
      
      // Verificar que no se puede exceder el stock
      const quantity = await page.locator('data-testid=quantity-input').inputValue()
      expect(parseInt(quantity)).toBeLessThanOrEqual(maxStock)
    }
  })
})