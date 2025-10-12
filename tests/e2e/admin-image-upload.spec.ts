import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

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

  test('Debe mostrar la funcionalidad de drag and drop para imágenes', async ({ page }) => {
    // Filtrar errores de placeholder para enfocarse en errores reales
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('via.placeholder.com') && !msg.text().includes('400')) {
        console.log('❌ Error de consola:', msg.text());
      }
    });
    
    // Navegar directamente a la página de edición de un producto específico
    await page.goto('/admin/productos/21132d18-72c1-4311-b493-389aeb9292a3');
    
    // Esperar a que cargue la página de edición
    await page.waitForSelector('h1:has-text("Editar Producto")');
    
    // Hacer clic en la pestaña "Imágenes" para mostrar el componente ImageUpload
    await page.click('button[data-state]:has-text("Imágenes")');
    console.log('✅ Pestaña de imágenes activada');
    
    // Esperar a que aparezca la zona de drop
    await page.waitForSelector('[data-testid="image-upload-dropzone"]');
    
    // Verificar que la zona de drop esté visible
    const dropZone = page.locator('[data-testid="image-upload-dropzone"]');
    expect(await dropZone.isVisible()).toBe(true);
    console.log('✅ Zona de drop visible');
    
    // Verificar que tenga el texto correcto para drag and drop
    const dropZoneText = await dropZone.textContent();
    expect(dropZoneText).toContain('Arrastra');
    console.log('✅ Texto de drag and drop presente');
    
    // Hacer clic en la zona de drop para activar el input de archivo
    await dropZone.click();
    console.log('✅ Clic en zona de drop realizado');
    
    // Verificar que el input de archivo esté presente y sea funcional
    const fileInput = page.locator('input[type="file"]');
    expect(await fileInput.count()).toBeGreaterThan(0);
    console.log('✅ Input de archivo presente');
    
    // Verificar que el input acepta múltiples archivos
    const isMultiple = await fileInput.getAttribute('multiple');
    expect(isMultiple).not.toBeNull();
    console.log('✅ Input acepta múltiples archivos');
    
    // Verificar que acepta tipos de imagen
    const acceptTypes = await fileInput.getAttribute('accept');
    expect(acceptTypes).toContain('image');
    console.log('✅ Input acepta tipos de imagen');
    
    // Simular hover sobre la zona de drop para verificar estados visuales
    await dropZone.hover();
    console.log('✅ Hover sobre zona de drop funcional');
    
    console.log('🎉 Test de funcionalidad drag and drop completado exitosamente');
  });
});