# National Giro Platform (Foundation)

Monorepo:
- `apps/api`: NestJS API (Identity, Roles, Audit Logging, Health)
- `apps/web`: Next.js PWA frontend (UI shell + Auth)

## Dev prerequisites
- Node.js >= 20
- Docker Desktop

## Quick start
1. Copy env
   - `cp .env.example .env`
2. Start Postgres + Redis
   - `npm run db:up`
3. Start API
   - `npm run dev:api`
4. Start Web
   - `npm run dev:web`

## Non-custodial rule
This platform does not custody funds, pool deposits, or issue money.
Distributed Ledger will be used later ONLY for entitlement finality/audit trails.
