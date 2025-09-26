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

- [x] (FP-001) Corrección masiva de precios — TS done: 2025-09-26 14:30
  - How: Script fix-prices-massive.js corrigió 51 productos y 765 variantes dividiendo precios por 100
  - Checks: ESLint ✅ | Types ✅ | Tests ✅ | Preview ✅
  - PR: feature/fix-prices-and-colors — Merge: sí, mergeado a develop
  - Notes: Error original en función priceToInteger que multiplicaba por 100 innecesariamente

---

## Backlog (próximas 5)

1. [ ] (UI-001) Mejorar selector de variantes en PDP — Rationale: UX más clara para talle/color
2. [ ] (PERF-001) Optimizar carga de imágenes de productos — Rationale: Performance en PLP
3. [ ] (ADMIN-001) Panel de gestión de cupones — Rationale: Facilitar creación/edición de descuentos
4. [ ] (EMAIL-001) Templates de emails transaccionales — Rationale: Comunicación profesional con clientes
5. [ ] (SEO-001) Implementar schema.org para productos — Rationale: Mejor indexación en buscadores

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
