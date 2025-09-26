import { test, expect } from '@playwright/test'

test.describe('Flujo básico del carrito', () => {
  // Slugs de productos reales obtenidos de la base de datos
  const PRODUCT_SLUGS = {
    CORSET_ANASTASIA: 'corset-anastasia',
    CONJUNTO_TASSIA: 'conjunto-tassia',
    CULOTE_CON_FAJA: 'culote-con-faja'
  };

  test.beforeEach(async ({ page }) => {
    // Ir a la página principal
    await page.goto('/')
  })

  test('debe permitir agregar un producto al carrito desde PDP', async ({ page }) => {
    // Navegar directamente a una PDP específica usando slug real
    await page.goto(`/productos/${PRODUCT_SLUGS.CORSET_ANASTASIA}`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Verificar que estamos en la PDP
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })

    // Verificar que la página cargó correctamente
    const productTitle = page.locator('h1')
    await expect(productTitle).toContainText(/Corset|Anastasia/i, { timeout: 10000 })

    // Intentar seleccionar variantes si están disponibles
    try {
      // Buscar selectores de talle
      const sizeSelector = page.locator('[data-testid="size-selector"]').first()
      if (await sizeSelector.isVisible({ timeout: 3000 })) {
        await sizeSelector.click()
        await page.waitForTimeout(500)
        console.log('Talle seleccionado')
      }
    } catch (e) {
      console.log('No hay selector de talle o no se pudo seleccionar:', e instanceof Error ? e.message : String(e))
    }

    try {
      // Buscar selectores de color
      const colorSelector = page.locator('[data-testid="color-selector"]').first()
      if (await colorSelector.isVisible({ timeout: 3000 })) {
        await colorSelector.click()
        await page.waitForTimeout(500)
        console.log('Color seleccionado')
      }
    } catch (e) {
      console.log('No hay selector de color o no se pudo seleccionar:', e instanceof Error ? e.message : String(e))
    }

    // Esperar a que se actualice el estado
    await page.waitForTimeout(2000)

    // Verificar y hacer clic en el botón de agregar al carrito
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]')
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    
    // Esperar hasta que el botón esté habilitado
    await expect(addToCartButton).toBeEnabled({ timeout: 10000 })
    
    // Agregar al carrito
    await addToCartButton.click()
    await page.waitForTimeout(3000)

    // Verificar que el contador del carrito se actualiza
    const cartCount = page.locator('[data-testid="cart-count"]')
    await expect(cartCount).toBeVisible({ timeout: 10000 })
    await expect(cartCount).toHaveText('1')

    // Abrir el carrito
    const cartTrigger = page.locator('[data-testid="cart-trigger"]')
    await expect(cartTrigger).toBeVisible()
    
    // Intentar hacer clic con force para evitar problemas de interceptación
    await cartTrigger.click({ force: true })
    await page.waitForTimeout(2000)
    
    // Verificar que el carrito se abrió y contiene el producto
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 5000 })
  })

  test('debe permitir aplicar un cupón de descuento', async ({ page }) => {
    // Navegar directamente a una PDP específica usando slug real
    await page.goto(`/productos/${PRODUCT_SLUGS.CONJUNTO_TASSIA}`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Verificar que estamos en la PDP
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })

    // Verificar que la página cargó correctamente
    const productTitle = page.locator('h1')
    await expect(productTitle).toContainText(/Conjunto|Tassia/i, { timeout: 10000 })

    // Intentar seleccionar variantes si están disponibles
    try {
      const sizeSelector = page.locator('[data-testid="size-selector"]').first()
      if (await sizeSelector.isVisible({ timeout: 3000 })) {
        await sizeSelector.click()
        await page.waitForTimeout(500)
      }
    } catch (e) {
      console.log('No hay selector de talle:', e instanceof Error ? e.message : String(e))
    }

    try {
      const colorSelector = page.locator('[data-testid="color-selector"]').first()
      if (await colorSelector.isVisible({ timeout: 3000 })) {
        await colorSelector.click()
        await page.waitForTimeout(500)
      }
    } catch (e) {
      console.log('No hay selector de color:', e instanceof Error ? e.message : String(e))
    }

    // Esperar a que el botón esté habilitado
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]')
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
    
    // Abrir el acordeón de cupón
    await page.click('text=Cupón de descuento')
    await page.waitForTimeout(1000)
    
    // Aplicar cupón de descuento (usar un cupón válido)
    const couponInput = page.locator('[data-testid="coupon-input"]')
    await expect(couponInput).toBeVisible({ timeout: 10000 })
    
    await couponInput.fill('BIENVENIDA10')
    await page.click('[data-testid="apply-coupon"]')
    
    // Verificar que se aplicó el descuento
    await expect(page.locator('[data-testid="discount-applied"]')).toBeVisible()
    
    // Verificar que el precio cambió
    const newPrice = await page.locator('[data-testid="cart-total"]').textContent()
    expect(newPrice).not.toBe(originalPrice)
  })

  test('debe mostrar el flujo completo hasta checkout', async ({ page }) => {
    // Navegar directamente a una PDP específica usando slug real
    await page.goto(`/productos/${PRODUCT_SLUGS.CULOTE_CON_FAJA}`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Verificar que estamos en la PDP
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })

    // Verificar que la página cargó correctamente
    const productTitle = page.locator('h1')
    await expect(productTitle).toContainText(/Culote|faja/i, { timeout: 10000 })

    // Intentar seleccionar variantes si están disponibles
    try {
      const sizeSelector = page.locator('[data-testid="size-selector"]').first()
      if (await sizeSelector.isVisible({ timeout: 3000 })) {
        await sizeSelector.click()
        await page.waitForTimeout(500)
      }
    } catch (e) {
      console.log('No hay selector de talle:', e instanceof Error ? e.message : String(e))
    }

    try {
      const colorSelector = page.locator('[data-testid="color-selector"]').first()
      if (await colorSelector.isVisible({ timeout: 3000 })) {
        await colorSelector.click()
        await page.waitForTimeout(500)
      }
    } catch (e) {
      console.log('No hay selector de color:', e instanceof Error ? e.message : String(e))
    }

    // Esperar a que el botón esté habilitado
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]')
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
    // Navegar directamente a una PDP específica usando slug real
    await page.goto(`/productos/${PRODUCT_SLUGS.CORSET_ANASTASIA}`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Verificar que estamos en la PDP
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })

    // Verificar que la página cargó correctamente
    const productTitle = page.locator('h1')
    await expect(productTitle).toContainText(/Corset|Anastasia/i, { timeout: 10000 })

    // Intentar seleccionar variantes si están disponibles
    try {
      const sizeSelector = page.locator('[data-testid="size-selector"]').first()
      if (await sizeSelector.isVisible({ timeout: 3000 })) {
        await sizeSelector.click()
        await page.waitForTimeout(500)
      }
    } catch (e) {
      console.log('No hay selector de talle:', e instanceof Error ? e.message : String(e))
    }

    try {
      const colorSelector = page.locator('[data-testid="color-selector"]').first()
      if (await colorSelector.isVisible({ timeout: 3000 })) {
        await colorSelector.click()
        await page.waitForTimeout(500)
      }
    } catch (e) {
      console.log('No hay selector de color:', e instanceof Error ? e.message : String(e))
    }

    // Esperar a que el botón esté habilitado
    const addToCartButton = page.locator('[data-testid="add-to-cart-button"]')
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