# Email Templates - Sakú Lencería

Sistema de plantillas de email con MJML para diseño responsive y elegante.

## Estructura

```
/email/
├── /partials/          # Componentes reutilizables (header, footer, button)
├── /templates/         # Plantillas MJML y HTML compilado
├── /sample-data/       # Datos de ejemplo para testing
├── /subjects.json      # Asuntos y preheaders por template
├── /.checks/           # Tests de calidad con Playwright
├── /.artifacts/        # Screenshots y reportes de validación
└── README.md          # Esta guía
```

## Scripts disponibles

```bash
# Compilar MJML → HTML (minificado)
npm run emails:build

# Servir templates para preview local en http://localhost:4400
npm run emails:preview

# Validar calidad con Playwright
npm run emails:check

# Validar estructura de subjects.json
npm run emails:subjects:lint
```

## Criterios de diseño

### Dimensiones
- **Desktop**: Ancho máximo 680px
- **Mobile**: 90-96% del viewport
- **Padding lateral**: 24-32px mínimo

### Tipografía
- **Sistema**: Usar fuentes del sistema (sin dependencias externas)
- **Jerarquía**: Títulos claros, texto legible ≥14px
- **Sin emojis**: Usar iconos o texto descriptivo

### Responsive
- Diseño mobile-first
- Sin overflow horizontal
- Botones táctiles ≥44px

## Placeholders disponibles

### Usuario
- `{{user.first_name}}` - Nombre del usuario
- `{{user.email}}` - Email del usuario

### Pedido
- `{{order.id}}` - ID del pedido
- `{{order.date}}` - Fecha del pedido
- `{{order.items[]}}` - Array de items (name, variant, qty, price)
- `{{order.subtotal}}` - Subtotal
- `{{order.shipping_cost}}` - Costo de envío
- `{{order.total}}` - Total final

### Envío
- `{{shipping.method}}` - Método de envío
- `{{shipping.address}}` - Dirección de envío
- `{{tracking.code}}` - Código de seguimiento
- `{{tracking.url}}` - URL de seguimiento

### Descuentos
- `{{coupon.code}}` - Código de cupón
- `{{discount_total}}` - Total de descuento

### Sistema
- `{{support.email}}` - Email de soporte
- `{{site.url}}` - URL del sitio

## Diseño y marca

- **Ancho máximo**: 640-680px desktop, 90-96% mobile
- **Paleta**: #d8ceb5 / #ffffff / #000000
- **Tipografía**: System stack segura para emails
- **Accesibilidad**: AA compliance
- **Sin emojis**: Usar iconos SVG inline cuando sea necesario

## Templates disponibles

### Auth/Account
- `verify_email` - Confirmación de email
- `welcome_account` - Bienvenida
- `password_reset` - Recuperación de contraseña

### Orders
- `order_confirmation_pending` - Pedido recibido
- `order_confirmation_paid` - Pago confirmado
- `order_failed` - Pago fallido
- `order_fulfilled_with_tracking` - Envío en camino
- `delivery_confirmation` - Confirmación de entrega

### Lifecycle (preparados, no activos)
- `abandoned_cart` - Carrito abandonado
- `nps_request` - Solicitud NPS
- `winback_60_90` - Reactivación 60-90 días