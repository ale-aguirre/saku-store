# AI_QA_CONTEXT.md

**Purpose**: Give Trae (AI Q&A) a stable, concise context about the **Sakú Lencería** project so agents answer consistently without hallucinations.

## Brand & Business

- **Name**: Sakú Lencería — **Domain**: `sakulenceria.com` (not used during development; current prod on TiendaNube).
- **Palette**: `#d8ceb5` (base), `#ffffff`, `#000000`.
- **Logo**: custom logotype using **Razed Bold** (logo only; do not use for body text).
- **Market**: Argentina (all provinces).
- **Fiscal**: **Monotributo** (in process). Invoice type **C**. Prices **include VAT**.
- **Policies**: No returns for hygiene (intimate apparel). Exchanges by size only if explicitly allowed (unused, with tag). Privacy, Cookies and Terms follow AR law.

## Catalog & Variants

- **Initial SKUs**: 10.
- **Variants**: Size {85, 90, 95, 100} × Color {black, red, white}.
- **Inventory**: tracked **per-variant**. Combos allowed. Wholesale role with role-based prices.

## Payments & Shipping

- **Payments**: **Mercado Pago**.
- **Checkout**: **Checkout Pro** for MVP (redirect). Consider **Bricks** later.
- **Shipping**: **Single national flat rate** + **Cordoba city courier** (customer pays). Tracking via Correo Argentino code/link.

## Tech Stack & Libraries

- **Frontend**: Next.js (App Router), Tailwind, **shadcn/ui + Radix**, `next-themes` (dark/light).
- **Data/Auth/Storage**: **Supabase**.
- **State & Validation**: TanStack Query, Zod, react-hook-form.
- **Analytics**: GA4 + Meta Pixel (basic Consent Mode).
- **i18n**: not required for MVP.

## Key Flows

1. PDP → Cart → Coupon → Shipping → **Checkout Pro** → MP Webhook → Order _paid_ → Email/WhatsApp.
2. Abandoned cart: 3–6 h without purchase → reminder (email/WA) with deeplink.
3. NPS: 5–7 days after _fulfilled_ → 0–10 survey.
4. RFM: monthly job → segments (VIP / Active / At Risk / Inactive) → campaigns.

## Data Model (summary)

- `products(id, name, slug, description, care_instructions, images[], collections[], active, created_at)`
- `variants(id, product_id, size, color, sku, weight_g, dimensions_cm, price, compare_at_price?, stock, active)`
- `prices(id, variant_id, role[retail|wholesale], price)`
- `inventory_movements(id, variant_id, delta, reason, ref_id?, created_at)`
- `carts(id, user_id?, items[], coupon_code?, shipping_method?, shipping_cost?, subtotal, total, expires_at)`
- `orders(id, user_id?, items[], subtotal, discount_total, shipping_cost, total, payment_method, mp_payment_id?, mp_status?, status[pending|paid|fulfilled|cancelled|refunded], shipping_address, tracking_code?, carrier?, created_at)`
- `order_events(id, order_id, type, payload, created_at)`
- `coupons(code, type[%|fixed], amount, start_at, end_at, max_uses, per_user_limit, conditions JSON, active)`
- `coupon_usages(coupon_code, user_id?, order_id, used_at)`
- `nps(order_id, score, comment?, created_at)`
- `rfm_segments(user_id, recency_days, frequency, monetary_total, segment_label, updated_at)`
- `users(id, email, name, phone?, preferred_sizes[]?, preferred_colors[]?, role[retail|wholesale|admin])`
- `addresses(id, user_id, type[shipping|billing], province, city, zip, street, number, extra?, default)`

## Glossary (for agents)

- **NPS**: 0–10 likelihood to recommend, post‑purchase.
- **RFM**: Recency, Frequency, Monetary segmentation.
- **BSP**: WhatsApp Business API provider (e.g., 360dialog, Gupshup).

### Non-negotiable Data Rules

Variant = (size, color). Stock, SKU and price live at variant level.
Orders must store item/price snapshot and Mercado Pago IDs/status.
Coupons must record per-user limits and a global max-uses counter.

### Layout Defaults (MVP)

Container widths and paddings follow `project_rules.md`.
Show size guide and hygiene policy on PDP clearly but unobtrusively.
