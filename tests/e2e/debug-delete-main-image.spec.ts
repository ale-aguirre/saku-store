import { test, expect } from '@playwright/test'

test.describe('Debug: Eliminar imagen principal', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@saku.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
  })

  test('debe mostrar botón de eliminar en imagen principal', async ({ page }) => {
    // Ir a la página de productos
    await page.goto('/admin/products')
    await page.waitForLoadState('networkidle')

    // Verificar si hay productos
    const productRows = page.locator('table tbody tr')
    const productCount = await productRows.count()
    
    if (productCount === 0) {
      console.log('❌ No hay productos en la base de datos')
      throw new Error('No hay productos para probar')
    }

    console.log(`Encontrados ${productCount} productos`)

    // Buscar un producto con imágenes y hacer clic en editar
    const editButton = page.locator('button:has-text("Editar")').first()
    await expect(editButton).toBeVisible({ timeout: 5000 })
    await editButton.click()
    await page.waitForLoadState('networkidle')

    // Ir a la pestaña de media
    await page.click('button[role="tab"]:has-text("Media")')
    await page.waitForTimeout(1000)

    // Verificar que hay imágenes
    const images = page.locator('[data-testid="sortable-image-item"]')
    const imageCount = await images.count()
    
    if (imageCount > 0) {
      console.log(`Encontradas ${imageCount} imágenes`)
      
      // Verificar la primera imagen (principal)
      const firstImage = images.first()
      
      // Hacer hover sobre la primera imagen para activar los botones
      await firstImage.hover()
      await page.waitForTimeout(500)
      
      // Buscar el botón de eliminar en la primera imagen
      const deleteButton = firstImage.locator('button[title="Eliminar imagen"]')
      
      // Verificar que el botón existe
      await expect(deleteButton).toBeVisible()
      
      // Verificar que el botón es clickeable
      await expect(deleteButton).toBeEnabled()
      
      // Tomar screenshot para debug
      await page.screenshot({ 
        path: 'tests/screenshots/debug-main-image-delete.png',
        fullPage: true 
      })
      
      console.log('✅ Botón de eliminar encontrado en imagen principal')
    } else {
      console.log('❌ No se encontraron imágenes para probar')
      throw new Error('No hay imágenes para probar la funcionalidad de eliminar')
    }
  })

  test('debe poder eliminar imagen principal y promover la siguiente', async ({ page }) => {
    // Ir a la página de productos
    await page.goto('/admin/products')
    await page.waitForLoadState('networkidle')

    // Verificar si hay productos
    const productRows = page.locator('table tbody tr')
    const productCount = await productRows.count()
    
    if (productCount === 0) {
      console.log('❌ No hay productos en la base de datos')
      throw new Error('No hay productos para probar')
    }

    // Buscar un producto con múltiples imágenes
    const editButton = page.locator('button:has-text("Editar")').first()
    await expect(editButton).toBeVisible({ timeout: 5000 })
    await editButton.click()
    await page.waitForLoadState('networkidle')

    // Ir a la pestaña de media
    await page.click('button[role="tab"]:has-text("Media")')
    await page.waitForTimeout(1000)

    // Verificar que hay al menos 2 imágenes
    const images = page.locator('[data-testid="sortable-image-item"]')
    const imageCount = await images.count()
    
    if (imageCount >= 2) {
      console.log(`Encontradas ${imageCount} imágenes`)
      
      // Obtener la URL de la segunda imagen antes de eliminar la primera
      const secondImageSrc = await images.nth(1).locator('img').getAttribute('src')
      
      // Hacer hover sobre la primera imagen
      const firstImage = images.first()
      await firstImage.hover()
      await page.waitForTimeout(500)
      
      // Hacer clic en el botón de eliminar de la primera imagen
      const deleteButton = firstImage.locator('button[title="Eliminar imagen"]')
      await deleteButton.click()
      
      // Esperar a que se procese la eliminación
      await page.waitForTimeout(2000)
      
      // Verificar que ahora hay una imagen menos
      const newImageCount = await images.count()
      expect(newImageCount).toBe(imageCount - 1)
      
      // Verificar que la que era segunda imagen ahora es la primera (principal)
      const newFirstImageSrc = await images.first().locator('img').getAttribute('src')
      expect(newFirstImageSrc).toBe(secondImageSrc)
      
      // Verificar que la nueva primera imagen tiene el indicador "Principal"
      const principalBadge = images.first().locator('text=Principal')
      await expect(principalBadge).toBeVisible()
      
      console.log('✅ Imagen principal eliminada y siguiente promovida correctamente')
    } else {
      console.log('❌ Se necesitan al menos 2 imágenes para probar esta funcionalidad')
      throw new Error('Se necesitan al menos 2 imágenes para probar la eliminación de la principal')
    }
  })
})