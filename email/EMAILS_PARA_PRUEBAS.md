# Emails Compilados para Pruebas

Aquí tenés los 3 emails compilados listos para probar:

## 1. Email de Verificación de Cuenta

**Archivo:** `verify_email.html`
**Propósito:** Confirmar email al registrarse
**Elementos clave:**
- Botón de confirmación principal
- Enlace alternativo si el botón no funciona
- Aviso de expiración en 24 horas

## 2. Email de Bienvenida

**Archivo:** `welcome_account.html`
**Propósito:** Dar la bienvenida después de verificar la cuenta
**Elementos clave:**
- Mensaje personalizado con nombre del usuario
- Botón "Explorar productos"
- Información sobre beneficios (envío gratis, cambios, atención)

## 3. Email de Confirmación de Pago

**Archivo:** `order_confirmation_paid.html`
**Propósito:** Confirmar que se recibió el pago del pedido
**Elementos clave:**
- Detalles completos del pedido (ID, fecha, productos)
- Tabla con productos, cantidades y precios
- Información de envío
- Botón "Ver mi pedido"

## Cómo Probar

1. **Abrir en navegador:** Podés abrir cualquier archivo `.html` directamente en tu navegador
2. **Servidor de previsualización:** Usar `npm run emails:preview` y ir a `http://localhost:4400`
3. **Cliente de email:** Enviar a tu email de prueba para ver cómo se ve en Gmail, Outlook, etc.

## Variables de Prueba

Los emails usan placeholders como:
- `{{user.first_name}}` → Nombre del usuario
- `{{order.id}}` → ID del pedido
- `{{site.url}}` → URL del sitio
- `{{support.email}}` → Email de soporte

Para pruebas reales, estos valores se reemplazarían con datos reales desde la aplicación.

## Compatibilidad

✅ **Verificado para:**
- Gmail (web y móvil)
- Outlook (web y desktop)
- Apple Mail
- Clientes móviles principales

✅ **Características:**
- Responsive design
- Dark/light mode compatible
- Accesibilidad AA
- Preheader optimizado