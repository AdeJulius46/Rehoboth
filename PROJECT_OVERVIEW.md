# Rehoboth — Project Overview

> Business management / ERP web app for sales, inventory, invoicing, and team operations.
> Root: `C:\Users\user\Desktop\Rehoboth` — Next.js 16 + React 19 + Prisma 7 + PostgreSQL.

## 1. What is this?

**Rehoboth** (`rehoboth@0.1.0`) is an internal operations system. One dashboard + 12 business modules + auth + settings:

| Area | Route | What it does |
|---|---|---|
| Dashboard | `/dashboard` | Stat cards, revenue trend, recent sales, low stock, activity feed |
| Customers | `/customers*` | INDIVIDUAL/BUSINESS, credit limit, opening balance |
| Agents | `/agents*` | SALES/COLLECTION, commission rate, region, bank details |
| Staffs | `/staffs*` | HR record, employeeId, department/position, salary, link to User |
| Products | `/products*` | SKU, category/brand, cost/selling price, reorder level |
| Warehouses | `/warehouses*` | Code, location, capacity, stock per product |
| Sales | `/sales*` | Sale with items, decrements stock, restock on cancel/delete, `/sales/[id]/receipt` printable |
| Projects | `/projects*` | Code, customer/agent link, budget, progress, ACTIVE/COMPLETED/ON_HOLD/CANCELLED |
| Invoices | `/invoices*` | Standalone or `generateInvoiceFromSale`, DRAFT/SENT/PAID/OVERDUE, `/invoices/[id]/document` printable |
| Payments | `/payments*` | Payment vs invoice, syncs invoice status, `/payments/[id]/receipt` printable |
| Expenses | `/expenses*` | Category, vendor, paidBy staff, approve/reject flow |
| Reports | `/reports` | Financial breakdown donut, sales-by-category, top products, export CSV |
| Settings | `/settings` | Approve/reject PENDING users, change roles |
| Auth | `/login /register /forgot-password /reset-password /contact-admin` | Credentials + OTP registration + password reset |

Root `/` → redirects to `/dashboard` (`src/app/page.tsx`).

## 2. Tech stack

* **App:** `next@16.2.10`, `react@19.2.4`, App Router, Server Actions only. Dev/start port `3002` (`next dev -p 3002`).
* **DB:** `prisma@7.8.0`, `@prisma/adapter-pg`, `pg`, PostgreSQL 16 (`docker-compose.yml` → `5436:5432`). Generator output `src/generated/prisma`.
* **Auth:** `next-auth@5.0.0-beta.31`, `@auth/prisma-adapter`, `bcryptjs`, JWT with `{id, role}`.
* **UI:** `tailwindcss@4`, `shadcn@4`, `@base-ui/react`, `@radix-ui/react-slot`, `next-themes`, `lucide-react`, `sonner`.
* **Forms/Data:** `react-hook-form + @hookform/resolvers`, `zod@4`, `@tanstack/react-table + react-query`, `recharts`, `react-day-picker`, `date-fns`.
* **Files/Email/PDF:** `uploadthing + @uploadthing/react`, `resend + @aws-sdk/client-ses`, `jspdf + html2canvas-pro`.
* **State/Utils:** `zustand`, `clsx + tailwind-merge + class-variance-authority`.
* **Dev/Test:** `typescript@5`, `eslint@9 + eslint-config-next`, `prettier + prettier-plugin-tailwindcss`, `vitest + jsdom + testing-library`, `@playwright/test`, `tsx`, `@faker-js/faker`, `dotenv`.

## 3. How to run

```bash
npm run dev          # next dev -p 3002
npm run build        # prisma migrate deploy && next build
npm start            # next start -p 3002
npm run lint         # eslint
npm test             # vitest run
npm run test:e2e     # playwright test (baseURL localhost:3002, auto-starts dev)
npm run db:migrate   # prisma migrate dev
npm run db:studio    # prisma studio
npm run db:seed      # tsx prisma/seed.ts (bulk fake data)
npm run db:seed:admin# tsx prisma/seed-admin.ts
```

Infra: `docker-compose.yml` = `postgres:16-alpine`, volume `rehoboth-postgres-data`.
Env (see `.env.example`): `DATABASE_URL, DIRECT_DATABASE_URL, APP_URL, AUTH_SECRET, UPLOADTHING_TOKEN, EMAIL_PROVIDER(resend|ses), RESEND_*, AWS_*/SES_*`.
`next.config.ts` is empty. `postinstall` = `prisma generate`.

## 4. Architecture — Server Actions only

No hand-written REST for business logic. Every operation is a `"use server"` function in `src/features/<module>/actions.ts` (writes) or `queries.ts` (reads). Thin Server Components call them directly with `revalidatePath + redirect`.

Only 2 real HTTP routes (third-party SDK callbacks):
* `src/app/api/auth/[...nextauth]/route.ts` — Auth.js handler (re-exports `src/lib/auth.ts`)
* `src/app/api/uploadthing/route.ts` + `core.ts` — UploadThing callback

Full catalog: see `docs/backend-operations.md`. Module checklist: see `docs/module-recipe.md`.

Per-feature file shape:
```
src/features/<name>/
  schema.ts      # Zod validation
  queries.ts     # list/stats/byId/options (Decimal → Number)
  actions.ts     # create/update/delete/status (revalidate+redirect)
  components/    # columns.tsx, *-form.tsx, *-filters.tsx, *-stats.tsx, *-detail-actions.tsx
```

## 5. App routes (`src/app/`)

Layouts (3):
* `layout.tsx` — root
* `(auth)/layout.tsx` — centered auth card
* `(app)/layout.tsx` — sidebar + `AppHeader` (auto title/breadcrumb)

Pages — `page` (list) + `new` + `[id]` (detail) + `[id]/edit` per module, plus:
* `/sales/[id]/receipt` — printable sale receipt
* `/invoices/[id]/document` — printable invoice
* `/payments/[id]/receipt` — printable payment receipt
* `/reports`, `/settings`, `/dashboard`
* `/dev/components` — unguarded UI playground

Auth guard: `src/proxy.ts` (Next 16 `proxy`, not `middleware`). `AUTH_ROUTES=[/login,/forgot-password,/reset-password,/contact-admin,/register]`, `UNGUARDED=[/dev]`. Unauth → `/login`, authed on auth-route → `/dashboard`.

## 6. Database (`prisma/schema.prisma`)

Provider `postgresql`. Money `Decimal(12,2)`, commission `Decimal(5,2)`.

Enums (10): `Role(ADMIN,MANAGER,STAFF)`, `PersonStatus(ACTIVE,INACTIVE,PENDING)`, `CustomerType(INDIVIDUAL,BUSINESS)`, `SaleStatus(PENDING,COMPLETED,CANCELLED)`, `ProjectStatus(ACTIVE,COMPLETED,ON_HOLD,CANCELLED)`, `InvoiceStatus(DRAFT,SENT,PAID,OVERDUE)`, `PaymentMethod(CASH,TRANSFER,CARD,POS)`, `PaymentStatus(PENDING,COMPLETED,FAILED)`, `ExpenseStatus(PENDING,APPROVED,REJECTED)`, `AgentType(SALES,COLLECTION)`.

Models (18):
* `User` — auth account (`role`, `requestedRole`, `status`, `passwordHash`) → `Staff?`, `approvedExpenses`, `issuedReceipts`, `resetTokens`
* `PasswordResetToken`, `EmailVerificationCode` (registration OTP)
* `Company` — singleton created on very first signup
* `Customer` → `Sale[], Project[], Invoice[], Receipt[], Payment[]`
* `Agent` → `Sale[], Project[], Invoice[]`
* `Staff` (`userId?`, `employeeId unique`) → `Expense[]`
* `Product` → `Stock[], SaleItem[], InvoiceItem[]`
* `Warehouse` → `Stock[], Sale[]`
* `Stock` — `@@unique[productId, warehouseId]`, `quantity`
* `Sale` (+ `SaleItem[]`, `invoice?`, `receipt?`) — decrements stock in transaction
* `Project`, `Invoice` (+ `InvoiceItem[]`, `receipts`, `payments`), `Receipt`, `Payment`, `Expense` (`paidBy Staff?`, `approvedBy User?`)

Key chain: `Sale (stock--) → generateInvoiceFromSale → Payment / markInvoiceAsPaid (syncs Invoice+Sale) → Receipt`.

## 7. Key flows

* **Auth:** Credentials + bcrypt, only `ACTIVE` users. JWT carries `role`. `PENDING` blocked. Registration = OTP (`EmailVerificationCode`) → `completeRegistration` (creates `Company` on first signup + `User`) → admin `approveUser` (auto-creates `Staff` if role=STAFF) in `settings`.
* **Sales/Finance:** `createSale` (tx + stock check) → `updateSaleStatus(Cancelled)` restocks → `generateInvoiceFromSale` → `markInvoiceAsPaid` records real `Payment` for remaining balance + sets linked `Sale=COMPLETED`.
* **Inventory:** `setStockQuantity` / `addProductStock` per warehouse. Low-stock = `quantity <= reorderLevel` → dashboard + `getNotifications` bell.
* **Uploads:** UploadThing `entityImage` router (16MB image, auth middleware) → `imageUrl / receiptUrl / avatarUrl`. UI: `components/image-upload.tsx`.
* **Email:** `src/lib/email.ts` + `email-templates.ts` + `email-providers/{resend,ses}.ts`, switched by `EMAIL_PROVIDER`. `getAppUrl()` = `APP_URL > Vercel URL > localhost`.
* **Tables:** TanStack Table + `use-table-params.ts` (URLSearchParams sync, resets `page` on filter). Currency: `formatNaira()` (`en-NG/NGN`). CSV: `lib/csv.ts` (BOM+CRLF for Excel/₦).

## 8. Shared code

* `src/lib/`: `db.ts` (singleton Prisma+Pg adapter), `auth.ts`, `email*.ts`, `uploadthing.ts`, `currency.ts`, `csv.ts`, `constants.ts` (`NAV_SECTIONS` role-gated nav), `utils.ts` (`cn()`).
* `src/components/`: `layout/{sidebar,app-header,page-header,user-menu,notifications-menu,auth-card}`, `data-table/{data-table,toolbar,pagination}`, `forms/form-section`, `image-upload`, `printable-document`, `ui/` (~26 shadcn/Base-UI: button, dialog, combobox, calendar, stat-card, status-badge, etc.).
* `src/hooks/`: `use-table-params`, `use-debounce`. `src/types/next-auth.d.ts` augments session/JWT with `role`.

## 9. Tests

* Unit (`vitest.config.ts`, jsdom): `tests/unit/currency.test.ts, report-csv.test.ts, quantity-input.test.tsx`.
* E2E (`playwright.config.ts`): `tests/e2e/*.spec.ts` — `smoke, auth, register, customers, agents, staffs, products, warehouses, sales, invoices, payments, expenses, projects` — CRUD: create→detail, edit persists, search filters, delete removes.

## 10. Where to look next

* `docs/backend-operations.md` — every Server Action listed by module
* `docs/module-recipe.md` — how to add a new CRUD module (Figma-first, schema+migrate, ID-generator gotcha: max-suffix not `count+1`)
* `src/features/reports/queries.ts` — dashboard math
* `src/features/notifications/queries.ts` — bell logic (no table, computed fresh)
* `prisma/seed.ts` / `seed-admin.ts` — demo data + system admin
