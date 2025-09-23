const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navegando a http://localhost:3003...');
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    
    console.log('Página principal cargada. Buscando elementos de navegación...');
    
    // Buscar todos los links y botones que contengan "producto"
    const productLinks = await page.locator('a, button').filter({ hasText: /producto/i }).count();
    console.log(`Links/botones con "producto": ${productLinks}`);
    
    if (productLinks > 0) {
      const elements = await page.locator('a, button').filter({ hasText: /producto/i }).all();
      for (let i = 0; i < elements.length; i++) {
        const text = await elements[i].textContent();
        const href = await elements[i].getAttribute('href');
        console.log(`  ${i + 1}. Texto: "${text}", href: "${href}"`);
      }
    }
    
    // Buscar navegación específica
    const navLinks = await page.locator('nav a').count();
    console.log(`Links en navegación: ${navLinks}`);
    
    if (navLinks > 0) {
      const navElements = await page.locator('nav a').all();
      for (let i = 0; i < navElements.length; i++) {
        const text = await navElements[i].textContent();
        const href = await navElements[i].getAttribute('href');
        console.log(`  Nav ${i + 1}. Texto: "${text}", href: "${href}"`);
      }
    }
    
    // Intentar navegar directamente a /productos
    console.log('Navegando directamente a /productos...');
    await page.goto('http://localhost:3003/productos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const productCards = await page.locator('[data-testid="product-card"]').count();
    console.log(`Product cards en /productos: ${productCards}`);
    
    if (productCards > 0) {
      console.log('✅ Productos encontrados en /productos');
      
      // Intentar hacer click en el primer producto
      console.log('Haciendo click en el primer producto...');
      await page.locator('[data-testid="product-card"]').first().click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      console.log(`URL después del click: ${currentUrl}`);
      
      // Verificar si estamos en una PDP
      const h1Count = await page.locator('h1').count();
      console.log(`H1 elements en PDP: ${h1Count}`);
      
      if (h1Count > 0) {
        const h1Text = await page.locator('h1').first().textContent();
        console.log(`Título de la PDP: "${h1Text}"`);
      }
    } else {
      console.log('❌ No se encontraron productos en /productos');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();