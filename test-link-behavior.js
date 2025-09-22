const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('=== VERIFICANDO COMPORTAMIENTO DEL LINK ===');
    
    // 1. Ir a productos
    console.log('1. Navegando a productos...');
    await page.goto('http://localhost:3003/productos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 2. Verificar que hay productos
    const productCount = await page.locator('[data-testid="product-card"]').count();
    console.log(`   Productos encontrados: ${productCount}`);
    
    if (productCount === 0) {
      console.log('❌ No se encontraron productos');
      return;
    }
    
    // 3. Verificar el href del primer producto
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const href = await firstProduct.getAttribute('href');
    console.log(`   Href del primer producto: ${href}`);
    
    // 4. Verificar si es un Link de Next.js
    const tagName = await firstProduct.evaluate(el => el.tagName);
    console.log(`   Tag name: ${tagName}`);
    
    // 5. Intentar diferentes formas de hacer click
    console.log('5. Probando diferentes formas de click...');
    
    // Método 1: Click normal
    console.log('   Método 1: Click normal...');
    const urlBefore = page.url();
    console.log(`   URL antes: ${urlBefore}`);
    
    await firstProduct.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log(`   URL después: ${urlAfter}`);
    
    if (urlAfter !== urlBefore) {
      console.log('✅ Click normal funcionó');
    } else {
      console.log('❌ Click normal no funcionó');
      
      // Método 2: Navegación manual
      console.log('   Método 2: Navegación manual...');
      if (href) {
        await page.goto(`http://localhost:3003${href}`);
        await page.waitForLoadState('networkidle');
        
        const finalUrl = page.url();
        console.log(`   URL final: ${finalUrl}`);
        
        if (finalUrl.includes('/productos/')) {
          console.log('✅ Navegación manual funcionó');
          
          // Verificar elementos de la PDP
          const h1Count = await page.locator('h1').count();
          const addToCartCount = await page.locator('[data-testid="add-to-cart"]').count();
          console.log(`   H1: ${h1Count}, Add to cart: ${addToCartCount}`);
          
        } else {
          console.log('❌ Navegación manual no funcionó');
        }
      }
    }
    
    // 6. Verificar si hay JavaScript errors
    console.log('6. Verificando errores de JavaScript...');
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Recargar la página para capturar errores
    await page.reload();
    await page.waitForTimeout(2000);
    
    if (jsErrors.length > 0) {
      console.log('   Errores de JavaScript encontrados:');
      jsErrors.forEach(error => console.log(`     - ${error}`));
    } else {
      console.log('   No se encontraron errores de JavaScript');
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
  } finally {
    await browser.close();
  }
})();