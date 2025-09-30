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

- [x] (TB-001) Implementar TASKS_BOARD.md — Owner: Saku — TS: 2025-09-26 15:03
  - Goal: Crear sistema de seguimiento de tareas append-only
  - Acceptance: Archivo creado con estructura completa y funcional
  - Links: feature/tasks-board-implementation
  - Notes: Primera implementación del sistema de tareas

---

## In Progress

<!-- Tareas actualmente en desarrollo -->

---

## Blocked

<!-- Tareas bloqueadas esperando resolución -->

---

## Done (history)

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

---

## Backlog (próximas tareas)

### **Prioridad Alta (F1 MVP Sales)**

1. [ ] (TB-002) Paginación de productos en PLP — Rationale: Manejar catálogos grandes eficientemente
   - Estimación: 2-3 días | Componente Pagination + URL state + testing E2E
   
2. [ ] (TB-003) Sistema de filtros de productos — Rationale: Mejorar experiencia de búsqueda
   - Estimación: 3-4 días | Filtros por categoría/talle/color/precio + URL state

### **Prioridad Media**

3. [ ] (TB-004) Panel de administración estilo TiendaNube — Rationale: Gestión completa del e-commerce
   - Estimación: 5-7 días | Dashboard + CRUD productos/órdenes/stock según admin-panel-design-specs.md
   
4. [ ] (TB-005) Mejora sistema de simulación de compras — Rationale: Testing automatizado robusto
   - Estimación: 2-3 días | Scripts E2E + datos prueba + integración Playwright

### **Prioridad Baja (Optimizaciones)**

5. [ ] (UI-001) Mejorar selector de variantes en PDP — Rationale: UX más clara para talle/color
6. [ ] (PERF-001) Optimizar carga de imágenes de productos — Rationale: Performance en PLP
7. [ ] (ADMIN-001) Panel de gestión de cupones — Rationale: Facilitar creación/edición de descuentos
8. [ ] (EMAIL-001) Templates de emails transaccionales — Rationale: Comunicación profesional con clientes
9. [ ] (SEO-001) Implementar schema.org para productos — Rationale: Mejor indexación en buscadores

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
