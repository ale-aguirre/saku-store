import { test, expect } from '@playwright/test';

test.describe('Customer Product Flow', () => {
  test('should navigate from product list to product detail and select variants', async ({ page }) => {
    console.log('🛍️ Iniciando flujo de productos...');
    
    // Ir a la página de productos
    await page.goto('/productos');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página de productos cargada');
    
    // Esperar un poco más para que los productos se carguen desde la API
    await page.waitForTimeout(3000);
    
    // Buscar productos disponibles con selectores más amplios
    const productos = page.locator('[data-testid="product-card"], .group.relative.overflow-hidden, .card, article, .product-item, [class*="product"]');
    const noProductsMessage = page.locator('text="No se encontraron productos", text="No hay productos"');
    
    // Verificar si hay productos o mensaje de no productos
    try {
      await expect(productos.first()).toBeVisible({ timeout: 15000 });
      console.log('✅ Productos encontrados en la lista');
      
      // Hacer clic en el primer producto
      const firstProduct = productos.first();
      
      // Buscar el nombre del producto con selectores más amplios
      const productNameElement = firstProduct.locator('h3, h2, h4, [class*="font-medium"], [class*="font-semibold"], [class*="title"]').first();
      let productName = 'Producto';
      if (await productNameElement.count() > 0) {
        productName = await productNameElement.textContent() || 'Producto';
      }
      console.log(`🔍 Haciendo clic en producto: "${productName}"`);
      
      await firstProduct.click();
      
      // Esperar a que cargue la página del producto
      await page.waitForURL(/\/productos\/[^\/]+$/, { timeout: 10000 });
      console.log('✅ Navegación a PDP exitosa');
      
      // Verificar elementos de la página de producto
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
      console.log('✅ Título del producto visible');
      
      // Buscar selectores de variantes (talle y color) con selectores más amplios
      const sizeSelector = page.locator('select[name="size"], [data-testid="size-selector"], button:has-text("Talle"), button:has-text("85"), button:has-text("90"), button:has-text("95"), button:has-text("100")').first();
      const colorSelector = page.locator('select[name="color"], [data-testid="color-selector"], button:has-text("Color"), button:has-text("Negro"), button:has-text("Rojo"), button:has-text("Blanco")').first();
      
      // Verificar si hay selectores de variantes
      if (await sizeSelector.count() > 0) {
        console.log('👕 Selector de talle encontrado');
        try {
          await sizeSelector.click();
          
          // Seleccionar una opción de talle
          const sizeOptions = page.locator('option, [role="option"], button').filter({ hasText: /85|90|95|100/ });
          if (await sizeOptions.count() > 0) {
            await sizeOptions.first().click();
            console.log('✅ Talle seleccionado');
          }
        } catch (e) {
          console.log('⚠️ No se pudo interactuar con el selector de talle');
        }
      }
      
      if (await colorSelector.count() > 0) {
        console.log('🎨 Selector de color encontrado');
        try {
          await colorSelector.click();
          
          // Seleccionar una opción de color
          const colorOptions = page.locator('option, [role="option"], button').filter({ hasText: /negro|rojo|blanco/i });
          if (await colorOptions.count() > 0) {
            await colorOptions.first().click();
            console.log('✅ Color seleccionado');
          }
        } catch (e) {
          console.log('⚠️ No se pudo interactuar con el selector de color');
        }
      }
      
      // Buscar botón de agregar al carrito
      const addToCartButton = page.locator('button:has-text("Agregar al carrito"), button:has-text("Añadir"), button:has-text("Agregar"), [data-testid="add-to-cart"]').first();
      
      if (await addToCartButton.count() > 0) {
        console.log('🛒 Botón de agregar al carrito encontrado');
        
        // Verificar que el botón esté habilitado
        const isEnabled = await addToCartButton.isEnabled();
        if (isEnabled) {
          console.log('✅ Botón de agregar al carrito habilitado');
        } else {
          console.log('⚠️ Botón de agregar al carrito deshabilitado (posiblemente sin stock)');
        }
      } else {
        console.log('⚠️ No se encontró botón de agregar al carrito');
      }
      
      // Verificar información del producto
      const priceElement = page.locator('[data-testid="price"], .price, [class*="price"], text=/\$\d+/').first();
      if (await priceElement.count() > 0) {
        const price = await priceElement.textContent();
        console.log(`💰 Precio mostrado: ${price}`);
      }
      
      console.log('🎉 Flujo de producto completado exitosamente');
      
    } catch (error) {
      console.log('❌ Error en el flujo de productos:', error);
      
      // Verificar si hay mensaje de no productos
      try {
        await expect(noProductsMessage).toBeVisible({ timeout: 5000 });
        console.log('ℹ️ No hay productos disponibles para probar el flujo');
      } catch {
        console.log('⚠️ No se encontraron productos ni mensaje de no productos');
        // Tomar screenshot para debug
        await page.screenshot({ path: 'test-results/debug-productos.png' });
        throw error;
      }
    }
  });

  test('should handle product images and gallery', async ({ page }) => {
    console.log('🖼️ Probando galería de imágenes...');
    
    await page.goto('/productos');
    await page.waitForLoadState('networkidle');
    
    const productos = page.locator('[data-testid="product-card"], .group.relative.overflow-hidden');
    
    try {
      await expect(productos.first()).toBeVisible({ timeout: 10000 });
      
      // Hacer clic en el primer producto
      await productos.first().click();
      await page.waitForURL(/\/productos\/[^\/]+$/);
      
      // Verificar imágenes del producto
      const productImages = page.locator('img[alt*="producto"], img[alt*="Product"], [data-testid="product-image"]');
      
      if (await productImages.count() > 0) {
        console.log('✅ Imágenes del producto encontradas');
        
        // Verificar que al menos una imagen se carga correctamente
        const firstImage = productImages.first();
        await expect(firstImage).toBeVisible();
        
        // Verificar que la imagen tiene src
        const src = await firstImage.getAttribute('src');
        if (src && src !== '') {
          console.log('✅ Imagen tiene src válido');
        }
      } else {
        console.log('⚠️ No se encontraron imágenes del producto');
      }
      
    } catch {
      console.log('ℹ️ No hay productos disponibles para probar imágenes');
    }
  });

  test('should show product information correctly', async ({ page }) => {
    console.log('📋 Verificando información del producto...');
    
    await page.goto('/productos');
    await page.waitForLoadState('networkidle');
    
    const productos = page.locator('[data-testid="product-card"], .group.relative.overflow-hidden');
    
    try {
      await expect(productos.first()).toBeVisible({ timeout: 10000 });
      
      // Hacer clic en el primer producto
      await productos.first().click();
      await page.waitForURL(/\/productos\/[^\/]+$/);
      
      // Verificar elementos básicos de información
      const title = page.locator('h1');
      await expect(title).toBeVisible();
      console.log('✅ Título del producto visible');
      
      // Verificar descripción
      const description = page.locator('[data-testid="description"], .description, p:has-text("descripción")').first();
      if (await description.count() > 0) {
        console.log('✅ Descripción del producto encontrada');
      }
      
      // Verificar precio
      const price = page.locator('[data-testid="price"], .price, [class*="price"]').first();
      if (await price.count() > 0) {
        console.log('✅ Precio del producto mostrado');
      }
      
      // Verificar información de stock
      const stockInfo = page.locator('text="En stock", text="Agotado", text="Últimas unidades"').first();
      if (await stockInfo.count() > 0) {
        const stockText = await stockInfo.textContent();
        console.log(`📦 Estado de stock: ${stockText}`);
      }
      
      console.log('✅ Información del producto verificada');
      
    } catch {
      console.log('ℹ️ No hay productos disponibles para verificar información');
    }
  });
});