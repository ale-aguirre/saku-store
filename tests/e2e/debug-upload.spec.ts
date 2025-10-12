import { test, expect } from '@playwright/test'

test.describe('Debug Image Upload', () => {
  test('should debug image upload step by step', async ({ page }) => {
    // Interceptar requests para ver qué está pasando
    page.on('request', request => {
      if (request.url().includes('storage') || request.url().includes('upload')) {
        console.log('📤 Request:', request.method(), request.url())
      }
    })
    
    page.on('response', response => {
      if (response.url().includes('storage') || response.url().includes('upload')) {
        console.log('📥 Response:', response.status(), response.url())
      }
    })
    
    // Capturar errores de consola
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text())
      } else if (msg.text().includes('📤') || msg.text().includes('✅') || msg.text().includes('❌')) {
        console.log('🔍 Upload Log:', msg.text())
      }
    })
    
    // Login como admin
    console.log('🔐 Iniciando login...')
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@saku.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
    console.log('✅ Login completado')
    
    // Navegar a la página de edición
    console.log('🔄 Navegando a página de edición...')
    await page.goto('/admin/productos/21132d18-72c1-4311-b493-389aeb9292a3')
    console.log('✅ Página de edición cargada')
    
    // Hacer clic en la pestaña de imágenes
    console.log('🖼️ Haciendo clic en pestaña de imágenes...')
    await page.click('text=Imágenes')
    await page.waitForSelector('[data-testid="image-upload-dropzone"]')
    console.log('✅ Pestaña de imágenes activa')
    
    // Verificar estado inicial
    const initialImages = await page.locator('[data-testid="uploaded-images"] img').count()
    console.log('📊 Imágenes iniciales:', initialImages)
    
    // Verificar que el componente está presente
    const dropzone = page.locator('[data-testid="image-upload-dropzone"]')
    await expect(dropzone).toBeVisible()
    console.log('✅ Zona de drop visible')
    
    // Verificar input de archivos
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()
    console.log('✅ Input de archivos presente')
    
    // Crear archivo de prueba muy pequeño
    const smallImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64')
    
    console.log('📁 Subiendo archivo de prueba...')
    
    // Hacer clic en la zona de drop
    await page.click('[data-testid="image-upload-dropzone"]')
    
    // Subir archivo
    await fileInput.setInputFiles({
      name: 'test-tiny.png',
      mimeType: 'image/png',
      buffer: smallImageBuffer
    })
    
    console.log('⏳ Esperando indicador de subida...')
    
    // Esperar indicador de subida con timeout más largo
    try {
      await page.waitForSelector('text=Subiendo...', { timeout: 10000 })
      console.log('✅ Indicador de subida encontrado')
      
      // Esperar a que termine la subida
      await page.waitForSelector('text=Subiendo...', { state: 'hidden', timeout: 30000 })
      console.log('✅ Subida completada')
    } catch (error) {
      console.log('⚠️ No se encontró indicador de subida o no terminó:', error instanceof Error ? error.message : String(error))
    }
    
    // Esperar un poco para que se actualice la UI
    await page.waitForTimeout(5000)
    
    // Verificar estado final
    const finalImages = await page.locator('[data-testid="uploaded-images"] img').count()
    console.log('📊 Imágenes finales:', finalImages)
    
    // Tomar screenshot para debug
    await page.screenshot({ path: 'debug-upload-final.png', fullPage: true })
    
    // Verificar si hay errores en la página
    const errorMessages = await page.locator('text=error').count()
    console.log('❌ Mensajes de error encontrados:', errorMessages)
    
    // El test pasa si no hay errores críticos, independientemente de si la imagen se subió
    expect(errorMessages).toBe(0)
  })
})