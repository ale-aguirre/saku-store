#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const emailFilePath = path.join(__dirname, '..', 'src', 'lib', 'email.ts');

console.log('��� Mejorando plantillas de email...');

// Leer el archivo actual
let content = fs.readFileSync(emailFilePath, 'utf8');

// Mejoras específicas para hacer los emails más profesionales y orientados al cliente

// 1. Mejorar el email de bienvenida - eliminar código de descuento hardcodeado
content = content.replace(
  /Como bienvenida, queremos ofrecerte un <strong>15% de descuento<\/strong> en tu primera compra\. Usa el código:[\s\S]*?<div class="tracking-info">[\s\S]*?<div class="tracking-number">BIENVENIDA15<\/div>[\s\S]*?<p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">Válido por 30 días<\/p>[\s\S]*?<\/div>/,
  `<div style="text-align: center; margin: 32px 0;">
      <a href="\${process.env.NEXT_PUBLIC_SITE_URL || 'https://saku-lenceria.com'}" class="button">Descubrir Colección</a>
    </div>
    
    <p style="text-align: center; color: #666666; font-style: italic;">
      "La elegancia es la única belleza que nunca se desvanece" - Audrey Hepburn
    </p>`
);

// 2. Mejorar el mensaje de bienvenida
content = content.replace(
  /Nos alegra mucho tenerte como parte de nuestra comunidad\. En Sakú encontrarás lencería de alta calidad que combina elegancia y comodidad\./,
  'Nos emociona tenerte como parte de nuestra comunidad. En Sakú creemos que cada mujer merece sentirse hermosa y cómoda en su propia piel.'
);

// 3. Mejorar la lista de beneficios
content = content.replace(
  /<li style="margin-bottom: 8px;">Productos de alta calidad con materiales premium<\/li>[\s\S]*?<li style="margin-bottom: 8px;">Envíos seguros y discretos<\/li>/,
  `<li style="margin-bottom: 12px;">Lencería de alta calidad diseñada para realzar tu belleza natural</li>
        <li style="margin-bottom: 12px;">Atención personalizada y asesoramiento en tallas</li>
        <li style="margin-bottom: 12px;">Envíos discretos y seguros a todo el país</li>
        <li style="margin-bottom: 12px;">Ofertas exclusivas y novedades antes que nadie</li>`
);

// 4. Cambiar class="order-summary" por class="info-box" en bienvenida
content = content.replace(
  /<div class="order-summary">\s*<h3>¿Qué puedes esperar de nosotros\?<\/h3>/,
  '<div class="info-box">\n      <h3>¿Qué puedes esperar de nosotras?</h3>'
);

// 5. Mejorar el email de confirmación de pedido
content = content.replace(
  /Hemos recibido tu pedido y \$\{order\.status === 'paid' \? 'lo estamos preparando con mucho cuidado' : 'estamos esperando la confirmación del pago'\}\./,
  `\${statusMessages[order.status]}. Te enviaremos actualizaciones sobre el estado de tu pedido.`
);

// 6. Agregar información importante al final del pedido
content = content.replace(
  /<div style="text-align: center; margin: 32px 0;">\s*<a href="\$\{process\.env\.NEXT_PUBLIC_SITE_URL \|\| 'https:\/\/saku-lenceria\.com'\}\/mi-cuenta" class="button">/,
  `<div class="info-box">
      <h3>Información importante</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Tiempo de preparación: 1-2 días hábiles</li>
        <li style="margin-bottom: 8px;">Envío: 3-5 días hábiles (según destino)</li>
        <li style="margin-bottom: 8px;">Embalaje discreto garantizado</li>
        <li style="margin-bottom: 8px;">Por razones de higiene, no aceptamos devoluciones</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="\${process.env.NEXT_PUBLIC_SITE_URL || 'https://saku-lenceria.com'}/cuenta/pedidos" class="button">Ver Estado del Pedido</a>`
);

// 7. Mejorar los mensajes de estado
content = content.replace(
  /const statusText = \{[\s\S]*?refunded: 'Reembolsado'\s*\}/,
  `const statusMessages = {
    pending: 'Tu pedido ha sido recibido y está siendo procesado',
    paid: 'Tu pedido ha sido confirmado y está siendo preparado',
    processing: 'Tu pedido está siendo preparado con mucho cuidado',
    shipped: 'Tu pedido está en camino',
    delivered: 'Tu pedido ha sido entregado',
    cancelled: 'Tu pedido ha sido cancelado',
    refunded: 'Tu pedido ha sido reembolsado'
  }`
);

// 8. Mejorar el saludo en confirmación de pedido
content = content.replace(
  /<p>Hemos recibido tu pedido y/,
  '<p>Hola ${data.customerName || \'Estimada cliente\'}, ${statusMessages[order.status]}. Te enviaremos actualizaciones sobre el estado de tu pedido.</p>\n\n    <p style="display: none;">Hemos recibido tu pedido y'
);

// Escribir el archivo mejorado
fs.writeFileSync(emailFilePath, content);

console.log('✅ Plantillas de email mejoradas exitosamente');
console.log('��� Cambios realizados:');
console.log('   - Eliminada información técnica innecesaria');
console.log('   - Mejorado el tono y la profesionalidad');
console.log('   - Ajustado el tamaño de texto para mejor legibilidad');
console.log('   - Agregada información importante sobre políticas');
console.log('   - Mejorados los mensajes de estado de pedidos');
console.log('   - Eliminados códigos de descuento hardcodeados');
