import { Page, expect } from '@playwright/test'

/**
 * Helper para agregar un producto al carrito desde la página de inicio
 * Navega al home, selecciona el primer producto, elige talle y color, y lo agrega al carrito
 * @param page - Instancia de Page de Playwright
 */
export async function addProductToCart(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  
  // Hacer clic en el primer producto
  await page.locator('[data-testid="product-card"]').first().click()
  
  // Seleccionar talle y color
  await page.locator('[data-testid="size-selector"]').first().click()
  await page.locator('[data-testid="color-selector"]').first().click()
  
  // Agregar al carrito
  await page.locator('[data-testid="add-to-cart-button"]').click()
  
  // Verificar que se agregó
  await expect(page.locator('[data-testid="cart-count"]')).toContainText('1')
}

/**
 * Helper para navegar al checkout con un producto en el carrito
 * Agrega un producto, calcula envío y navega a la página de checkout
 * @param page - Instancia de Page de Playwright
 */
export async function goToCheckoutWithProduct(page: Page) {
  await addProductToCart(page)
  
  // Abrir carrito
  await page.locator('[data-testid="cart-button"]').click()
  
  // Agregar código postal para calcular envío
  await page.locator('[data-testid="postal-code-input"]').fill('5000')
  await page.locator('[data-testid="calculate-shipping-button"]').click()
  
  // Esperar y seleccionar método de envío
  await page.waitForSelector('[data-testid="shipping-method"]')
  await page.locator('[data-testid="shipping-method"]').first().click()
  
  // Ir a checkout
  await page.locator('[data-testid="checkout-button"]').click()
  
  // Verificar que estamos en checkout
  await expect(page).toHaveURL('/checkout')
}

/**
 * Helper para completar los datos de envío en el formulario de checkout
 * Llena todos los campos requeridos con datos de prueba
 * @param page - Instancia de Page de Playwright
 */
export async function fillShippingData(page: Page) {
  await page.locator('[data-testid="name-input"]').fill('Juan Pérez')
  await page.locator('[data-testid="email-input"]').fill('juan@example.com')
  await page.locator('[data-testid="phone-input"]').fill('3511234567')
  await page.locator('[data-testid="address-input"]').fill('Av. Córdoba 123')
  await page.locator('[data-testid="city-input"]').fill('Córdoba')
  await page.locator('[data-testid="postal-code-checkout-input"]').fill('5000')
}