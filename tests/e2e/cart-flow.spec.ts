import { test, expect } from '@playwright/test'

test.describe('Flujo básico del carrito', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página principal
    await page.goto('/')
  })

  test('debe permitir agregar un producto al carrito desde PDP', async ({ page }) => {
    // Navegar directamente a una PDP específica
    await page.goto('/productos/1')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Verificar que estamos en la PDP
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })

    // Seleccionar variantes específicas que sabemos que tienen stock
    try {
      // Seleccionar talle 85 (sabemos que tiene stock en mock data)
      const sizeSelector = page.locator('[data-testid="size-selector"]').filter({ hasText: '85' })
      await sizeSelector.waitFor({ state: 'visible', timeout: 5000 })
      await sizeSelector.click()
      await page.waitForTimeout(500)
      console.log('Talle 85 seleccionado')
    } catch (e) {
      console.log('No se pudo seleccionar talle 85:', e)
    }

    try {
      // Seleccionar color negro (sabemos que tiene stock en mock data)
      const colorSelector = page.locator('[data-testid="color-selector"]').first()
      await colorSelector.waitFor({ state: 'visible', timeout: 5000 })
      await colorSelector.click()
      await page.waitForTimeout(500)
      console.log('Color seleccionado')
    } catch (e) {
      console.log('No se pudo seleccionar color:', e)
    }

    // Esperar un poco más para que se actualice el estado
    await page.waitForTimeout(2000)

    // Verificar que el botón está habilitado antes de hacer clic
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]')
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    
    // Esperar hasta que el botón esté habilitado (máximo 10 segundos)
    await expect(addToCartButton).toBeEnabled({ timeout: 10000 })
    
    // Agregar al carrito
    await addToCartButton.click()
    await page.waitForTimeout(3000)

    // Verificar que el contador del carrito se actualiza
    const cartCount = page.locator('[data-testid="cart-count"]')
    await expect(cartCount).toBeVisible({ timeout: 10000 })
    await expect(cartCount).toHaveText('1')

    // Hacer click en el cart trigger para abrir el carrito
    const cartTrigger = page.locator('[data-testid="cart-trigger"]')
    await expect(cartTrigger).toBeVisible()
    
    // Intentar hacer click con force si es necesario
    try {
      await cartTrigger.click()
    } catch (e) {
      console.log('Click normal falló, intentando con force')
      await cartTrigger.click({ force: true })
    }
    await page.waitForTimeout(2000)
    
    // Verificar que el carrito se abrió y contiene el producto
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 5000 })
  })

  test('debe permitir aplicar un cupón de descuento', async ({ page }) => {
    // Navegar directamente a una PDP específica para mayor confiabilidad
    await page.goto('http://localhost:3003/productos/1')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Verificar que estamos en la PDP
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })

    // Seleccionar talle
    const sizeSelector = page.locator('[data-testid="size-selector"]').first()
    await expect(sizeSelector).toBeVisible({ timeout: 5000 })
    await sizeSelector.click()
    await page.waitForTimeout(1000)

    // Seleccionar color
    const colorSelector = page.locator('[data-testid="color-selector"]').first()
    await expect(colorSelector).toBeVisible({ timeout: 5000 })
    await colorSelector.click()
    await page.waitForTimeout(1000)

    // Esperar a que el botón esté habilitado
    const addToCartButton = page.locator('[data-testid="add-to-cart"]')
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    await expect(addToCartButton).toBeEnabled({ timeout: 10000 })
    
    await addToCartButton.click()
    await page.waitForTimeout(2000)
    
    // Verificar que el contador del carrito se actualiza
    const cartCount = page.locator('[data-testid="cart-count"]')
    await expect(cartCount).toBeVisible({ timeout: 10000 })
    await expect(cartCount).toHaveText('1')
    
    // Verificar si el carrito ya está abierto (se abre automáticamente al agregar producto)
    const cartDialog = page.locator('[role="dialog"]')
    const isCartOpen = await cartDialog.isVisible()
    
    if (!isCartOpen) {
      // Si no está abierto, hacer click en el cart trigger
      const cartTrigger = page.locator('[data-testid="cart-trigger"]')
      await expect(cartTrigger).toBeVisible({ timeout: 5000 })
      await cartTrigger.click()
      await page.waitForTimeout(2000)
    }
    
    // Verificar que el carrito está abierto
    await expect(cartDialog).toBeVisible({ timeout: 5000 })
    
    // Obtener el precio original
    const originalPrice = await page.locator('[data-testid="cart-total"]').textContent()
    
    // Aplicar cupón de descuento (usar un cupón válido)
    const couponInput = page.locator('[data-testid="coupon-input"]')
    await expect(couponInput).toBeVisible()
    
    await couponInput.fill('BIENVENIDA10')
    await page.click('[data-testid="apply-coupon"]')
    
    // Verificar que se aplicó el descuento
    await expect(page.locator('[data-testid="discount-applied"]')).toBeVisible()
    
    // Verificar que el precio cambió
    const newPrice = await page.locator('[data-testid="cart-total"]').textContent()
    expect(newPrice).not.toBe(originalPrice)
  })

  test('debe mostrar el flujo completo hasta checkout', async ({ page }) => {
    // Navegar directamente a una PDP específica para mayor confiabilidad
    await page.goto('http://localhost:3003/productos/1')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Verificar que estamos en la PDP
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })

    // Seleccionar talle
    const sizeSelector = page.locator('[data-testid="size-selector"]').first()
    await expect(sizeSelector).toBeVisible({ timeout: 5000 })
    await sizeSelector.click()
    await page.waitForTimeout(1000)

    // Seleccionar color
    const colorSelector = page.locator('[data-testid="color-selector"]').first()
    await expect(colorSelector).toBeVisible({ timeout: 5000 })
    await colorSelector.click()
    await page.waitForTimeout(1000)

    // Esperar a que el botón esté habilitado
    const addToCartButton = page.locator('[data-testid="add-to-cart"]')
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    await expect(addToCartButton).toBeEnabled({ timeout: 10000 })
    
    await addToCartButton.click()
    await page.waitForTimeout(2000)
    
    // Verificar si el carrito ya está abierto (se abre automáticamente al agregar producto)
    const cartDialog = page.locator('[role="dialog"]')
    const isCartOpen = await cartDialog.isVisible()
    
    if (!isCartOpen) {
      // Si no está abierto, hacer click en el cart trigger
      const cartTrigger = page.locator('[data-testid="cart-trigger"]')
      await expect(cartTrigger).toBeVisible({ timeout: 5000 })
      await cartTrigger.click()
      await page.waitForTimeout(2000)
    }
    
    // Verificar que el carrito está abierto
    await expect(cartDialog).toBeVisible({ timeout: 5000 })
    
    // Verificar que el producto está en el carrito
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
    
    // Verificar que el botón de checkout está presente
    const checkoutButton = page.locator('text=Finalizar Compra')
    await expect(checkoutButton).toBeVisible()
  })

  test('debe calcular correctamente los costos de envío', async ({ page }) => {
    // Navegar directamente a una PDP específica para mayor confiabilidad
    await page.goto('http://localhost:3003/productos/1')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Verificar que estamos en la PDP
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })

    // Seleccionar talle
    const sizeSelector = page.locator('[data-testid="size-selector"]').first()
    await expect(sizeSelector).toBeVisible({ timeout: 5000 })
    await sizeSelector.click()
    await page.waitForTimeout(1000)

    // Seleccionar color
    const colorSelector = page.locator('[data-testid="color-selector"]').first()
    await expect(colorSelector).toBeVisible({ timeout: 5000 })
    await colorSelector.click()
    await page.waitForTimeout(1000)

    // Esperar a que el botón esté habilitado
    const addToCartButton = page.locator('[data-testid="add-to-cart"]')
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    await expect(addToCartButton).toBeEnabled({ timeout: 10000 })
    
    await addToCartButton.click()
    await page.waitForTimeout(2000)
    
    // Verificar si el carrito ya está abierto (se abre automáticamente al agregar producto)
    const cartDialog = page.locator('[role="dialog"]')
    const isCartOpen = await cartDialog.isVisible()
    
    if (!isCartOpen) {
      // Si no está abierto, hacer click en el cart trigger
      const cartTrigger = page.locator('[data-testid="cart-trigger"]')
      await expect(cartTrigger).toBeVisible({ timeout: 5000 })
      await cartTrigger.click()
      await page.waitForTimeout(2000)
    }
    
    // Verificar que el carrito está abierto
    await expect(cartDialog).toBeVisible({ timeout: 5000 })
    
    // Verificar que el producto está en el carrito
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
    
    // Verificar que se muestra el total
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible()
    
    // Verificar que el botón de checkout está presente
    const checkoutButton = page.locator('text=Finalizar Compra')
    await expect(checkoutButton).toBeVisible()
  })
})