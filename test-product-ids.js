const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navegando a http://localhost:3003/productos...');
    await page.goto('http://localhost:3003/productos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Obtener todos los product cards
    const productCards = await page.locator('[data-testid="product-card"]').all();
    console.log(`Productos encontrados: ${productCards.length}`);
    
    for (let i = 0; i < productCards.length; i++) {
      const card = productCards[i];
      
      // Obtener el href del link
      const href = await card.getAttribute('href');
      console.log(`Producto ${i + 1}: href="${href}"`);
      
      // Obtener el texto del producto
      const productName = await card.locator('h3').textContent();
      console.log(`  Nombre: "${productName}"`);
    }
    
    // Intentar navegar al primer producto manualmente
    if (productCards.length > 0) {
      const firstHref = await productCards[0].getAttribute('href');
      if (firstHref) {
        console.log(`\nNavegando manualmente a: ${firstHref}`);
        await page.goto(`http://localhost:3003${firstHref}`);
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        console.log(`URL actual: ${currentUrl}`);
        
        // Verificar si hay elementos de PDP
        const h1Count = await page.locator('h1').count();
        const sizeSelectors = await page.locator('[data-testid="size-selector"]').count();
        const colorSelectors = await page.locator('[data-testid="color-selector"]').count();
        const addToCartButton = await page.locator('[data-testid="add-to-cart"]').count();
        
        console.log(`H1 elements: ${h1Count}`);
        console.log(`Size selectors: ${sizeSelectors}`);
        console.log(`Color selectors: ${colorSelectors}`);
        console.log(`Add to cart buttons: ${addToCartButton}`);
        
        if (h1Count > 0) {
          const h1Text = await page.locator('h1').first().textContent();
          console.log(`Título H1: "${h1Text}"`);
        }
        
        if (sizeSelectors > 0 && colorSelectors > 0 && addToCartButton > 0) {
          console.log('✅ PDP parece estar funcionando correctamente');
        } else {
          console.log('❌ PDP no tiene todos los elementos esperados');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();