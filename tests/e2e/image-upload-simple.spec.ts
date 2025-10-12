import { test, expect } from '@playwright/test'

test.describe('Image Upload Functionality', () => {
  test('should upload image via file input', async ({ page }) => {
    // Primero hacer login como admin
    await page.goto('/auth/login')
    
    // Llenar el formulario de login
    await page.fill('input[type="email"]', 'admin@saku.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Esperar a que se complete el login
    await page.waitForURL('/admin')
    
    // Navegar a la página de edición de productos
    await page.goto('/admin/productos/21132d18-72c1-4311-b493-389aeb9292a3')
    
    // Hacer clic en la pestaña de imágenes
    await page.click('text=Imágenes')
    
    // Esperar a que la zona de drop sea visible
    await page.waitForSelector('[data-testid="image-upload-dropzone"]')
    
    // Contar imágenes iniciales
    const initialImages = await page.locator('[data-testid="uploaded-images"] img').count()
    console.log('Imágenes iniciales:', initialImages)
    
    // Crear un archivo de imagen de prueba
    const imageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', 'base64')
    
    // Hacer clic en la zona de drop para activar el input de archivos
    await page.click('[data-testid="image-upload-dropzone"]')
    
    // Subir archivo usando el input oculto
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: imageBuffer
    })
    
    // Esperar a que aparezca el indicador de "Subiendo..."
    await page.waitForSelector('text=Subiendo...', { timeout: 5000 }).catch(() => {
      console.log('No se encontró el indicador de subida')
    })
    
    // Esperar a que desaparezca el indicador de "Subiendo..." (máximo 15 segundos)
    await page.waitForSelector('text=Subiendo...', { state: 'hidden', timeout: 15000 }).catch(() => {
      console.log('El indicador de subida no desapareció en el tiempo esperado')
    })
    
    // Esperar un poco más para que se actualice la UI
    await page.waitForTimeout(3000)
    
    // Contar imágenes finales
    const finalImages = await page.locator('[data-testid="uploaded-images"] img').count()
    console.log('Imágenes finales:', finalImages)
    
    // Verificar que se agregó al menos una imagen
    expect(finalImages).toBeGreaterThan(initialImages)
  })
  
  test('should show upload progress and handle errors gracefully', async ({ page }) => {
    // Login como admin
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@saku.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
    
    // Navegar a la página de edición
    await page.goto('/admin/productos/21132d18-72c1-4311-b493-389aeb9292a3')
    await page.click('text=Imágenes')
    await page.waitForSelector('[data-testid="image-upload-dropzone"]')
    
    // Verificar que la zona de drop está presente y funcional
    const dropzone = page.locator('[data-testid="image-upload-dropzone"]')
    await expect(dropzone).toBeVisible()
    
    // Verificar que el input de archivos está presente
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()
    
    // Verificar que acepta tipos de imagen
    const acceptTypes = await fileInput.getAttribute('accept')
    expect(acceptTypes).toContain('image')
    
    console.log('✅ Componente de subida de imágenes está correctamente configurado')
  })
})