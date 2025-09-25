# Guía para Simular Compras - Sakú Lencería

Esta guía explica cómo simular compras para testing tanto usando scripts automatizados como manualmente desde el frontend.

## 🤖 Simulación Automatizada (Script)

### Uso Básico

```bash
# Simulación simple (1 producto)
node scripts/simulate-purchase.js

# Simulación con cupón de descuento
node scripts/simulate-purchase.js --with-coupon

# Simulación con múltiples productos
node scripts/simulate-purchase.js --multiple-items

# Simulación completa (múltiples productos + cupón)
node scripts/simulate-purchase.js --multiple-items --with-coupon
```

### Qué hace el script

1. **Crea usuario de prueba**: `test-compra@saku.com` / `TestCompra123!`
2. **Selecciona productos**: Con stock disponible
3. **Aplica cupón**: `TEST10` (10% descuento) si se especifica
4. **Crea orden**: Estado `pending` lista para procesar
5. **Muestra resumen**: Detalles completos de la orden

### Datos de prueba creados

- **Usuario**: test-compra@saku.com
- **Cupón**: TEST10 (10% descuento)
- **Dirección**: Av. Colón 1234, Córdoba
- **Método de pago**: Mercado Pago

## 🖱️ Simulación Manual (Frontend)

### Paso a Paso

#### 1. Preparar el entorno
```bash
# Asegurar que la app esté corriendo
npm run dev

# Verificar que hay productos con stock
npm run check:products
```

#### 2. Crear usuario de prueba (opcional)
- Ir a: http://localhost:3000/auth/register
- Registrar usuario: `comprador@test.com`
- Confirmar email (revisar logs de Supabase)

#### 3. Simular compra completa

**a) Navegar al catálogo**
```
http://localhost:3000/productos
```

**b) Seleccionar producto**
- Elegir talle y color disponible
- Verificar que hay stock
- Hacer clic en "Agregar al carrito"

**c) Revisar carrito**
- Abrir drawer del carrito (icono superior derecha)
- Verificar producto agregado
- Ajustar cantidad si es necesario

**d) Aplicar cupón (opcional)**
- En el carrito, expandir "Cupón de descuento"
- Ingresar código: `TEST10` o `BIENVENIDA20`
- Verificar que se aplique el descuento

**e) Configurar envío**
- Expandir "Información de envío"
- Seleccionar método de envío
- Para Córdoba: elegir "Cadete" o "Envío estándar"

**f) Proceder al checkout**
- Hacer clic en "Finalizar compra"
- Completar datos de envío
- Seleccionar método de pago

**g) Simular pago**
- En Mercado Pago Sandbox:
  - Usar tarjeta de prueba: `4509 9535 6623 3704`
  - CVV: `123`
  - Vencimiento: cualquier fecha futura
  - Nombre: cualquier nombre

#### 4. Verificar orden creada
- Ir al admin: http://localhost:3000/admin
- Revisar sección "Órdenes"
- Verificar que la orden aparece con estado `pending`

## 🧪 Casos de Prueba Recomendados

### Flujo Básico
- [ ] Agregar 1 producto al carrito
- [ ] Proceder al checkout sin cupón
- [ ] Completar compra con MP Sandbox
- [ ] Verificar orden en admin

### Flujo con Descuentos
- [ ] Agregar productos al carrito
- [ ] Aplicar cupón válido
- [ ] Verificar descuento aplicado
- [ ] Completar compra

### Flujo con Múltiples Productos
- [ ] Agregar 3+ productos diferentes
- [ ] Cambiar cantidades en carrito
- [ ] Aplicar cupón
- [ ] Verificar cálculos correctos

### Casos Edge
- [ ] Intentar cupón inválido
- [ ] Agregar producto sin stock
- [ ] Cancelar en MP y volver
- [ ] Probar diferentes métodos de envío

## 🔧 Troubleshooting

### Problemas Comunes

**"No hay productos disponibles"**
```bash
# Verificar productos en DB
node scripts/verify-products-display.js

# Cargar productos de prueba
node scripts/load-real-products.js
```

**"Error de autenticación"**
```bash
# Verificar configuración de auth
node scripts/verify-auth-setup.js

# Limpiar y reconfigurar
node scripts/complete-auth-fix.js
```

**"Cupón no funciona"**
- Verificar que el cupón esté activo
- Revisar fechas de validez
- Comprobar límites de uso

**"Error en checkout"**
- Verificar variables de MP en `.env`
- Comprobar que Supabase esté conectado
- Revisar logs en consola del navegador

### Logs Útiles

```bash
# Ver logs de Supabase
npx supabase logs

# Verificar estado de la DB
node scripts/check-database-schema.js

# Probar conexión completa
node scripts/test-complete-auth-flow.js
```

## 📊 Datos de Prueba

### Usuarios
- **Admin**: admin@saku.com / Admin123!
- **Cliente**: test-compra@saku.com / TestCompra123!

### Cupones
- **TEST10**: 10% descuento
- **BIENVENIDA20**: 20% descuento (nuevos usuarios)

### Tarjetas de Prueba MP
- **Aprobada**: 4509 9535 6623 3704
- **Rechazada**: 4000 0000 0000 0002
- **Pendiente**: 4000 0000 0000 0044

### Direcciones de Prueba
```json
{
  "address": "Av. Colón 1234",
  "city": "Córdoba",
  "province": "Córdoba", 
  "postalCode": "5000",
  "country": "Argentina"
}
```

## 🚀 Automatización Avanzada

Para testing más avanzado, considera usar:

1. **Playwright** para E2E testing
2. **Scripts de carga** para múltiples órdenes
3. **Webhooks de prueba** para simular pagos
4. **Datos sintéticos** para análisis

```bash
# Ejecutar tests E2E
npm run test:e2e

# Generar múltiples órdenes
node scripts/simulate-purchase.js --multiple-items --with-coupon
```

---

**Nota**: Siempre usar datos de prueba en desarrollo. Nunca usar información real de tarjetas o datos personales.