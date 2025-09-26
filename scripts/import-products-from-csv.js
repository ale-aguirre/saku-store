#!/usr/bin/env node

/**
 * Script para importar productos desde CSV de TiendaNube a Supabase
 * 
 * Uso: node scripts/import-products-from-csv.js
 */

// Cargar variables de entorno
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Función para logging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync('import-log.txt', logMessage + '\n');
}

// Configuración
const CSV_PATH = path.join(__dirname, '..', 'docs', 'productos_exportados.csv');
const PLACEHOLDER_IMAGE_BASE = 'https://via.placeholder.com/600x800/d8ceb5/000000?text=';

// Cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.error('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Genera una imagen placeholder para el producto
 */
function generatePlaceholderImage(productName) {
  const encodedName = encodeURIComponent(productName.substring(0, 20));
  return `${PLACEHOLDER_IMAGE_BASE}${encodedName}`;
}

/**
 * Convierte precio de string a centavos
 */
function priceToInteger(priceString) {
  if (!priceString || priceString === '') return 0;
  
  // Remover símbolos de moneda y espacios
  const cleanPrice = priceString.replace(/[$\s,]/g, '').replace(',', '.');
  const price = parseFloat(cleanPrice);
  
  return Math.round(price * 100); // Convertir a centavos
}

/**
 * Normaliza el nombre de categoría
 */
function normalizeCategory(category) {
  if (!category) return 'general';
  
  const categoryMap = {
    'brasieres': 'brasieres',
    'brasier': 'brasieres',
    'conjuntos': 'conjuntos',
    'conjunto': 'conjuntos',
    'bombachas': 'bombachas',
    'bombacha': 'bombachas',
    'bodies': 'bodies',
    'body': 'bodies',
    'lencería': 'general',
    'ropa interior': 'general'
  };
  
  const normalized = category.toLowerCase().trim();
  return categoryMap[normalized] || 'general';
}

// Contador global para SKUs únicos
let skuCounter = 0;

/**
 * Genera SKU único para producto
 */
function generateSKU(productName) {
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  skuCounter++;
  return `saku-${cleanName}-${Date.now()}-${skuCounter}`;
}

/**
 * Genera SKU único para variante
 */
function generateVariantSKU(productSKU, size, color) {
  const sizeCode = size ? size.toString().replace(/\s+/g, '') : 'UNI';
  const colorCode = color ? color.substring(0, 3).toUpperCase() : 'DEF';
  return `${productSKU}-${sizeCode}-${colorCode}`;
}

/**
 * Procesa los datos del CSV y los agrupa por producto
 */
async function processCSVData() {
  log('🔄 Iniciando procesamiento de CSV...');
  return new Promise((resolve, reject) => {
    const products = new Map();
    let rowCount = 0;
    
    fs.createReadStream(CSV_PATH)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        rowCount++;
        if (rowCount <= 5) {
          console.log(`📋 Fila ${rowCount}:`, Object.keys(row));
        }
        try {
          const productId = row['Identificador de URL'] || row['Nombre'];
          
          if (!productId) {
            console.warn('⚠️ Fila sin identificador, saltando:', row);
            return;
          }
          
          // Si el producto no existe, crearlo
          if (!products.has(productId)) {
            const basePrice = priceToInteger(row['Precio'] || '15000');
            products.set(productId, {
              name: row['Nombre'] || 'Producto sin nombre',
              description: row['Descripción'] || '',
              sku: generateSKU(row['Nombre'] || 'Producto'),
              base_price: basePrice,
              category: normalizeCategory(row['Categorías']),
              brand: 'Sakú',
              is_active: true,
              images: [generatePlaceholderImage(row['Nombre'] || 'Producto')],
              variants: []
            });
          }
          
          const product = products.get(productId);
          
          // Procesar variante si tiene propiedades
          const propertyName1 = row['Nombre de propiedad 1'];
          const propertyValue1 = row['Valor de propiedad 1'];
          const propertyName2 = row['Nombre de propiedad 2'];
          const propertyValue2 = row['Valor de propiedad 2'];
          const price = priceToInteger(row['Precio']);
          const stock = parseInt(row['Stock']) || 0;
          
          // Determinar talle y color de las propiedades
          let size = '85'; // Valor por defecto
          let color = 'negro'; // Valor por defecto
          
          if (propertyName1 === 'Talle' && propertyValue1) {
            size = propertyValue1;
          } else if (propertyName2 === 'Talle' && propertyValue2) {
            size = propertyValue2;
          }
          
          if (propertyName1 === 'Color' && propertyValue1) {
            color = propertyValue1;
          } else if (propertyName2 === 'Color' && propertyValue2) {
            color = propertyValue2;
          }
          
          // Buscar si ya existe una variante con estas propiedades
          let variant = product.variants.find(v => v.size === size && v.color === color);
          
          if (!variant) {
            variant = {
              size: size,
              color: color,
              sku: `${product.sku || generateSKU(product.name)}-${size}-${color}`,
              price_adjustment: 0, // Ajuste de precio respecto al base_price
              stock_quantity: stock,
              is_active: true
            };
            product.variants.push(variant);
          } else {
            // Actualizar propiedades existentes
            if (stock > 0) variant.stock_quantity = stock;
          }
          
        } catch (error) {
          console.error('❌ Error procesando fila:', error, row);
        }
      })
      .on('end', () => {
        log(`✅ CSV procesado correctamente. ${rowCount} filas leídas`);
        log(`📦 ${products.size} productos únicos encontrados`);
        
        // Generar SKUs únicos para todas las variantes
        for (const [productId, product] of products) {
          // Generar SKU base del producto si no existe
          if (!product.sku) {
            product.sku = generateSKU(product.name);
          }
          
          product.variants.forEach(variant => {
            variant.sku = generateVariantSKU(product.sku, variant.size, variant.color);
          });
        }
        
        resolve(Array.from(products.values()));
      })
      .on('error', (error) => {
        log(`❌ Error leyendo CSV: ${error.message}`);
        reject(error);
      });
  });
}

/**
 * Función para esperar un tiempo determinado
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Inserta productos en Supabase con delays para evitar rate limiting
 */
async function insertProducts(products) {
  log(`📦 Insertando ${products.length} productos...`);
  let insertedCount = 0;
  
  for (let i = 0; i < products.length; i++) {
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
      insertedCount++;
      
      // Delay pequeño después de insertar producto
      await sleep(100);
      
      // Insertar variantes
      for (let j = 0; j < product.variants.length; j++) {
        const variant = product.variants[j];
        
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
        
        // Delay pequeño entre variantes
        await sleep(50);
      }
      
      // Delay más largo cada 5 productos para evitar rate limiting
      if ((i + 1) % 5 === 0) {
        log(`⏳ Pausa de seguridad después de ${i + 1} productos...`);
        await sleep(1000);
      }
      
    } catch (error) {
      log(`❌ Error general con producto "${product.name}": ${error.message}`);
      log(`📊 Stack trace: ${error.stack}`);
      
      // En caso de error crítico, esperar más tiempo antes de continuar
      await sleep(2000);
    }
  }
  
  log(`📊 Resumen final: ${insertedCount}/${products.length} productos insertados exitosamente`);
}

/**
 * Función principal
 */
async function main() {
  try {
    log('🚀 Iniciando importación de productos desde CSV...');
    log('📁 Archivo CSV: ' + CSV_PATH);
    
    // Verificar que el archivo CSV existe
    if (!fs.existsSync(CSV_PATH)) {
      log(`❌ Archivo CSV no encontrado: ${CSV_PATH}`);
      process.exit(1);
    }
    
    // Procesar datos del CSV
    log('📖 Leyendo y procesando CSV...');
    const products = await processCSVData();
    log('✅ CSV procesado exitosamente');
    
    log(`📊 Productos procesados: ${products.length}`);
    log('📋 Resumen:');
    products.forEach(product => {
      log(`  - ${product.name} (${product.variants.length} variantes)`);
    });
    
    // Confirmar antes de insertar
    log('\n⚠️  ¿Continuar con la inserción? (Ctrl+C para cancelar)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Insertar en Supabase
    log('🔄 Iniciando inserción en Supabase...');
    await insertProducts(products);
    
    log('\n🎉 Importación completada!');
    
  } catch (error) {
    log(`❌ Error durante la importación: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, processCSVData, insertProducts };