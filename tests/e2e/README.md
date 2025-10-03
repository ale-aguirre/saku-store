# Tests E2E - Sakú Lencería

## Descripción

Tests end-to-end (E2E) para verificar el funcionamiento completo del e-commerce de Sakú Lencería. Utilizamos Playwright para automatizar las pruebas en navegadores reales.

## Estructura

```
tests/e2e/
├── README.md                 # Este archivo
├── helpers/
│   └── test-helpers.ts      # Funciones reutilizables para tests
├── checkout-basic.spec.ts   # Tests del flujo de checkout
├── cart.spec.ts            # Tests de funcionalidad del carrito
└── products.spec.ts        # Tests de productos y navegación
```

## Tests Implementados

### 🛒 Checkout (`checkout-basic.spec.ts`)
- ✅ Agregar producto al carrito
- ✅ Navegar al checkout desde carrito
- ✅ Mostrar formulario de checkout
- ✅ Completar formulario de checkout

### 🛍️ Carrito (`cart.spec.ts`)
- ✅ Abrir y cerrar carrito
- ✅ Mostrar carrito vacío
- ✅ Calcular envío con código postal
- ✅ Habilitar checkout con envío seleccionado

### 📦 Productos (`products.spec.ts`)
- ✅ Mostrar productos en home
- ✅ Navegar a página de producto
- ✅ Mostrar página de producto con opciones
- ✅ Seleccionar talle y color
- ✅ Mostrar información del producto

## Helpers Disponibles

### `addProductToCart(page: Page)`
Agrega un producto al carrito desde la página de inicio:
- Navega al home
- Selecciona el primer producto
- Elige talle y color
- Agrega al carrito
- Verifica que se agregó correctamente

### `goToCheckoutWithProduct(page: Page)`
Navega al checkout con un producto en el carrito:
- Agrega un producto usando `addProductToCart`
- Calcula envío con código postal 5000
- Selecciona método de envío
- Navega a `/checkout`

### `fillShippingData(page: Page)`
Completa los datos de envío en el formulario de checkout con datos de prueba.

## Comandos

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests específicos
npx playwright test tests/e2e/checkout-basic.spec.ts
npx playwright test tests/e2e/cart.spec.ts
npx playwright test tests/e2e/products.spec.ts

# Ejecutar en modo debug
npx playwright test --debug

# Ver reporte de resultados
npx playwright show-report
```

## Configuración

Los tests están configurados para ejecutarse en:
- ✅ Chromium
- ✅ Firefox
- ✅ WebKit (Safari)

Configuración en `playwright.config.ts`.

## Data Test IDs

Los tests utilizan `data-testid` para localizar elementos de forma confiable:

```html
<!-- Productos -->
<div data-testid="product-card">...</div>
<button data-testid="add-to-cart-button">...</button>
<select data-testid="size-selector">...</select>
<select data-testid="color-selector">...</select>

<!-- Carrito -->
<button data-testid="cart-button">...</button>
<span data-testid="cart-count">...</span>
<input data-testid="postal-code-input">...</input>
<button data-testid="calculate-shipping-button">...</button>
<div data-testid="shipping-method">...</div>
<button data-testid="checkout-button">...</button>

<!-- Checkout -->
<input data-testid="name-input">...</input>
<input data-testid="email-input">...</input>
<input data-testid="phone-input">...</input>
<input data-testid="address-input">...</input>
<input data-testid="city-input">...</input>
<input data-testid="postal-code-checkout-input">...</input>
```

## Mejores Prácticas

1. **Tests atómicos**: Cada test verifica una funcionalidad específica
2. **Helpers reutilizables**: Evitar duplicación de código
3. **Data test IDs**: Usar selectores confiables y específicos
4. **Esperas explícitas**: Usar `waitForLoadState` y `waitForSelector`
5. **Verificaciones claras**: Usar `expect` para validar estados

## Troubleshooting

### Tests fallan por timeouts
- Verificar que el servidor de desarrollo esté corriendo (`npm run dev`)
- Aumentar timeouts en `playwright.config.ts` si es necesario

### Elementos no encontrados
- Verificar que los `data-testid` existan en los componentes
- Usar `page.pause()` para debuggear interactivamente

### Tests pasan individualmente pero fallan en conjunto
- Verificar que no hay interferencia entre tests
- Asegurar que cada test sea independiente
- Usar `test.beforeEach` para setup limpio