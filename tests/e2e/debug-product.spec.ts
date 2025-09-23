import { test, expect } from '@playwright/test'

test.describe('Debug Product Page', () => {
  test('should debug product page elements', async ({ page }) => {
    // Navegar a la página de producto
    await page.goto('/productos/1')
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle')
    
    // Tomar screenshot para debug
    await page.screenshot({ path: 'debug-product-page.png', fullPage: true })
    
    // Verificar que el producto se carga
    const productName = page.locator('h1')
    await expect(productName).toBeVisible({ timeout: 10000 })
    console.log('Product name:', await productName.textContent())
    
    // Buscar todos los elementos con data-testid
    const allTestIds = await page.locator('[data-testid]').all()
    console.log('Found elements with data-testid:', allTestIds.length)
    
    for (const element of allTestIds) {
      const testId = await element.getAttribute('data-testid')
      const isVisible = await element.isVisible()
      console.log(`- ${testId}: visible=${isVisible}`)
    }
    
    // Verificar específicamente los selectores
    const sizeSelectors = page.locator('[data-testid="size-selector"]')
    const colorSelectors = page.locator('[data-testid="color-selector"]')
    
    console.log('Size selectors count:', await sizeSelectors.count())
    console.log('Color selectors count:', await colorSelectors.count())
    
    // Verificar si están visibles
    if (await sizeSelectors.count() > 0) {
      console.log('First size selector visible:', await sizeSelectors.first().isVisible())
    }
    
    if (await colorSelectors.count() > 0) {
      console.log('First color selector visible:', await colorSelectors.first().isVisible())
    }
    
    // Verificar el HTML completo del área de variantes
    const variantArea = page.locator('.space-y-4').last()
    console.log('Variant area HTML:', await variantArea.innerHTML())
  })
})