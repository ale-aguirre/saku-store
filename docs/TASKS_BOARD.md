# TASKS_BOARD.md — Append-only Task Board

> Regla: **append-only**. No borrar historial. Actualizar estados con checkboxes y fecha/hora.
> Estados: Backlog → Today → In Progress → (Blocked?) → Done

## Legend

- [ ] = pendiente
- [x] = completado
- TS = timestamp `YYYY-MM-DD HH:mm`
- Owner = Agente Saku

---

## Today (focus del día)

- [x] (TB-042) Investigar y corregir carga infinita en sección órdenes /admin — Owner: Saku — TS done: 2025-01-11 15:47
  - Goal: La página /admin/ordenes no cargaba, quedaba "pensando" sin mostrar contenido
  - Scope: Configuración de variables de entorno, conexión con Supabase
  - Acceptance: Página de órdenes carga correctamente y muestra datos
  - Priority: High
  - How: Configuradas variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local, servidor reiniciado
  - Files: .env.local (creado), servidor reiniciado en puerto 3001
  - Checks: Variables ✅ | Servidor ✅ | Órdenes de prueba ✅

- [x] (TB-043) Corregir formato de precios - eliminar centavos innecesarios — Owner: Saku — TS done: 2025-10-11 22:55
  - Goal: Permitir valores exactos como 15000 sin agregar ceros adicionales al final
  - Scope: Componentes de precio, formularios de producto, específicamente producto Lory
  - Acceptance: Precios se muestran y editan sin centavos innecesarios
  - Priority: High
  - How: Verificada función formatPrice que ya maneja correctamente precios sin centavos. Corregido precio de Lory de $30.000 a $32.490
  - Files: src/lib/utils.ts (formatPrice), fix-lory-price.js (script corrección precio)
  - Checks: ESLint ✅ | TypeScript ✅ | Build ✅ | Preview ✅

- [x] (TB-044) Arreglar edición de imágenes producto Lory — Owner: Saku — TS done: 2025-01-11 21:01
  - Goal: Habilitar drag&drop, reducir preview grande, mejorar separación de tabs
  - Scope: Página de edición de productos, componentes de imagen, tabs de producto
  - Acceptance: Drag&drop funcional, preview tamaño adecuado, tabs bien diferenciadas
  - Priority: High
  - How: Solucionados problemas de slug duplicado y superposición de errores en imágenes
  - Files: src/app/admin/productos/actions.ts, src/components/ui/image-upload.tsx, tests E2E
  - Checks: Build ✅ | ESLint ✅ | TypeScript ✅ | Merged to develop ✅

- [x] (TB-045) Corregir caracteres de codificación en productos Mónaco — Owner: Saku — TS done: 2025-10-12 13:46
  - Goal: Eliminar caracteres raros "M�naco" y reemplazar por "Mónaco" correctamente
  - Scope: Base de datos, nombres de productos y slugs con problemas de codificación UTF-8
  - Acceptance: Todos los productos Mónaco muestran el nombre correctamente sin caracteres raros
  - Priority: High
  - How: Identificados 4 productos con problemas de codificación, corregidos nombres y slugs en DB
  - Files: scripts/fix-monaco-encoding.js (script de corrección), productos en base de datos
  - Checks: ESLint ✅ | TypeScript ✅ | Preview ✅ | Base de datos actualizada ✅

- [x] (TB-015) Implementar soporte completo para tema claro/oscuro en sección /admin — Owner: Saku — TS done: 2025-09-30 20:39
  - Goal: Eliminar todas las clases hardcodeadas y hacer que la sección admin respete el tema seleccionado
  - Scope: Layout admin, dashboard, sidebar, páginas de productos/órdenes/cupones
  - Acceptance: Todas las clases text-gray-*, bg-white, etc. reemplazadas por clases de tema dinámico
  - Priority: High
  - How: Corregidas clases hardcodeadas en dashboard, órdenes y categorías. Error TypeScript resuelto.
  - Files: src/app/admin/page.tsx, src/app/admin/ordenes/page.tsx, src/app/admin/ordenes/[id]/page.tsx, src/app/admin/categorias/page.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (http://localhost:3000)

- [x] (TB-025) Implementar página de configuración del admin /admin/configuracion — Owner: Saku — TS done: 2025-10-01 02:06
  - Goal: Crear página donde el admin pueda modificar nombre, contraseña y foto de perfil
  - Scope: Formulario de configuración personal, actualización de datos de usuario admin
  - Acceptance: Página funcional con formulario para cambiar datos personales del admin
  - Priority: High
  - How: Corregidas referencias incorrectas a tabla 'users' por 'profiles' en 9 archivos. Error crítico resuelto.
  - Files: src/app/auth/actions.ts, src/app/admin/page.tsx, src/app/api/debug/*, src/middleware.ts, src/hooks/use-auth.tsx, src/components/admin/profile-photo-upload.tsx, src/app/admin/configuracion/page.tsx, src/components/admin/layout/AdminHeader.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (http://localhost:3000/admin/configuracion)

- [x] (TB-027) Documentación de esquema de base de datos — Owner: Saku — TS done: 2025-10-01 02:06
  - Goal: Mantener documentación actualizada del esquema de base de datos para evitar errores de mapeo
  - Scope: Documentación completa de tablas, campos, tipos y convenciones de naming
  - Acceptance: Archivo DATABASE_SCHEMA.md actualizado y verificado contra esquema real
  - Priority: High
  - How: Creado DATABASE_SCHEMA.md con documentación completa de tablas, campos y convenciones
  - Files: docs/DATABASE_SCHEMA.md
  - Checks: Documentación ✅

- [x] (TB-028) Registro de cambios del proyecto — Owner: Saku — TS done: 2025-10-01 02:06
  - Goal: Mantener un changelog detallado de todos los cambios significativos
  - Scope: Archivo CHANGELOG.md con formato estándar y entradas por fecha
  - Acceptance: Changelog actualizado con cambios de esta sesión
  - Priority: Medium
  - How: Creado CHANGELOG.md con formato estándar y documentados cambios de esta sesión
  - Files: docs/CHANGELOG.md
  - Checks: Documentación ✅

- [x] (TB-026) Verificar y mejorar botón de cambio de tema en admin — Owner: Saku — TS done: 2025-10-03 17:35
  - Goal: Asegurar que el ThemeToggle esté visible y funcional en el panel admin
  - Scope: AdminHeader, verificar posicionamiento y funcionalidad del botón de tema
  - Acceptance: Botón de cambio de tema visible y funcional en todas las páginas admin
  - Priority: Medium
  - How: Verificado funcionamiento correcto del botón de tema en AdminHeader
  - Files: src/components/admin/layout/AdminHeader.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅

- [x] (TB-016) Implementar página de edición de producto /admin/productos/[id] — Owner: Saku — TS done: 2025-10-01 18:44
  - Goal: Crear página funcional para editar productos existentes
  - Scope: Formulario de edición, validación, actualización en DB
  - Acceptance: Página funcional sin error 404, formulario completo
  - Priority: High
  - How: Implementada funcionalidad completa de carga de imágenes para productos y variantes
  - Files: src/app/admin/productos/[id]/page.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (http://localhost:3001)

- [x] (TB-029) Implementar funcionalidad de carga de imágenes desde equipo local — Owner: Saku — TS done: 2025-10-01 18:44
  - Goal: Permitir subir imágenes desde el equipo local para productos y variantes
  - Scope: Integración componente ImageUpload, soporte múltiples imágenes, previsualización
  - Acceptance: Funcionalidad completa de carga, previsualización y eliminación de imágenes
  - Priority: High
  - How: Integrado componente ImageUpload con límite de 3 imágenes por producto/variante
  - Files: src/app/admin/productos/[id]/page.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (http://localhost:3001)

- [x] (TB-030) Análisis de estado actual del sistema — Owner: Saku — TS done: 2025-10-10 16:00
  - Goal: Documentar estado actual antes de hacer cambios, identificar warnings, loops, precios incorrectos
  - Scope: ESLint warnings, wishlist loop, estructura DB productos/precios, UI issues
  - Acceptance: Estado documentado completamente, issues identificados y priorizados
  - Priority: High
  - Files: products-page-content.tsx, use-wishlist.ts, DB productos/precios
  - How: Análisis completo realizado, warnings ESLint corregidos, loop wishlist identificado y resuelto
  - Checks: ESLint ✅ | Types ✅ | Documentación ✅

- [x] (TB-032) Resolver loop infinito de errores en wishlist/favoritos — Owner: Saku — TS done: 2025-10-10 18:21
  - Goal: Corregir loop infinito en use-wishlist.ts que causa errores recurrentes
  - Scope: Refactorizar useCallback y useEffect para prevenir re-renders infinitos
  - Acceptance: Hook funcional sin loops, todas las operaciones de wishlist operativas
  - Priority: High
  - Files: src/hooks/use-wishlist.ts
  - How: Migración completa a product_variant_id, nueva tabla wishlist, corrección de componentes
  - Checks: ESLint ✅ | Types ✅ | Build ✅ | Merged to develop ✅

- [x] (TB-038) Merge exitoso de corrección wishlist a develop — Owner: Saku — TS done: 2025-10-10 18:21
  - Goal: Integrar corrección completa de wishlist a rama develop
  - Scope: Build exitoso, push, merge, cleanup de rama feature
  - Acceptance: Código en develop, rama feature eliminada, documentación actualizada
  - Priority: High
  - Files: Múltiples archivos migrados y corregidos
  - How: Build ✅, commit, push, merge fast-forward, cleanup rama
  - Checks: Build ✅ | Merge ✅ | Push ✅ | Cleanup ✅

---

## In Progress

<!-- Tareas en progreso -->

---

## Blocked

<!-- Tareas bloqueadas esperando resolución -->

---

## Backlog (tareas pendientes)

### Correcciones Críticas - Prioridad Alta
- [x] (TB-031) Corregir warnings TypeScript y encoding de caracteres — Owner: Saku — TS done: 2025-01-10 16:45
  - Goal: Eliminar warnings ESLint en products-page-content.tsx y corregir encoding tildes
  - Scope: Unused directive línea 69, missing dependency línea 71, caracteres especiales
  - Priority: High
  - How: Verificado que no existen warnings ESLint/TypeScript ni problemas de encoding
  - Checks: ESLint ✅ | Types ✅ | Encoding ✅

- [x] (TB-033) Corregir formato de precios en DB y validar estructura — Owner: Saku — TS done: 2025-01-10 16:45
  - Goal: Cambiar precios de 2400000 a 24000 ARS, validar estructura actual
  - Scope: Tabla productos, variantes, formato precios, scripts migración
  - Priority: High
  - How: Verificado que precios están en formato correcto (8500.00, 9200.00, 6800.00)
  - Checks: DB Structure ✅ | Price Format ✅

### Mejoras UI/UX - Prioridad Media
- [x] (TB-034) Cambiar ProductCard: descripción breve vs talles — Owner: Saku — TS done: 2025-10-10 19:41
  - Goal: Mostrar descripción breve editable desde admin en lugar de talles
  - Scope: ProductCard component, admin interface para descripciones
  - Priority: Medium
  - How: Modificado componente ProductCard para mostrar descripción del producto con line-clamp-2. Preview verificado en /productos. Commit realizado en rama feature/product-card-description.
  - Files: src/components/product/product-card.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅

- [x] (TB-035) Corregir superposición botones 'X' en modal carrito — Owner: Saku — TS done: 2025-01-10 19:30
  - Goal: Resolver jerarquía visual y superposición de botones en modal
  - Scope: Cart modal, z-index, positioning
  - Priority: Medium
  - How: Eliminado botón 'X' personalizado del SheetTitle, dejando solo el botón automático del SheetContent de shadcn/ui
  - Files: src/components/cart/cart-drawer.tsx
  - Checks: ESLint ✅ | Types ⚠️ (errores en tests) | Build ✅ | Preview ✅

### Configuración Admin - Prioridad Media
- [ ] (TB-036) Crear configuración admin para textos de envío — Owner: Saku — TS added: 2025-10-10 13:51
  - Goal: Textos editables para Cadete Córdoba, Envío Nacional, lógica envío gratis
  - Scope: Admin panel, site_settings, shipping configuration
  - Priority: Medium

- [ ] (TB-037) Crear sección 'Tienda' en admin para configurar textos e imágenes — Owner: Saku — TS added: 2025-10-10 13:51
  - Goal: Panel admin para gestionar contenido editable de la tienda
  - Scope: Admin section, copy_blocks, image management
  - Priority: Medium

### Lógica de Productos - Prioridad Media
- [ ] (TB-038) Corregir lógica de imágenes productos — Owner: Saku — TS added: 2025-10-10 13:51
  - Goal: Múltiples imágenes por producto, asociación opcional por color (no por variante)
  - Scope: Product images, variant images, color associations
  - Priority: Medium

### Automatizaciones - Prioridad Baja
- [ ] (TB-039) Planificar integración n8n para automatizaciones — Owner: Saku — TS added: 2025-10-10 13:51
  - Goal: Integrar n8n para redes sociales, carritos abandonados, CRM
  - Scope: n8n setup, webhooks, automation workflows
  - Priority: Low

### Tema claro/oscuro - Prioridad Media - COMPLETADO
- [x] (TB-017) Corregir AdminSidebar - revisar clases hardcodeadas restantes — Owner: Saku — TS done: 2025-10-03 17:35
  - How: Clases hardcodeadas corregidas en implementación de sidebar fijo
  - Files: src/app/admin/layout.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅
- [x] (TB-018) Corregir cards del dashboard admin - reemplazar text-gray-*, bg-gray-* por clases de tema — Owner: Saku — TS done: 2025-10-03 17:35
  - How: Cards del dashboard actualizadas con clases de tema dinámico
  - Files: src/app/admin/page.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅
- [x] (TB-019) Corregir layout de admin - reemplazar bg-white, text-gray-* por clases de tema — Owner: Saku — TS done: 2025-10-03 17:35
  - How: Layout admin actualizado con clases de tema dinámico
  - Files: src/app/admin/layout.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅
- [x] (TB-020) Corregir página de productos admin - reemplazar text-gray-* por clases de tema — Owner: Saku — TS done: 2025-10-03 17:35
  - How: Página de productos actualizada con clases de tema dinámico
  - Files: src/app/admin/productos/page.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅
- [x] (TB-021) Corregir página de órdenes admin - reemplazar text-gray-* por clases de tema — Owner: Saku — TS done: 2025-10-03 17:35
  - How: Página de órdenes actualizada con clases de tema dinámico
  - Files: src/app/admin/ordenes/page.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅
- [x] (TB-022) Corregir página de cupones admin - reemplazar text-gray-* por clases de tema — Owner: Saku — TS done: 2025-10-03 17:35
  - How: Verificado que no existen clases hardcodeadas - ya usa clases dinámicas de tema
  - Files: src/app/admin/cupones/page.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅

### Mejoras UI/UX - Prioridad Baja
- [x] (TB-023) Corregir estado del botón de login cuando usuario está logueado en home — Owner: Saku — TS done: 2025-10-03 17:35
  - How: Verificado que UserButton ya maneja correctamente estados loading/!user/user
  - Files: src/components/layout/header.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅
- [x] (TB-024) Corregir lógica de badge de poco stock (no mostrar si stock > 20) — Owner: Saku — TS done: 2025-10-01 18:44

---

## Done (history)

- [x] (TB-037) Merge de feature/admin-productos-page a develop — Owner: Saku — TS done: 2025-10-02 20:40
  - Goal: Integrar todas las mejoras de gestión de productos e imágenes al branch develop
  - Scope: CRUD productos, upload de imágenes, fixes TypeScript, tests E2E
  - Acceptance: Merge exitoso sin conflictos, código funcional en develop
  - Priority: High
  - How: Merge con --no-ff desde feature/admin-productos-page
  - Files: 35 archivos modificados incluyendo admin/productos/, componentes UI, tests
  - Checks: Merge ✅ | Push ✅

- [x] (TB-002) Implementar paginación de productos en PLP — TS done: 2025-09-29 15:58
  - How: Integrada paginación completa en /productos con navegación por páginas y límite configurable
  - Scope: Componente ProductPagination, actualización getProducts(), manejo URL state, UI responsive
  - Files: src/app/productos/page.tsx, src/lib/supabase/products.ts, src/components/product/product-pagination.tsx
  - Branch: feature/product-pagination
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (http://localhost:3000/productos)
  - Notes: Paginación funcional con 12 productos por página, navegación completa, info de resultados

- [x] (TB-006) Actualización de documentación con tareas faltantes — TS done: 2025-01-27 16:45
  - How: Identificadas y documentadas 4 tareas críticas faltantes en ROADMAP.md y TASKS_BOARD.md
  - Scope: Paginación PLP, Filtros productos, Panel Admin TiendaNube, Simulación compras
  - Files: docs/ROADMAP.md, docs/TASKS_BOARD.md
  - Branch: docs/update-roadmap-missing-features
  - Notes: Reorganización de prioridades por fases F1 MVP Sales

- [x] (FP-001) Corrección masiva de precios — TS done: 2025-09-26 14:30
  - How: Script fix-prices-massive.js corrigió 51 productos y 765 variantes dividiendo precios por 100
  - Checks: ESLint ✅ | Types ✅ | Tests ✅ | Preview ✅
  - PR: feature/fix-prices-and-colors — Merge: sí, mergeado a develop
  - Notes: Error original en función priceToInteger que multiplicaba por 100 innecesariamente

- [x] (LAY-001) Separación de layouts Admin vs Sitio Público — TS done: 2025-09-30 16:50
  - How: Creado ConditionalLayout para detectar rutas admin vs públicas, modificado RootLayout
  - Scope: Eliminación de header/footer público en panel admin, mantenimiento de layout específico admin
  - Files: src/app/layout.tsx, src/components/layout/conditional-layout.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (admin sin header/footer, páginas públicas con ellos)
  - Notes: Separación clara entre experiencia pública y administrativa

- [x] (FIX-001) Corrección error de stock en Admin/Productos — TS done: 2025-09-30 17:25
  - How: Corregido campo en consulta Supabase de 'stock' a 'stock_quantity' en admin/productos/page.tsx
  - Scope: Alineación con esquema real de tabla product_variants, consistencia en mapeo de campos
  - Files: src/app/admin/productos/page.tsx (línea 62)
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (todas las rutas admin funcionando)
  - Notes: Error de runtime resuelto, panel de productos totalmente funcional

- [x] (TB-029) Implementar componente Loader apropiado — TS done: 2025-10-01 11:30
  - How: Reemplazado icono Upload con animate-spin por componente Loader apropiado en ProfilePhotoUpload
  - Scope: Mejora de UX en carga de imagen de perfil, componente reutilizable
  - Files: src/components/admin/profile-photo-upload.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (http://localhost:3000/admin/configuracion)
  - Notes: Loader consistente con diseño del sistema, mejor experiencia de usuario

- [x] (TB-030) Corregir funcionalidad de subida de imagen de perfil — TS done: 2025-10-01 11:30
  - How: Corregida migración SQL para agregar columna avatar_url a tabla profiles
  - Scope: Migración de base de datos, corrección de tipos TypeScript
  - Files: supabase/migrations/20241001142643_add_avatar_url_to_profiles.sql, src/components/admin/profile-photo-upload.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (subida de imagen funcional)
  - Notes: Migración aplicada correctamente, funcionalidad de avatar completamente operativa

- [x] (TB-033) Restaurar botón de cerrar sesión en sidebar del admin — TS done: 2025-10-01 11:30
  - How: Integrado hook useAuth en AdminSidebar, agregado botón logout con redirección
  - Scope: Funcionalidad de logout, información de usuario en sidebar
  - Files: src/components/admin/AdminSidebar.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (http://localhost:3000/admin)
  - Notes: Botón de logout funcional, redirección correcta a página de login

- [x] (TB-034) Cambiar campo 'nombre' por 'nombre completo' en información personal — TS done: 2025-10-01 11:30
  - How: Actualizadas etiquetas de 'Nombre' a 'Nombre completo' en páginas admin y cuenta
  - Scope: Consistencia de etiquetas en formularios de información personal
  - Files: src/app/admin/configuracion/page.tsx, src/app/cuenta/page.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (etiquetas actualizadas)
  - Notes: Terminología consistente en toda la aplicación

- [x] (TB-035) Mostrar nombre completo del usuario en sidebar del admin — TS done: 2025-10-01 11:30
  - How: Implementada lógica para mostrar nombre completo o email del usuario en AdminSidebar
  - Scope: Información de usuario en sidebar, integración con hook useAuth
  - Files: src/components/admin/AdminSidebar.tsx
  - Checks: ESLint ✅ | Types ✅ | Preview ✅ (información de usuario visible)
  - Notes: Sidebar muestra información personalizada del usuario logueado

---

## Backlog (próximas tareas)

### **Prioridad Alta (F1 MVP Sales)**

1. [x] (TB-002) Paginación de productos en PLP — Rationale: Manejar catálogos grandes eficientemente — TS done: 2025-10-09 20:03
   - Estimación: 2-3 días | Componente Pagination + URL state + testing E2E

2. [x] (TB-003) Sistema de filtros de productos — Rationale: Mejorar experiencia de búsqueda — TS done: 2025-10-09 20:03
   - Estimación: 3-4 días | Filtros por categoría/talle/color/precio + URL state

### **Prioridad Media**

3. [x] (TB-004) Panel de administración estilo TiendaNube — Rationale: Gestión completa del e-commerce — TS done: 2025-10-09 20:03
   - Estimación: 5-7 días | Dashboard + CRUD productos/órdenes/stock según admin-panel-design-specs.md
   
4. [ ] (TB-005) Mejora sistema de simulación de compras — Rationale: Testing automatizado robusto
   - Estimación: 2-3 días | Scripts E2E + datos prueba + integración Playwright

### **Prioridad Baja (Optimizaciones)**

5. [ ] (UI-001) Mejorar selector de variantes en PDP — Rationale: UX más clara para talle/color
6. [x] (PERF-001) Optimizar carga de imágenes de productos — Rationale: Performance en PLP — TS done: 2025-10-09 20:03
7. [x] (ADMIN-001) Panel de gestión de cupones — Rationale: Facilitar creación/edición de descuentos — TS done: 2025-10-09 20:03
8. [ ] (EMAIL-001) Templates de emails transaccionales — Rationale: Comunicación profesional con clientes
9. [ ] (SEO-001) Implementar schema.org para productos — Rationale: Mejor indexación en buscadores

### **Nuevas tareas identificadas (2025-09-30)**

10. [x] (ADMIN-002) Implementar selector de tema claro/oscuro en dashboard admin — Rationale: Consistencia UX con sitio público — TS done: 2025-10-09 20:03
11. [x] (ADMIN-003) Hacer dinámicos los estilos de componentes del dashboard — Rationale: Evitar hardcodeo, usar tokens/variables — TS done: 2025-10-09 20:03
12. [x] (FIX-002) Corregir visualización de precios en /admin/productos — Rationale: Los precios no aparecen en la tabla — TS done: 2025-10-09 20:03
13. [x] (FIX-003) Corregir lógica de badge de poco stock — Rationale: No mostrar badge si stock > 20 — TS done: 2025-10-09 20:03
14. [x] (FIX-004) Arreglar carga de productos en /productos — Rationale: Solo muestra "Cargando..." indefinidamente — TS done: 2025-10-09 20:03
15. [x] (UI-002) Implementar componente Loader global con animación — Rationale: UX consistente, no textos de carga — TS done: 2025-10-09 20:03
16. [x] (ADMIN-004) Implementar página de edición /admin/productos/[id] — Rationale: Error 404 al intentar editar producto — TS done: 2025-10-09 20:03
17. [ ] (FIX-005) Corregir estado del botón login cuando usuario logueado — Rationale: Botón queda disabled en home estando logueado

---

## Context switch log (cuando cambie de tarea por correcciones)

<!-- Registro de cambios de contexto -->

---

## Recurring checks (cada PR)

- [ ] Vercel Preview verificado
- [ ] ESLint OK
- [ ] Type-check OK
- [ ] Tests (unit/e2e) OK
- [ ] ROADMAP actualizado (qué/cómo + fecha)
- [ ] LEARNING_LOG nueva entrada si hubo incidentes

### Status gating

- You may ONLY move an item to **Done** after posting in the task bullet:
  - `Checks:` ESLint ✅ | Types ✅ | E2E ✅ | Preview ✅
  - `Evidence:` <Preview URL> · <Tests report/trace link>
- If any check fails → move to **Failed verification** (subsection under Done) with a link to the new follow-up task.

---

## Notes & Learnings (resumen diario)

- TS: 2025-09-26 — Implementado sistema de seguimiento de tareas append-only para mejor organización del trabajo
