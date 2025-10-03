import { test, expect } from '@playwright/test'

test.describe('Productos - Tests Específicos', () => {
  
  test('debe mostrar productos en home', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Verificar que hay productos
    const products = await page.locator('[data-testid="product-card"]').count()
    expect(products).toBeGreaterThan(0)
    
    // Verificar elementos del producto
    const firstProduct = page.locator('[data-testid="product-card"]').first()
    await expect(firstProduct).toBeVisible()
  })

  test('debe navegar a página de producto', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Hacer clic en primer producto
    await page.locator('[data-testid="product-card"]').first().click()
    
    // Verificar que estamos en PDP
    await expect(page).toHaveURL(/\/productos\//)
  })

  test('debe mostrar página de producto con opciones', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('[data-testid="product-card"]').first().click()
    
    // Verificar que estamos en PDP y hay elementos básicos
    await expect(page).toHaveURL(/\/productos\//)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible()
  })

  test('debe seleccionar talle y color', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('[data-testid="product-card"]').first().click()
    
    // Seleccionar talle
    await page.locator('[data-testid="size-selector"]').first().click()
    
    // Seleccionar color
    await page.locator('[data-testid="color-selector"]').first().click()
    
    // Verificar que el botón de agregar está habilitado
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeEnabled()
  })

  test('debe mostrar información del producto', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('[data-testid="product-card"]').first().click()
    
    // Verificar elementos de la PDP
    await expect(page.locator('h1')).toBeVisible() // Título del producto
    await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeVisible() // Botón agregar
  })
})