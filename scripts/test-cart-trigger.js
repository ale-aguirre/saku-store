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
    console.log('Navegando a http://localhost:3003/productos...');
    await page.goto('http://localhost:3003/productos');
    await page.waitForLoadState('networkidle');
    
    console.log('Página cargada. Verificando cart trigger...');
    
    // Esperar un poco más para que se carguen los datos
    await page.waitForTimeout(3000);
    
    // Verificar si el cart trigger está presente
    const cartTrigger = await page.locator('[data-testid="cart-trigger"]').count();
    console.log(`Cart triggers encontrados: ${cartTrigger}`);
    
    if (cartTrigger > 0) {
      console.log('✅ Cart trigger encontrado');
      
      // Verificar si es visible
      const isVisible = await page.locator('[data-testid="cart-trigger"]').isVisible();
      console.log(`Cart trigger visible: ${isVisible}`);
      
      if (isVisible) {
        console.log('Intentando hacer click en cart trigger...');
        await page.locator('[data-testid="cart-trigger"]').click();
        
        // Verificar si se abrió el carrito
        await page.waitForTimeout(1000);
        const cartContent = await page.locator('[role="dialog"]').count();
        console.log(`Dialogs abiertos: ${cartContent}`);
        
        if (cartContent > 0) {
          console.log('✅ Carrito se abrió correctamente');
        } else {
          console.log('❌ Carrito no se abrió');
        }
      } else {
        console.log('❌ Cart trigger no es visible');
      }
    } else {
      console.log('❌ Cart trigger no encontrado');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();