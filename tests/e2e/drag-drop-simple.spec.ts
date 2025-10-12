import { test, expect } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

test.describe('Drag and Drop Image Upload', () => {
  test('should upload image via drag and drop', async ({ page }) => {
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
    
    // Crear un archivo de imagen de prueba más realista
    const imageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A', 'base64')
    
    // Simular drag and drop con un archivo real
    await page.evaluate((imageData) => {
      const uint8Array = new Uint8Array(atob(imageData).split('').map(char => char.charCodeAt(0)))
      const file = new File([uint8Array], 'test-image.jpg', { type: 'image/jpeg' })
      
      const dropzone = document.querySelector('[data-testid="image-upload-dropzone"]')
      if (dropzone) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dataTransfer
        })
        
        dropzone.dispatchEvent(dropEvent)
      }
    }, imageBuffer.toString('base64'))
    
    // Esperar a que aparezca el indicador de "Subiendo..."
    await page.waitForSelector('text=Subiendo...', { timeout: 5000 }).catch(() => {
      console.log('No se encontró el indicador de subida')
    })
    
    // Esperar a que desaparezca el indicador de "Subiendo..." (máximo 10 segundos)
    await page.waitForSelector('text=Subiendo...', { state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('El indicador de subida no desapareció en el tiempo esperado')
    })
    
    // Esperar un poco más para que se actualice la UI
    await page.waitForTimeout(2000)
    
    // Contar imágenes finales
    const finalImages = await page.locator('[data-testid="uploaded-images"] img').count()
    console.log('Imágenes finales:', finalImages)
    
    // Verificar que se agregó al menos una imagen
    expect(finalImages).toBeGreaterThan(initialImages)
  })
})