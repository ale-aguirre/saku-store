import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Admin Panel - Imagen Upload Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/auth/login');
    
    // Iniciar sesión como administrador
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL || 'admin@saku.com');
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete la redirección después del login
    await page.waitForURL('**/admin**');
  });

  test('Debe cargar una imagen a un producto existente', async ({ page }) => {
    // Navegar a la lista de productos
    await page.goto('/admin/productos');
    
    // Esperar a que la tabla de productos cargue
    await page.waitForSelector('table');
    
    // Hacer clic en el primer producto para editarlo
    await page.click('table tbody tr:first-child a');
    
    // Esperar a que cargue la página de edición
    await page.waitForSelector('h1:has-text("Editar Producto")');
    
    // Verificar que estamos en la página correcta
    const productId = page.url().split('/').pop();
    console.log(`Editando producto con ID: ${productId}`);
    
    // Localizar la sección de imágenes
    await page.waitForSelector('text=Imágenes del Producto');
    
    // Obtener el número de imágenes actuales antes de la carga
    const initialImagesCount = await page.locator('.image-preview-container').count();
    console.log(`Número inicial de imágenes: ${initialImagesCount}`);
    
    // Preparar la ruta de la imagen de prueba
    const imagePath = path.join(process.cwd(), 'public', 'test-image.svg');
    
    // Subir la imagen
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePath);
    
    // Esperar a que la imagen se cargue (buscar indicador de carga o mensaje de éxito)
    await page.waitForTimeout(3000); // Esperar un tiempo para que se complete la carga
    
    // Verificar que aparece una nueva imagen en la previsualización
    const newImagesCount = await page.locator('.image-preview-container').count();
    console.log(`Número de imágenes después de la carga: ${newImagesCount}`);
    expect(newImagesCount).toBeGreaterThan(initialImagesCount);
    
    // Guardar los cambios
    await page.click('button:has-text("Guardar cambios")');
    
    // Esperar mensaje de éxito
    await page.waitForSelector('text=Producto guardado correctamente', { timeout: 10000 });
    
    // Recargar la página para verificar que la imagen persiste
    await page.reload();
    
    // Esperar a que la página cargue nuevamente
    await page.waitForSelector('h1:has-text("Editar Producto")');
    
    // Verificar que la imagen sigue ahí
    const finalImagesCount = await page.locator('.image-preview-container').count();
    console.log(`Número final de imágenes después de recargar: ${finalImagesCount}`);
    expect(finalImagesCount).toBeGreaterThanOrEqual(newImagesCount);
    
    // Capturar una screenshot para verificación visual
    await page.screenshot({ path: 'test-results/admin-image-upload-success.png' });
    
    console.log('Test completado exitosamente');
  });
});