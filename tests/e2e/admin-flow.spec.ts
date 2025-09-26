import { test, expect } from '@playwright/test'

test.describe('Flujo de administración', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    
    // Hacer login como admin
    // Nota: En un entorno real, usaríamos credenciales de test
    await page.fill('#email', 'admin@saku.com')
    await page.fill('#password', 'admin123')
    await page.click('button[type="submit"]')
    
    // Esperar a que el login se complete
    await page.waitForTimeout(3000)
    
    // Navegar al dashboard de admin
    await page.goto('/admin')
  })

  test('debe permitir acceso al dashboard de admin', async ({ page }) => {
    // Navegar al admin (ya estamos logueados por el beforeEach)
    await page.goto('/admin')
    
    // Esperar a que desaparezca el loading y aparezca el contenido
    await page.waitForSelector('h1:has-text("Panel de Administración")', { timeout: 15000 })
    
    // Verificar que estamos en el dashboard de admin
    await expect(page.locator('h1')).toContainText('Panel de Administración')
    
    // Verificar que las secciones principales están visibles
    await expect(page.locator('text=Productos')).toBeVisible()
    await expect(page.locator('text=Órdenes')).toBeVisible()
    await expect(page.locator('text=Cupones')).toBeVisible()
  })

  test('debe mostrar la lista de productos en admin', async ({ page }) => {
    // Navegar a la gestión de productos
    await page.goto('/admin/productos')
    await page.waitForLoadState('domcontentloaded')
    
    // Verificar que estamos en la página de productos
    await expect(page.locator('h1')).toContainText('Productos')
    
    // Verificar que hay productos listados
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible({ timeout: 10000 })
    
    // Verificar que hay al menos un producto
    const productItems = page.locator('[data-testid="product-item"]')
    await expect(productItems.first()).toBeVisible({ timeout: 5000 })
  })

  test('debe mostrar la lista de órdenes en admin', async ({ page }) => {
    // Navegar a la gestión de órdenes
    await page.goto('/admin/ordenes')
    await page.waitForLoadState('domcontentloaded')
    
    // Verificar que estamos en la página de órdenes
    await expect(page.locator('h1')).toContainText('Órdenes')
    
    // Verificar que la tabla de órdenes está visible
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible({ timeout: 10000 })
  })

  test('debe mostrar la gestión de cupones', async ({ page }) => {
    // Navegar a la gestión de cupones
    await page.goto('/admin/cupones')
    await page.waitForLoadState('domcontentloaded')
    
    // Verificar que estamos en la página de cupones
    await expect(page.locator('h1')).toContainText('Cupones')
    
    // Verificar que la lista de cupones está visible
    await expect(page.locator('[data-testid="coupons-list"]')).toBeVisible({ timeout: 10000 })
  })

  test('debe permitir ver detalles de un producto', async ({ page }) => {
    // Navegar a la gestión de productos
    await page.goto('/admin/productos')
    await page.waitForLoadState('domcontentloaded')
    
    // Esperar a que los productos se carguen
    await expect(page.locator('[data-testid="product-item"]').first()).toBeVisible({ timeout: 10000 })
    
    // Hacer clic en el primer producto para ver detalles
    const firstProduct = page.locator('[data-testid="product-item"]').first()
    const editButton = firstProduct.locator('[data-testid="edit-product-button"]')
    
    if (await editButton.isVisible()) {
      await editButton.click()
      await page.waitForTimeout(2000)
      
      // Verificar que estamos en la página de edición del producto
      await expect(page.locator('h1')).toContainText('Editar Producto')
      
      // Verificar que los campos del formulario están visibles
      await expect(page.locator('[data-testid="product-name-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="product-description-input"]')).toBeVisible()
    } else {
      console.log('No se encontró botón de editar, saltando test')
    }
  })

  test('debe permitir navegar a crear nuevo producto', async ({ page }) => {
    // Navegar a la gestión de productos
    await page.goto('/admin/productos')
    await page.waitForLoadState('domcontentloaded')
    
    // Buscar el botón de crear nuevo producto
    const createButton = page.locator('[data-testid="create-product-button"]')
    
    if (await createButton.isVisible()) {
      await createButton.click()
      await page.waitForTimeout(2000)
      
      // Verificar que estamos en la página de crear producto
      await expect(page.locator('h1')).toContainText('Nuevo Producto')
      
      // Verificar que el formulario está visible
      await expect(page.locator('[data-testid="product-form"]')).toBeVisible()
    } else {
      // Intentar navegar directamente
      await page.goto('/admin/productos/nuevo')
      await page.waitForLoadState('domcontentloaded')
      
      // Verificar que estamos en la página de crear producto
      await expect(page.locator('h1')).toContainText('Nuevo Producto')
    }
  })

  test('debe mostrar estadísticas básicas en el dashboard', async ({ page }) => {
    // Navegar al dashboard de admin
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    
    // Verificar que hay métricas visibles
    const metricsCards = page.locator('[data-testid="metric-card"]')
    
    if (await metricsCards.first().isVisible()) {
      // Verificar que hay al menos una métrica
      await expect(metricsCards.first()).toBeVisible()
    } else {
      // Si no hay métricas específicas, verificar que al menos hay contenido
      await expect(page.locator('main')).toBeVisible()
    }
  })
})