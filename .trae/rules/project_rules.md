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
