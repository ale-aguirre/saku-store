# user_rules.md

**Goal**: Personal preferences for Ale that Trae must follow in every task.

## Language & Style
- **Default language**: **Spanish** (simple and direct). English is OK when code, APIs, or filenames require it.
- Keep responses **compact**; no filler. If unsure, say so and propose verification.
- Ask **up to 3** key questions when info is missing; otherwise make minimal reasonable assumptions.

## Code & Comments
- **Do not output code** unless explicitly requested. When code is requested:
  - Provide **full files** or **exact lines + 2–3 lines of context** (never diff).
  - Add **function‑level comments** only when the behavior is non‑obvious (concise JSDoc or inline notes).

## Platform Notes
- Developer machine: **Windows** (PowerShell). Prefer cross‑platform scripts/commands; provide Windows‑friendly alternatives when needed.

## Tech Stack (fixed)
- Next.js (App Router), Supabase, Tailwind, shadcn/ui, Radix, TanStack Query, Zod, react‑hook‑form, next‑themes, lucide‑react.

## UI/UX
- Must support **dark/light**. Accessible components (AA). No hardcoded texts—use DB or `site_settings`/`copy_blocks`.

## Invariants & Dependencies
- Do not break public routes, public props, or API/DTO contracts. Breaking changes → propose v2 + migration.
- Do not add dependencies outside the stack unless justified (real package, purpose, alternative).

## Security
- Never expose secrets (`.env`). Validate inputs with **Zod**. Keep Supabase **RLS** enabled.
- Avoid storing tokens in `localStorage`; prefer HttpOnly cookies / server session.
