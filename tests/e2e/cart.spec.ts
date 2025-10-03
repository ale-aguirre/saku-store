import { test, expect } from '@playwright/test'

test.describe('Carrito - Tests Específicos', () => {
  
  test('debe abrir y cerrar el carrito', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Abrir carrito desde header
    await page.click('[data-testid="cart-trigger"]')
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible()
    
    // Cerrar carrito
    await page.click('[data-testid="cart-close-button"]')
    await expect(page.locator('[data-testid="cart-drawer"]')).not.toBeVisible()
  })

  test('debe mostrar carrito vacío', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Abrir carrito
    await page.click('[data-testid="cart-trigger"]')
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible()
    
    // Verificar mensaje de carrito vacío
    await expect(page.locator('text=Tu carrito está vacío')).toBeVisible()
  })

  test('debe calcular envío con código postal', async ({ page }) => {
    // Agregar producto primero
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.locator('[data-testid="size-selector"]').first().click()
    await page.locator('[data-testid="color-selector"]').first().click()
    await page.click('[data-testid="add-to-cart-button"]')
    
    // Abrir acordeón de envío
    await page.click('[data-testid="shipping-accordion-trigger"]')
    
    // Ingresar código postal
    await page.fill('[data-testid="postal-code-input"]', '1000')
    
    // Verificar opciones de envío
    await expect(page.locator('[data-testid="shipping-national"]')).toBeVisible()
  })

  test('debe habilitar checkout con envío seleccionado', async ({ page }) => {
    // Agregar producto
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('[data-testid="product-card"]').first().click()
    await page.locator('[data-testid="size-selector"]').first().click()
    await page.locator('[data-testid="color-selector"]').first().click()
    await page.click('[data-testid="add-to-cart-button"]')
    
    // Configurar envío
    await page.click('[data-testid="shipping-accordion-trigger"]')
    await page.fill('[data-testid="postal-code-input"]', '1000')
    await page.click('[data-testid="shipping-national"]')
    
    // Verificar que checkout está habilitado
    await expect(page.locator('[data-testid="checkout-button"]')).toBeEnabled()
  })
})