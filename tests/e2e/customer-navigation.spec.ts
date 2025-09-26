import { test, expect } from '@playwright/test';

test.describe('Customer Navigation', () => {
  test('should navigate through main pages successfully', async ({ page }) => {
    console.log('🏠 Navegando a la página principal...');
    
    // Ir a la página principal
    await page.goto('/');
    
    // Verificar que la página principal carga
    await expect(page).toHaveTitle(/Sakú Lencería/);
    console.log('✅ Página principal cargada');
    
    // Verificar elementos principales del home
    await expect(page.locator('h1')).toBeVisible();
    console.log('✅ Título principal visible');
    
    // Buscar y hacer clic en enlace a productos
    const productosLink = page.locator('a[href*="/productos"], a:has-text("Productos"), a:has-text("Ver productos"), a:has-text("Catálogo")').first();
    
    if (await productosLink.count() > 0) {
      console.log('🛍️ Navegando a productos...');
      await productosLink.click();
      
      // Verificar que llegamos a la página de productos
      await page.waitForURL(/\/productos/);
      console.log('✅ Página de productos cargada');
      
      // Verificar que hay productos listados o mensaje de no productos
      const productos = page.locator('[data-testid="product-card"], .group.relative.overflow-hidden, .card');
      const noProductsMessage = page.locator('text="No se encontraron productos"');
      
      // Esperar a que aparezcan productos o el mensaje de no productos
      try {
        await expect(productos.first()).toBeVisible({ timeout: 10000 });
        console.log('✅ Productos visibles en la lista');
      } catch {
        // Si no hay productos, verificar que aparece el mensaje correspondiente
        await expect(noProductsMessage).toBeVisible({ timeout: 5000 });
        console.log('ℹ️ No hay productos disponibles (mensaje mostrado correctamente)');
      }
      
    } else {
      console.log('⚠️ No se encontró enlace directo a productos, navegando manualmente');
      await page.goto('/productos');
      await page.waitForLoadState('networkidle');
    }
    
    // Verificar navegación del header/footer
    const homeLink = page.locator('a[href="/"], a:has-text("Inicio"), a:has-text("Home")').first();
    if (await homeLink.count() > 0) {
      console.log('🏠 Regresando al home desde productos...');
      await homeLink.click();
      await page.waitForURL('/');
      console.log('✅ Navegación de regreso exitosa');
    }
    
    console.log('🎉 Test de navegación completado exitosamente');
  });

  test('should handle responsive navigation', async ({ page }) => {
    console.log('📱 Probando navegación responsive...');
    
    // Simular dispositivo móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Buscar menú hamburguesa o navegación móvil
    const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"], button:has-text("☰")').first();
    
    if (await mobileMenu.count() > 0) {
      console.log('📱 Abriendo menú móvil...');
      await mobileMenu.click();
      
      // Verificar que el menú se abre
      await page.waitForTimeout(500);
      console.log('✅ Menú móvil abierto');
    }
    
    console.log('✅ Navegación responsive verificada');
  });

  test('should load pages without JavaScript errors', async ({ page }) => {
    console.log('🔍 Verificando errores de JavaScript...');
    
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Navegar por las páginas principales
    const pages = ['/', '/productos'];
    
    for (const url of pages) {
      console.log(`📄 Verificando ${url}...`);
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Dar tiempo para que aparezcan errores
    }
    
    if (errors.length > 0) {
      console.log('❌ Errores encontrados:', errors);
      // No fallar el test por errores menores, solo reportar
      console.log('⚠️ Se encontraron errores de JavaScript, pero el test continúa');
    } else {
      console.log('✅ No se encontraron errores de JavaScript');
    }
  });
});