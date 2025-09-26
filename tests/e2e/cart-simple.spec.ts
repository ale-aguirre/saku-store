import { test, expect } from '@playwright/test'

test.describe('Test simple del carrito', () => {
  test('debe agregar producto al carrito', async ({ page }) => {
    // Navegar al producto
    await page.goto('/productos/corset-anastasia')
    await page.waitForLoadState('domcontentloaded')
    
    // Esperar a que el título sea visible
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })
    
    // Verificar que estamos en la página correcta
    const title = await page.locator('h1').textContent()
    console.log('Título del producto:', title)
    
    // Intentar seleccionar talle si existe
    try {
      const sizeSelector = page.locator('[data-testid="size-selector"]').first()
      await sizeSelector.click({ timeout: 3000 })
      console.log('Talle seleccionado')
    } catch (e) {
      console.log('No hay selector de talle o no es necesario')
    }
    
    // Intentar seleccionar color si existe
    try {
      const colorSelector = page.locator('[data-testid="color-selector"]').first()
      await colorSelector.click({ timeout: 3000 })
      console.log('Color seleccionado')
    } catch (e) {
      console.log('No hay selector de color o no es necesario')
    }
    
    // Agregar al carrito
    const addButton = page.locator('[data-testid="add-to-cart-button"]')
    await expect(addButton).toBeVisible({ timeout: 10000 })
    await addButton.click()
    console.log('Producto agregado al carrito')
    
    // Verificar que el contador del carrito se actualiza
    const cartCount = page.locator('[data-testid="cart-count"]')
    await expect(cartCount).toBeVisible({ timeout: 5000 })
    const count = await cartCount.textContent()
    console.log('Contador del carrito:', count)
    
    // Abrir el carrito
    const cartTrigger = page.locator('[data-testid="cart-trigger"]')
    await expect(cartTrigger).toBeVisible()
    
    // Intentar hacer clic con force para evitar problemas de intercepción
    await cartTrigger.click({ force: true })
    console.log('Carrito abierto')
    
    // Verificar que el carrito contiene el producto
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 10000 })
    console.log('Producto visible en el carrito')
  })
})