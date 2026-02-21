# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server (localhost:3001)
npm run build     # Production build
npm run lint      # Biome lint on src/
npm run format    # Biome format on src/ (--write)
npm run check     # Biome lint + format together (--write)
npm run seed      # Populate DB with seed data

# Prisma
npx prisma generate    # Regenerate client after schema changes
npx prisma db push     # Sync schema → DB (no migration files)
npx prisma studio      # Visual DB browser
```

**Linter/Formatter:** Biome (not ESLint/Prettier). Use `npm run check` before committing.

## Architecture Overview

### Route Groups
```
src/app/
├── (auth)/          # /giris, /kayit — public auth pages
├── (store)/         # Customer-facing storefront (layout wraps header/footer)
│   ├── urunler/     # Product listing + [slug] detail
│   ├── sepet/       # Cart
│   └── hesabim/     # Account (protected via layout-level redirect)
├── admin/           # Admin panel (protected via layout-level redirect, role=ADMIN)
└── api/             # REST API routes
```

### Middleware
`src/proxy.ts` — this is the Next.js middleware (not `middleware.ts`). Exports `proxy` function + `config`. Handles:
- Route protection via `getSessionCookie()` for `protectedPaths = ["/dashboard", "/hesap", "/profil"]`
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- In-memory rate limiting for `/api/*` (60 req/min per IP)

Note: `/hesabim` and `/admin` are protected at their layout level via `auth.api.getSession()`, not in `proxy.ts`.

### Authentication (Better Auth v1.4.18)
- **Config:** `src/lib/auth.ts` — email/password only, roles: `"ADMIN"` | `"CUSTOMER"` (default)
- **Client hooks:** `src/lib/auth-client.ts` — exports `useSession`, `signIn`, `signOut`, `signUp`
- **Server helpers:** `src/lib/auth-server.ts` — exports `getServerSession()`, `requireAuth()`, `requireAdmin()`, `isAdmin()`
- **API route:** `src/app/api/auth/[...all]/route.ts` catches all Better Auth endpoints
- Session: HTTP-only cookie, 7-day expiry, 5-min cookie cache

```ts
// Client component
const { data: session } = useSession();

// Server component / API route
const session = await auth.api.getSession({ headers: await headers() });
// or use helpers from auth-server.ts
```

### API Routes Pattern
All routes follow REST conventions. Admin-only routes check `session.user.role !== "ADMIN"` and return 401. Structure:
```
/api/products/route.ts          → GET (list+filter+paginate), POST (create, admin)
/api/products/[id]/route.ts     → GET, PATCH, DELETE
/api/products/slug/[slug]/      → GET by slug (used on storefront)
/api/products/related/[id]/     → GET similar + complementary products
```

Response format for lists: `{ data: T[], meta: { total, page, limit, totalPages } }`

### Data Flow
```
Page/Component
  → TanStack Query (useQuery/useMutation) or direct fetch
  → API Route (src/app/api/)
  → Prisma (src/lib/prisma.ts) → PostgreSQL
```

Service layer (`src/services/`) wraps API calls for client-side data fetching. Used by `discounted-products-section` and similar components that fetch on mount.

### State Management
- **Server state:** TanStack Query — all data fetching, caching, invalidation
- **Cart:** Zustand (`src/store/use-cart-store.ts`) — persisted client-side
- **Admin sidebar:** Zustand (`src/store/use-admin-sidebar-store.ts`)
- **Forms:** react-hook-form + Zod (`src/lib/validations.ts` for schemas)

### Component Organization
```
src/components/
├── ui/          # shadcn/ui primitives (never modify directly)
├── store/       # Storefront components (product-card.tsx, header.tsx, etc.)
│   ├── home/    # Homepage sections
│   └── product/ # Product detail sub-components (similar-products, etc.)
├── admin/       # Admin panel components
└── animations/  # motion/react animation wrappers
```

### Database Schema Key Points
- `Category` is hierarchical: `parentId` self-reference. Root categories have no parent; subcategories have `parentId`.
- `Product.price` / `comparePrice` are `Float`. When `comparePrice > price`, product has a discount.
- `ProductImage.order` controls gallery order — always `orderBy: { order: "asc" }` when fetching.
- `Banner.position` enum: `HERO | SIDEBAR | CATEGORY | PRODUCT | POPUP`
- `Order` has both `status` (OrderStatus enum) and `paymentStatus` (PaymentStatus enum).

### Image Usage
Always use Next.js `<Image>` from `next/image`. New external hostnames must be added to `remotePatterns` in `next.config.ts`.

### Slug Generation
Turkish → ASCII slug pattern (used in product/category/brand creation):
```ts
name.toLowerCase()
  .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
  .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
```

### Payment
iyzico integration in `src/lib/iyzico.ts`. Sandbox URL: `https://sandbox-api.iyzipay.com`. Callback webhook at `/api/payment/callback`.

### 3D Components
Three.js via `@react-three/fiber` + `@react-three/drei`. Only used in `BicycleShowcase` component. Must be dynamically imported (`next/dynamic`) with `ssr: false`.
