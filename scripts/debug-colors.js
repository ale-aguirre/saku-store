const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('Verificando colores del producto AMORE...');
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        variants:product_variants(
          id,
          size,
          color,
          stock_quantity,
          is_active
        )
      `)
      .eq('slug', 'amore')
      .single();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Producto:', product.name);
    console.log('Variantes encontradas:');
    
    const uniqueColors = [...new Set(product.variants.map(v => v.color))];
    console.log('Colores únicos:', uniqueColors);
    
    product.variants.forEach(variant => {
      console.log(`- Talle: ${variant.size}, Color: '${variant.color}', Stock: ${variant.stock_quantity}, Activo: ${variant.is_active}`);
    });
    
    // Verificar mapeo de colores
    const getColorHex = (colorName) => {
      const colorMap = {
        'negro': '#000000',
        'blanco': '#ffffff',
        'rojo': '#dc2626',
        'rosa': '#ec4899',
        'azul': '#2563eb',
        'verde': '#16a34a',
        'amarillo': '#eab308',
        'morado': '#9333ea',
        'gris': '#6b7280'
      };
      return colorMap[colorName.toLowerCase()] || '#6b7280';
    };
    
    console.log('\nMapeo de colores:');
    uniqueColors.forEach(color => {
      const hex = getColorHex(color || '');
      console.log(`- '${color}' -> ${hex}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
})();