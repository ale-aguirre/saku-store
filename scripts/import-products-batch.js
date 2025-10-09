#!/usr/bin/env node

/**
 * Script de importación por lotes que puede reanudar desde donde se quedó
 * Importa productos desde CSV a Supabase en lotes pequeños
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Configuración
const CSV_PATH = path.join(__dirname, '..', 'docs', 'reference', 'productos_exportados.csv');
const BATCH_SIZE = 5; // Procesar 5 productos por lote
const DELAY_BETWEEN_BATCHES = 2000; // 2 segundos entre lotes
const DELAY_BETWEEN_PRODUCTS = 200; // 200ms entre productos
const DELAY_BETWEEN_VARIANTS = 100; // 100ms entre variantes

// Función de logging con timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Escribir al archivo de log
  fs.appendFileSync(path.join(__dirname, '..', 'import-batch-log.txt'), logMessage + '\n');
}

// Cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Funciones auxiliares (copiadas del script original)
function generatePlaceholderImage(productName) {
  const encodedName = encodeURIComponent(productName.replace(/\s+/g, '+'));
  return `https://via.placeholder.com/600x800/d8ceb5/000000?text=${encodedName}`;
}

function priceToInteger(priceString) {
  if (!priceString || priceString === '') return 0;
  const cleanPrice = priceString.replace(/[$.,\s]/g, '');
  const price = parseInt(cleanPrice, 10);
  return isNaN(price) ? 0 : price;
}

function normalizeCategory(category) {
  if (!category) return 'otros';
  
  const categoryMap = {
    'tangas': 'tangas',
    'tanga': 'tangas',
    'conjuntos': 'conjuntos',
    'conjunto': 'conjuntos',
    'corsets': 'corsets',
    'corset': 'corsets',
    'bodies': 'bodies',
    'body': 'bodies',
    'accesorios': 'accesorios',
    'accesorio': 'accesorios',
    'gift card': 'gift-cards',
    'giftcard': 'gift-cards'
  };
  
  const normalized = category.toLowerCase().trim();
  return categoryMap[normalized] || 'otros';
}

let skuCounter = 0;

function generateSKU(productName) {
  const timestamp = Date.now();
  skuCounter++;
  const cleanName = productName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
  return `saku-${cleanName}-${timestamp}-${skuCounter}`;
}

function generateVariantSKU(productSKU, size, color) {
  const colorCode = color.substring(0, 3).toUpperCase();
  return `${productSKU}-${size}-${colorCode}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Leer estado de progreso
function readProgress() {
  const progressFile = path.join(__dirname, '..', 'import-progress.json');
  if (fs.existsSync(progressFile)) {
    try {
      const data = fs.readFileSync(progressFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      log(`⚠️ Error leyendo progreso: ${error.message}`);
    }
  }
  return { lastProcessedIndex: -1, totalProducts: 0 };
}

// Guardar estado de progreso
function saveProgress(index, total) {
  const progressFile = path.join(__dirname, '..', 'import-progress.json');
  const progress = { lastProcessedIndex: index, totalProducts: total };
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

// Procesar CSV y obtener productos
async function processCSVData() {
  return new Promise((resolve, reject) => {
    const products = [];
    
    fs.createReadStream(CSV_PATH)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        try {
          const productName = row['Nombre']?.trim();
          if (!productName) return;
          
          const basePrice = priceToInteger(row['Precio']);
          const category = normalizeCategory(row['Categorías']);
          const description = row['Descripción']?.trim() || `${productName} - Lencería de alta calidad`;
          const brand = 'Sakú';
          
          const productSKU = generateSKU(productName);
          
          // Generar variantes para tallas y colores
          const sizes = ['85', '90', '95', '100', '105'];
          const colors = ['Negro', 'Blanco', 'Rojo'];
          const variants = [];
          
          sizes.forEach(size => {
            colors.forEach(color => {
              const variantSKU = generateVariantSKU(productSKU, size, color);
              variants.push({
                size,
                color,
                sku: variantSKU,
                price_adjustment: 0,
                stock_quantity: Math.floor(Math.random() * 5),
                is_active: true
              });
            });
          });
          
          products.push({
            name: productName,
            description,
            sku: productSKU,
            base_price: basePrice,
            category,
            brand,
            is_active: true,
            images: [generatePlaceholderImage(productName)],
            variants
          });
          
        } catch (error) {
          log(`❌ Error procesando fila: ${error.message}`);
        }
      })
      .on('end', () => {
        log(`📊 CSV procesado: ${products.length} productos encontrados`);
        resolve(products);
      })
      .on('error', reject);
  });
}

// Insertar un lote de productos
async function insertBatch(products, startIndex, endIndex) {
  log(`📦 Procesando lote ${startIndex + 1}-${endIndex} de ${products.length}`);
  
  for (let i = startIndex; i < endIndex && i < products.length; i++) {
    const product = products[i];
    
    try {
      log(`🔄 Procesando producto ${i + 1}/${products.length}: ${product.name}`);
      
      // Insertar producto
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          sku: product.sku,
          base_price: product.base_price,
          category: product.category,
          brand: product.brand,
          is_active: product.is_active,
          images: product.images
        })
        .select()
        .single();
      
      if (productError) {
        log(`❌ Error insertando producto "${product.name}": ${productError.message}`);
        continue;
      }
      
      log(`✅ Producto insertado: ${product.name}`);
      
      // Insertar variantes
      for (const variant of product.variants) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: insertedProduct.id,
            size: variant.size,
            color: variant.color,
            sku: variant.sku,
            price_adjustment: variant.price_adjustment,
            stock_quantity: variant.stock_quantity,
            is_active: variant.is_active
          });
        
        if (variantError) {
          log(`❌ Error insertando variante ${variant.sku}: ${variantError.message}`);
        } else {
          log(`  ✅ Variante insertada: ${variant.sku} (${variant.size}, ${variant.color})`);
        }
        
        await sleep(DELAY_BETWEEN_VARIANTS);
      }
      
      // Guardar progreso después de cada producto
      saveProgress(i, products.length);
      
      await sleep(DELAY_BETWEEN_PRODUCTS);
      
    } catch (error) {
      log(`❌ Error general con producto "${product.name}": ${error.message}`);
      await sleep(1000);
    }
  }
}

// Función principal
async function main() {
  try {
    log('🚀 Iniciando importación por lotes...');
    
    // Leer progreso anterior
    const progress = readProgress();
    log(`📊 Progreso anterior: ${progress.lastProcessedIndex + 1}/${progress.totalProducts} productos`);
    
    // Procesar CSV
    const products = await processCSVData();
    
    // Determinar desde dónde continuar
    const startIndex = progress.lastProcessedIndex + 1;
    
    if (startIndex >= products.length) {
      log('🎉 ¡Todos los productos ya fueron procesados!');
      return;
    }
    
    log(`🔄 Continuando desde el producto ${startIndex + 1}/${products.length}`);
    
    // Procesar en lotes
    for (let i = startIndex; i < products.length; i += BATCH_SIZE) {
      const endIndex = Math.min(i + BATCH_SIZE, products.length);
      
      await insertBatch(products, i, endIndex);
      
      // Pausa entre lotes (excepto en el último)
      if (endIndex < products.length) {
        log(`⏳ Pausa entre lotes (${DELAY_BETWEEN_BATCHES}ms)...`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }
    
    log('🎉 ¡Importación completada exitosamente!');
    
    // Limpiar archivo de progreso
    const progressFile = path.join(__dirname, '..', 'import-progress.json');
    if (fs.existsSync(progressFile)) {
      fs.unlinkSync(progressFile);
    }
    
  } catch (error) {
    log(`❌ Error en importación: ${error.message}`);
    log(`📊 Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };