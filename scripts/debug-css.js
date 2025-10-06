// Script para debuggear CSS de imágenes
// Ejecutar en la consola del navegador en /productos

console.log('🔍 Debuggeando CSS de imágenes...');

// Buscar el producto Lory
const loryCard = Array.from(document.querySelectorAll('[href*="lory"]')).find(el => 
  el.textContent.toLowerCase().includes('lory')
);

if (loryCard) {
  console.log('📦 Producto Lory encontrado:', loryCard);
  
  // Buscar el contenedor de la imagen
  const imageContainer = loryCard.querySelector('.aspect-square');
  console.log('🖼️ Contenedor de imagen:', imageContainer);
  
  if (imageContainer) {
    const computedStyle = window.getComputedStyle(imageContainer);
    console.log('📐 Estilos del contenedor:', {
      position: computedStyle.position,
      width: computedStyle.width,
      height: computedStyle.height,
      overflow: computedStyle.overflow,
      aspectRatio: computedStyle.aspectRatio
    });
    
    // Buscar la imagen dentro
    const image = imageContainer.querySelector('img');
    console.log('🖼️ Imagen encontrada:', image);
    
    if (image) {
      const imageStyle = window.getComputedStyle(image);
      console.log('📐 Estilos de la imagen:', {
        position: imageStyle.position,
        top: imageStyle.top,
        left: imageStyle.left,
        width: imageStyle.width,
        height: imageStyle.height,
        objectFit: imageStyle.objectFit,
        zIndex: imageStyle.zIndex,
        opacity: imageStyle.opacity,
        visibility: imageStyle.visibility,
        display: imageStyle.display
      });
      
      console.log('🔗 URL de la imagen:', image.src);
      console.log('📏 Dimensiones naturales:', {
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight
      });
    }
  }
} else {
  console.log('❌ Producto Lory no encontrado');
}