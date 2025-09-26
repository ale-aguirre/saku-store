#!/usr/bin/env node

/**
 * Script para asignar categorías y generar slugs para los productos
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

// Función para generar slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones múltiples
    .trim('-'); // Remover guiones al inicio y final
}

// Función para categorizar productos basado en el nombre
function categorizeProduct(name) {
  const nameLower = name.toLowerCase();
  
  // Palabras clave para cada categoría
  const categories = {
    'bombachas': ['bombacha', 'bombi', 'tanga', 'culote', 'picco', 'less'],
    'corpinos': ['corpiño', 'corpino', 'bralette', 'top', 'sujetador'],
    'conjuntos': ['conjunto', 'set', 'pack', 'body', 'corset', 'lencería']
  };
  
  // Buscar coincidencias
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      return category;
    }
  }
  
  // Por defecto, asignar a conjuntos si no se encuentra categoría específica
  return 'conjuntos';
}

async function main() {
  try {
    console.log('🔍 Obteniendo categorías...');
    
    // Obtener categorías existentes
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug');
      
    if (catError) {
      console.error('❌ Error obteniendo categorías:', catError);
      return;
    }
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });
    
    console.log('📊 Categorías disponibles:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}): ${cat.id}`);
    });
    
    console.log('\n🔍 Obteniendo productos sin metadata...');
    
    // Obtener productos que necesitan slug o categoría
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, slug, category_id')
      .or('slug.is.null,category_id.is.null');
      
    if (prodError) {
      console.error('❌ Error obteniendo productos:', prodError);
      return;
    }
    
    console.log(`📦 ${products.length} productos necesitan actualización`);
    
    let updated = 0;
    
    for (const product of products) {
      const updates = {};
      
      // Generar slug si no existe
      if (!product.slug) {
        updates.slug = generateSlug(product.name);
      }
      
      // Asignar categoría si no existe
      if (!product.category_id) {
        const categorySlug = categorizeProduct(product.name);
        updates.category_id = categoryMap[categorySlug];
      }
      
      if (Object.keys(updates).length > 0) {
        console.log(`🔄 Actualizando "${product.name}"`);
        console.log(`   - Slug: ${updates.slug || product.slug}`);
        console.log(`   - Categoría: ${updates.category_id || product.category_id}`);
        
        const { error: updateError } = await supabase
          .from('products')
          .update(updates)
          .eq('id', product.id);
          
        if (updateError) {
          console.error(`❌ Error actualizando ${product.name}:`, updateError);
        } else {
          updated++;
        }
      }
    }
    
    console.log(`\n✅ ${updated} productos actualizados exitosamente`);
    
    // Verificar duplicados de slug
    console.log('\n🔍 Verificando slugs duplicados...');
    
    const { data: slugCheck, error: slugError } = await supabase
      .from('products')
      .select('slug')
      .not('slug', 'is', null);
      
    if (slugError) {
      console.error('❌ Error verificando slugs:', slugError);
      return;
    }
    
    const slugCounts = {};
    slugCheck.forEach(p => {
      slugCounts[p.slug] = (slugCounts[p.slug] || 0) + 1;
    });
    
    const duplicates = Object.entries(slugCounts).filter(([slug, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log('⚠️  Slugs duplicados encontrados:');
      duplicates.forEach(([slug, count]) => {
        console.log(`  - "${slug}": ${count} productos`);
      });
    } else {
      console.log('✅ No se encontraron slugs duplicados');
    }
    
    console.log('\n🎉 Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };