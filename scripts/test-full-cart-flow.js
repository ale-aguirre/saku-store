const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capturar errores de consola
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`CONSOLE ${msg.type().toUpperCase()}:`, msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('=== INICIANDO FLUJO COMPLETO DEL CARRITO ===');
    
    // 1. Ir a la página principal
    console.log('1. Navegando a la página principal...');
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    
    // 2. Ir a productos
    console.log('2. Navegando a productos...');
    await page.click('text=Productos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const productCount = await page.locator('[data-testid="product-card"]').count();
    console.log(`   Productos encontrados: ${productCount}`);
    
    if (productCount === 0) {
      console.log('❌ No se encontraron productos');
      return;
    }
    
    // 3. Hacer click en el primer producto
    console.log('3. Haciendo click en el primer producto...');
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log(`   URL actual: ${currentUrl}`);
    
    if (!currentUrl.match(/\/productos\/\d+$/)) {
      console.log('❌ No navegó a la PDP correctamente');
      return;
    }
    
    // 4. Verificar elementos de la PDP
    console.log('4. Verificando elementos de la PDP...');
    const h1Count = await page.locator('h1').count();
    const sizeSelectors = await page.locator('[data-testid="size-selector"]').count();
    const colorSelectors = await page.locator('[data-testid="color-selector"]').count();
    const addToCartButton = await page.locator('[data-testid="add-to-cart"]').count();
    
    console.log(`   H1: ${h1Count}, Size selectors: ${sizeSelectors}, Color selectors: ${colorSelectors}, Add to cart: ${addToCartButton}`);
    
    if (sizeSelectors === 0 || colorSelectors === 0 || addToCartButton === 0) {
      console.log('❌ Faltan elementos en la PDP');
      return;
    }
    
    // 5. Seleccionar talle
    console.log('5. Seleccionando talle...');
    await page.locator('[data-testid="size-selector"]').first().click();
    await page.waitForTimeout(1000);
    
    // 6. Seleccionar color
    console.log('6. Seleccionando color...');
    await page.locator('[data-testid="color-selector"]').first().click();
    await page.waitForTimeout(1000);
    
    // 7. Verificar que el botón está habilitado
    console.log('7. Verificando botón add-to-cart...');
    const isEnabled = await page.locator('[data-testid="add-to-cart"]').isEnabled();
    console.log(`   Botón habilitado: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ Botón add-to-cart no está habilitado');
      return;
    }
    
    // 8. Agregar al carrito
    console.log('8. Agregando al carrito...');
    await page.locator('[data-testid="add-to-cart"]').click();
    await page.waitForTimeout(2000);
    
    // 9. Verificar contador del carrito
    console.log('9. Verificando contador del carrito...');
    const cartCountElement = page.locator('[data-testid="cart-count"]');
    const cartCountVisible = await cartCountElement.isVisible();
    console.log(`   Cart count visible: ${cartCountVisible}`);
    
    if (cartCountVisible) {
      const cartCountText = await cartCountElement.textContent();
      console.log(`   Cart count text: "${cartCountText}"`);
    }
    
    // 10. Verificar cart trigger
    console.log('10. Verificando cart trigger...');
    const cartTrigger = page.locator('[data-testid="cart-trigger"]');
    const triggerVisible = await cartTrigger.isVisible();
    const triggerEnabled = await cartTrigger.isEnabled();
    console.log(`   Cart trigger visible: ${triggerVisible}, enabled: ${triggerEnabled}`);
    
    if (!triggerVisible) {
      console.log('❌ Cart trigger no es visible');
      return;
    }
    
    // 11. Intentar hacer click en el cart trigger
    console.log('11. Haciendo click en cart trigger...');
    try {
      await cartTrigger.click();
      await page.waitForTimeout(2000);
      
      // 12. Verificar si se abrió el carrito
      console.log('12. Verificando si se abrió el carrito...');
      const cartDialog = await page.locator('[role="dialog"]').count();
      const cartItems = await page.locator('[data-testid="cart-item"]').count();
      
      console.log(`   Dialogs abiertos: ${cartDialog}`);
      console.log(`   Cart items: ${cartItems}`);
      
      if (cartDialog > 0) {
        console.log('✅ Carrito se abrió correctamente');
        if (cartItems > 0) {
          console.log('✅ Producto encontrado en el carrito');
        } else {
          console.log('⚠️ Carrito abierto pero sin productos');
        }
      } else {
        console.log('❌ Carrito no se abrió');
      }
      
    } catch (error) {
      console.log(`❌ Error al hacer click en cart trigger: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
  } finally {
    await browser.close();
  }
})();