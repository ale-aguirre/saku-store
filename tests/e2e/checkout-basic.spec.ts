import { test, expect } from '@playwright/test'
import { addProductToCart, goToCheckoutWithProduct, fillShippingData } from './helpers/test-helpers'

test.describe('Checkout - Tests Básicos', () => {
  
  test('debe agregar producto al carrito', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar que hay productos
    const products = await page.locator('[data-testid="product-card"]').count()
    expect(products).toBeGreaterThan(0)

    // Hacer clic en el primer producto
    await page.locator('[data-testid="product-card"]').first().click()
    
    // Verificar que estamos en PDP
    await expect(page).toHaveURL(/\/productos\//)
    
    // Seleccionar talle y color
    await page.locator('[data-testid="size-selector"]').first().click()
    await page.locator('[data-testid="color-selector"]').first().click()
    
    // Agregar al carrito
    await page.click('[data-testid="add-to-cart-button"]')
    
    // Verificar que el carrito se abrió
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
  })

  test('debe navegar al checkout desde carrito', async ({ page }) => {
    await addProductToCart(page)
    
    // Cerrar carrito
    await page.click('[data-testid="cart-close-button"]')
    
    // Abrir carrito desde header
    await page.click('[data-testid="cart-trigger"]')
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible()
    
    // Configurar envío
    await page.click('[data-testid="shipping-accordion-trigger"]')
    await page.fill('[data-testid="postal-code-input"]', '1000')
    await page.click('[data-testid="shipping-national"]')
    
    // Ir al checkout
    await expect(page.locator('[data-testid="checkout-button"]')).toBeEnabled()
    await page.click('[data-testid="checkout-button"]')
    
    // Verificar que estamos en checkout
    await expect(page).toHaveURL('/checkout')
  })

  test('debe mostrar formulario de checkout', async ({ page }) => {
    await goToCheckoutWithProduct(page)

    // Verificar campos del formulario
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

  test('debe completar formulario de checkout', async ({ page }) => {
    await goToCheckoutWithProduct(page)
    
    // Llenar formulario
    await fillShippingData(page)
    
    // Verificar que los campos se llenaron
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Juan')
    await expect(page.locator('input[name="email"]')).toHaveValue('juan@test.com')
    
    // El botón de pago debería estar disponible
    const payButton = page.locator('button:has-text("Pagar con Mercado Pago")')
    await expect(payButton).toBeVisible()
  })
})