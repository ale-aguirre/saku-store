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
  
  try {
    console.log('=== TEST CART TRIGGER DESPUÉS DE AGREGAR PRODUCTO ===');
    
    // 1. Ir directamente a una PDP
    console.log('1. Navegando directamente a PDP...');
    await page.goto('http://localhost:3003/productos/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 2. Verificar estado inicial del cart trigger
    console.log('2. Verificando estado inicial del cart trigger...');
    const cartTrigger = page.locator('[data-testid="cart-trigger"]');
    const initialVisible = await cartTrigger.isVisible();
    const initialEnabled = await cartTrigger.isEnabled();
    console.log(`   Inicial - Visible: ${initialVisible}, Enabled: ${initialEnabled}`);
    
    // Verificar cart count inicial
    const cartCount = page.locator('[data-testid="cart-count"]');
    const initialCountVisible = await cartCount.isVisible();
    console.log(`   Cart count inicial visible: ${initialCountVisible}`);
    
    // 3. Seleccionar variantes
    console.log('3. Seleccionando variantes...');
    await page.locator('[data-testid="size-selector"]').first().click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid="color-selector"]').first().click();
    await page.waitForTimeout(500);
    
    // 4. Verificar que el botón add-to-cart está habilitado
    console.log('4. Verificando botón add-to-cart...');
    const addToCartButton = page.locator('[data-testid="add-to-cart"]');
    const addToCartEnabled = await addToCartButton.isEnabled();
    console.log(`   Add to cart enabled: ${addToCartEnabled}`);
    
    if (!addToCartEnabled) {
      console.log('❌ Botón add-to-cart no está habilitado');
      return;
    }
    
    // 5. Agregar al carrito
    console.log('5. Agregando al carrito...');
    await addToCartButton.click();
    await page.waitForTimeout(3000); // Esperar más tiempo para que se actualice el estado
    
    // 6. Verificar estado del cart trigger después de agregar
    console.log('6. Verificando cart trigger después de agregar...');
    const afterVisible = await cartTrigger.isVisible();
    const afterEnabled = await cartTrigger.isEnabled();
    console.log(`   Después - Visible: ${afterVisible}, Enabled: ${afterEnabled}`);
    
    // Verificar cart count después de agregar
    const afterCountVisible = await cartCount.isVisible();
    if (afterCountVisible) {
      const countText = await cartCount.textContent();
      console.log(`   Cart count después: "${countText}"`);
    } else {
      console.log(`   Cart count después: no visible`);
    }
    
    // 7. Verificar si hay elementos que puedan estar bloqueando el click
    console.log('7. Verificando elementos que puedan bloquear...');
    
    // Verificar si hay overlays o elementos que puedan estar encima
    const boundingBox = await cartTrigger.boundingBox();
    if (boundingBox) {
      console.log(`   Bounding box: x=${boundingBox.x}, y=${boundingBox.y}, width=${boundingBox.width}, height=${boundingBox.height}`);
      
      // Verificar qué elemento está en esa posición
      const elementAtPoint = await page.evaluate(({ x, y }) => {
        const element = document.elementFromPoint(x + 10, y + 10);
        return {
          tagName: element?.tagName,
          className: element?.className,
          testId: element?.getAttribute('data-testid'),
          id: element?.id
        };
      }, { x: boundingBox.x, y: boundingBox.y });
      
      console.log(`   Elemento en la posición:`, elementAtPoint);
    }
    
    // 8. Intentar diferentes formas de hacer click
    console.log('8. Intentando diferentes formas de click...');
    
    try {
      console.log('   Método 1: Click normal...');
      await cartTrigger.click();
      await page.waitForTimeout(2000);
      
      const dialogCount = await page.locator('[role="dialog"]').count();
      console.log(`   Dialogs después del click: ${dialogCount}`);
      
      if (dialogCount > 0) {
        console.log('✅ Click normal funcionó');
      } else {
        console.log('❌ Click normal no abrió el carrito');
        
        // Método 2: Force click
        console.log('   Método 2: Force click...');
        await cartTrigger.click({ force: true });
        await page.waitForTimeout(2000);
        
        const dialogCount2 = await page.locator('[role="dialog"]').count();
        console.log(`   Dialogs después del force click: ${dialogCount2}`);
        
        if (dialogCount2 > 0) {
          console.log('✅ Force click funcionó');
        } else {
          console.log('❌ Force click tampoco funcionó');
        }
      }
      
    } catch (error) {
      console.log(`❌ Error al hacer click: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error general:', error.message);
  } finally {
    await browser.close();
  }
})();