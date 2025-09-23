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
    console.log('Navegando a http://localhost:3000/productos...');
    await page.goto('http://localhost:3000/productos');
    await page.waitForLoadState('networkidle');
    
    console.log('Página cargada. Verificando elementos...');
    
    // Esperar un poco más para que se carguen los datos
    await page.waitForTimeout(3000);
    
    // Verificar si hay productos
    const productCards = await page.locator('[data-testid="product-card"]').count();
    console.log(`Productos encontrados: ${productCards}`);
    
    if (productCards === 0) {
      console.log('No se encontraron productos. Verificando si hay errores...');
      
      // Verificar el contenido de la página
      const pageText = await page.textContent('body');
      console.log('Contenido de la página:');
      console.log(pageText.substring(0, 1000));
      
      // Verificar si hay elementos de carga
      const loadingElements = await page.locator('text=Cargando').count();
      console.log(`Elementos de carga: ${loadingElements}`);
      
      // Verificar si hay mensajes de error
      const errorElements = await page.locator('text=Error').count();
      console.log(`Elementos de error: ${errorElements}`);
    } else {
      console.log('✅ Productos encontrados correctamente');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();