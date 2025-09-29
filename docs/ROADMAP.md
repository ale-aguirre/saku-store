# Roadmap Sakú Lencería

## Progreso Actual

### 2025-09-29 14:28 - Corrección de errores de compilación y dependencias

**Problema resuelto**: Error de compilación por dependencias faltantes en la integración de Correo Argentino.

**Acciones realizadas**:
- Identificado error de compilación: `ylazzari-correoargentino` requiere `axios` pero no estaba instalado
- Resuelto conflicto de dependencias entre `dotenv@17.2.2` (proyecto) y `dotenv@^16.x` (requerido por ylazzari-correoargentino)
- Instalado `axios` con `--legacy-peer-deps` para resolver conflictos
- Corregido archivo `src/app/admin/ordenes/[id]/page.tsx` eliminando componente `OrderSummary` inexistente
- Reemplazado con componente `Card` simple para mostrar resumen de orden

**Verificaciones**:
- ✅ ESLint: Sin errores ni advertencias
- ✅ TypeScript: Sin errores de tipo
- ✅ Build: Compilación exitosa
- ⚠️ Tests E2E: Requieren aplicación corriendo (pendiente)

**Estado actual**: La aplicación compila correctamente y está lista para desarrollo/testing.

---

## Fases del Proyecto

### F0 Fundaciones ✅
- UI kit (Marcellus/Inter + dark/light)
- Legales, Consent, GA4/Pixel
- Migraciones Supabase (productos/variantes/precios/stock/cupones/carritos/órdenes/eventos/usuarios/direcciones/NPS/RFM)
- RLS habilitado

### F1 Venta (MVP) ���
- ✅ Home/PLP/PDP
- ✅ Carrito (drawer) + cupón
- ✅ Envío (flat + Cadete Córdoba por CP)
- ✅ Checkout Pro
- ✅ Orden pending→paid
- ✅ Admin (catalog/stock/orders/coupons)
- ✅ Emails transaccionales
- ��� **En progreso**: Integración completa de tracking Correo Argentino

### F2 Operaciones & CRM ���
- Webhook MP
- Tracking Correo Argentino
- n8n (abandonado, NPS, RFM, winback)
- Admin (Automatizaciones/Campañas)
- WhatsApp BSP 360dialog

### F3 Optimización ���
- Bricks
- Filtros/búsqueda
- Wishlist, reseñas, bundles
- A/B testing
- CWV, reportes

## Próximos Pasos

1. **Completar integración Correo Argentino**:
   - Verificar funcionamiento del tracking automático
   - Actualizar emails de envío con información de tracking
   - Tests E2E del flujo completo

2. **Testing y QA**:
   - Ejecutar tests E2E con aplicación corriendo
   - Verificar flujo completo de órdenes con tracking

3. **Webhook Mercado Pago**:
   - Implementar manejo robusto de webhooks
   - Actualización automática de estados de orden
