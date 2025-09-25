# user_rules.md

**Goal**: Personal preferences for Ale that Trae must follow in every task.

## Language & Style

- **Default language**: **Spanish** (simple and direct). English is OK when code, APIs, or filenames require it.
- Keep responses **compact**; no filler. If unsure, say so and propose verification.
- Ask **up to 3** key questions when info is missing; otherwise make minimal reasonable assumptions.

## Code & Comments

- **Do not output code** unless explicitly requested. When code is requested:
  - Provide **full files** or **exact lines + 2–3 lines of context** (never a diff).
  - Add **function-level comments** only when the behavior is non-obvious (concise JSDoc or inline notes).

## Platform Notes

- Developer machine: **Windows** (PowerShell). Prefer cross-platform scripts/commands; provide Windows-friendly alternatives when needed.

## Tech Stack (fixed)

- Next.js (App Router), Supabase, Tailwind, shadcn/ui, Radix, TanStack Query, Zod, react-hook-form, next-themes, lucide-react.

## UI/UX

- Must support **dark/light**. Accessible components (AA). No hardcoded texts—use DB or `site_settings`/`copy_blocks`.

## Invariants & Dependencies

- Do not break public routes, public props, or API/DTO contracts. Breaking changes → propose **v2 + migration**.
- Do not add dependencies outside the stack unless justified (real package, purpose, alternative).

## Security

- Never expose secrets (`.env`). Validate inputs with **Zod**. Keep Supabase **RLS** enabled.
- Avoid storing tokens in `localStorage`; prefer HttpOnly cookies / server session.

## Environment Discipline

Keep `.env` small. If a setting can live in DB, do **not** add an env var.  
When proposing a new env var: specify **name, purpose, visibility (public/server),** and **why DB is not enough**.

## UI Spacing Defaults (what I expect)

Use container padding (`px-4 / md:px-6 / lg:px-8`) and an **8-pt spacing scale**.  
No components flush to edges; add safe margins on mobile.  
If spacing feels cramped, increase whitespace rather than shrinking text.

## Git Expectations

Work off short-lived branches (`feature/*`, `fix/*`, etc.) and PR into `develop`.  
Use **Conventional Commits**; keep PRs small and focused.  
Never push directly to `main`. Tag releases using **SemVer** (`vX.Y.Z`).

## Preview Discipline

Every push must produce a **Vercel Preview** and be **manually checked** before merging to `develop` or `main`. If the preview breaks, fix on the same branch and wait for a new preview before approving.

## Operational Expectations

- Always finish by triggering the email notification via `npm run notify:done`.
- Keep only port **3000** active for the local app; shut down stray servers.
- Maintain `/docs/ROADMAP.md` with done items, how they were done, and the current date.
- Before any handoff: pass **ESLint** and **TypeScript** checks; include test updates and results.
- Work in a **fresh branch per task** and request approval before merging to `develop` or `main`.
- Log recurring mistakes and preventions in `/docs/LEARNING_LOG.md`.
- Do **not** edit `project_rules.md`, `user_rules.md`, or `AI_QA_CONTEXT.md` without explicit authorization.

## Learning Log Discipline

- **Append-only**: never delete/edit existing entries in `/docs/LEARNING_LOG.md`. Add a new one with date and 4 bullets (**Issue, Cause, Fix, Prevention**).

## Merge Discipline

- **No merges without my approval**. Always PR → `develop`, verified preview, green checks, then request approval.

## Next.js Usage

- No raw `<a>`/`<img>` in app code. Use `next/link` and `next/image`. Exceptions only for sanitized CMS content and must be justified in the PR.

## Branch Continuity

- **One branch per task**. After merging into `develop`, create the next branch **from the updated `develop`** and record continuity in `/docs/ROADMAP.md`.

## Single .env

- Use **only `.env`**. Do **not** create `.env.local`, `.env.example`, or any variants.

## Dynamic Everything

- No hardcoded texts/classes. Texts come from `copy_blocks`/`site_settings`.
- Classes use tokens + `class-variance-authority` / `tailwind-merge`.
- If the data source is missing, create it first.

## Icons, not Emojis

- Do not use emojis in UI. Use icons (lucide) consistent with the design.

## No Duplicates

- Before proposing code: search and link existing files; if creating something new, justify why reuse is not possible.
