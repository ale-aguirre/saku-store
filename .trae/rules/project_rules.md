# project_rules.md

**Scope**: Build Sakú Lencería e‑commerce with basic CRM/automations.

## Framework & Dependencies

- **Next.js**: v15.x (App Router) — **React**: v19.x — **TypeScript**: v5.x
- **Core libs**: Tailwind v4, shadcn/ui (+ Radix UI), TanStack Query v5, Zod v4, react‑hook‑form v7, next‑themes.
- **Data/Auth/Storage**: Supabase (JS SDK v2). Payments: Mercado Pago (Checkout Pro).

## Architecture

- **Frontend**: Next.js (RSC where appropriate), Tailwind, shadcn/ui, Radix, `next-themes`.
- **Backend**: Next Route Handlers. Use server components/APIs for secrets. Enable Supabase **RLS**.
- **Data**: Tables and relations per **AI_QA_CONTEXT.md**.
- **Payments**: Mercado Pago **Checkout Pro** (v1). Webhook updates `orders` and writes `order_events`.
- **Shipping**: Single national flat rate + **Cordoba courier**; store tracking code + Correo Argentino link.
- **Admin**: CRUD products/variants/stock, orders (status + tracking), coupons, users, simple campaigns & automations toggles.
- **No hardcoded copy**: read texts/settings from DB (`site_settings`/`copy_blocks`).

## Testing

- **Unit**: **Vitest** + **Testing Library** for components and hooks.
- **E2E**: **Playwright** (smoke: PDP add-to-cart, coupon in cart, MP webhook → order paid).
- CI should run unit + e2e on PRs (preview deploy optional).

## Avoid / Do Not Use

- **Do not** place secrets in Client Components or `NEXT_PUBLIC_*` envs.
- **Do not** use `eval`, dynamic `Function`, or unsafe HTML without sanitization.
- **Avoid** experimental/unstable Next APIs unless justified (document rationale).
- **Avoid** storing auth/payment tokens in `localStorage`; prefer HttpOnly cookies or server session.
- **Do not** change public routes/DTOs without proposing a **v2 + migration** plan.

## Libraries (required)

- Tailwind, shadcn/ui, Radix UI, TanStack Query, Zod, react‑hook‑form, next‑themes, lucide‑react.

## Theme & Typography

- **Tokens**: colors `#d8ceb5/#ffffff/#000000`. Dark/light required.
- **Fonts**: **Marcellus** (headings) + **Inter** (body). **Razed Bold** only for the logo.

## Content & Copy

- Manage texts in `copy_blocks` (e.g., `hero_title`, `pdp_return_policy`).
- Show sensitive messages clearly but unobtrusively (e.g., “No returns due to hygiene” on PDP).

## Analytics & SEO

- GA4 + Meta Pixel + basic Consent Mode.
- Schema.org `Organization`, `Product`, `BreadcrumbList`; sitemap and robots.

## Quality

- Accessibility **AA**. Visible focus states.
- Performance: optimized images; minimal CSS (Tailwind JIT/purge); avoid unnecessary re‑renders.

## Environments

- Vercel preview deployments per PR.
- **Env vars** (examples):  
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE` (server only),  
  `MP_ACCESS_TOKEN`, `SMTP_HOST/USER/PASS/FROM`,  
  `GA4_ID`, `META_PIXEL_ID`,  
  `N8N_WEBHOOK_URL_*`, `WA_BSP_KEY` (when applicable).

## Roadmap (reference)

- **F0 Foundations**: UI kit + dark/light, legal pages, Consent, GA4/Pixel, Supabase schema & RLS.
- **F1 MVP Sales**: Home/PLP/PDP, Cart (drawer) + coupons, Shipping (flat + Cordoba courier), Checkout Pro, orders pending→paid, Admin MVP, transactional emails.
- **F2 Ops & CRM**: MP webhook, tracking link, n8n Cloud (abandoned cart, NPS, RFM, winback), Admin automations & campaigns, WhatsApp BSP templates.
- **F3 Optimization**: Bricks checkout (optional), advanced filters/search, wishlist, reviews, bundles, A/B tests, CWV, reports (CR, AOV, % recovered, NPS, RFM).

### Environment Variables Policy (MVP)

Use as few env vars as possible. Prefer DB-backed settings (`site_settings`, `copy_blocks`) before adding new envs. Any new env var must be justified in the PR.

**Allowed (MVP)**

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE # server only
- MP_ACCESS_TOKEN # test/prod
- SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
- GA4_ID, META_PIXEL_ID

### Data Model Canon

The canonical schema lives in `AI_QA_CONTEXT.md`.

- Inventory is per-variant (size × color).
- Orders store a snapshot of items/prices at purchase time.
- Schema changes require: migration script, backfill plan, and updating `AI_QA_CONTEXT.md`.

### UI/UX Spacing & Layout Guardrails

- Safe areas: never flush UI to screen edges.
- Containers: max-width ~1280–1440px; padding `px-4` (mobile), `md:px-6`, `lg:px-8`.
- Vertical rhythm: 8-pt scale.
- Tap targets ≥ 44×44px; line-height ≥ 1.5; body ≥ 14–16px.
- Grid gutters: ≥16px mobile, ≥24px tablet/desktop.
- Critical pages (Home/PLP/PDP/Checkout/Admin): require a spacing pass before merge.

## Git Workflow (mandatory)

- **Branches**
  - `main` → production (protected; PR from release/hotfix only)
  - `develop` → integration (default PR target)
  - Short-lived: `feature/*`, `fix/*`, `hotfix/*`, `chore/*`, `docs/*`, `refactor/*`, `perf/*`, `test/*`
- **Naming**
  - `feature/catalog-variant-selector`, `fix/mp-webhook-retry`, `hotfix/checkout-crash`
- **Commits**: Conventional Commits
  - `feat: add variant selector to PDP`
  - `fix: handle MP webhook idempotency`
- **PR Policy**
  - Target `develop`, squash-merge, CI (build, lint, tests) must pass. ≥1 review.
  - Include scope, screenshots (UI), acceptance criteria checklist.
- **Releases**
  - Cut `release/x.y.0` from `develop` → QA → merge to `main` with tag `vX.Y.Z` (SemVer).
  - Back-merge `main` → `develop` after release.
- **Hotfix**
  - Branch `hotfix/...` from `main`, patch, tag, then back-merge to `develop`.

## Operational Checklist (per task)

- **Notify on finish**: run `npm run notify:done` to trigger the email notification.
- **Ports**: ensure only port **3000** is in use for the local app; terminate other local web servers if present.
- **Roadmap updates**: update `/docs/ROADMAP.md` with:
  - what was done, how it was done (brief), and **today’s date**.
- **Quality gates**: run `npm run lint` and `npm run type-check` and include status in the PR.
- **Tests**: add/update tests relevant to the task and run them (unit/e2e).
- **Branching**: start each task from a new branch: `feature/*`, `fix/*`, etc.
- **Learning log**: append mistakes/recurring issues and how to avoid them to `/docs/LEARNING_LOG.md`.
- **Protected docs**: do **not** modify `project_rules.md`, `user_rules.md`, `AI_QA_CONTEXT.md` without explicit approval.
- **No merges without approval**: do not merge to `develop` or `main` without Ale’s approval; verify **Vercel Preview** before any merge.

## Tasks Board (mandatory, append-only)

- The agent must maintain a living **tasks board** at `docs/TASKS_BOARD.md`.
- **Append-only**: never delete or overwrite previous tasks; only add or move items between states.
- On **context switch/correction**: record an entry in **“Context switch log”** and leave the prior task as **In Progress (paused)** or move it to **Blocked** with a reason.
- Every PR must reference the corresponding board item (ID or title).
- Allowed states: **Backlog**, **Today**, **In Progress**, **Blocked**, **Done**.
- Format: Markdown with checkboxes `- [ ]` / `- [x]`, timestamps `YYYY-MM-DD HH:mm`, owner “Agent Saku”.

## Definition of Done (gated by evidence)

A task can be marked **Done** only if ALL checks are green and artifacts are attached:

**Required checks**

- ESLint ✔ `npm run lint` (exit code 0)
- Type-check ✔ `npm run type-check` (exit code 0)
- E2E (Playwright) ✔ against the **Vercel Preview** URL (exit code 0)
- Preview ✔ visually verified (no blocking errors in console)

**Required evidence**

- Link to the **Preview URL**
- Test report/summary (e.g., Playwright HTML report or traces link)
- Short note: what changed, how it was verified (1–3 bullets)

**Hard rule**

- If any check fails or artifacts are missing → status = **Failed verification** (NOT Done). Create a follow-up task instead of overwriting history.

## Definition of Done (gated by evidence)

A task can be marked **Done** only if ALL checks are green and artifacts are attached:

**Required checks**

- ESLint ✔ `npm run lint` (exit code 0)
- Type-check ✔ `npm run type-check` (exit code 0)
- E2E (Playwright) ✔ against the **Vercel Preview** URL (exit code 0)
- Preview ✔ visually verified (no blocking errors in console)

**Required evidence**

- Link to the **Preview URL**
- Test report/summary (e.g., Playwright HTML report or traces link)
- Short note: what changed, how it was verified (1–3 bullets)

**Hard rule**

- If any check fails or artifacts are missing → status = **Failed verification** (NOT Done). Create a follow-up task instead of overwriting history.
