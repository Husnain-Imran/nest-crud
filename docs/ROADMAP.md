# PeptideStock Roadmap

Practice and portfolio backend (NestJS 11, TypeORM, MySQL, pnpm). Fake data only.
Hours are estimates. Pace: about 20 h/week (1 h weekdays, 8 to 9 h weekend days).

_Last updated: 2026-11-24_

## Done

- [x] Product module (create, update, get-one, list, soft delete)
- [x] Inventory module (ledger, `applyStockChange` helper, set-stock, threshold, history, initial stock)
- [x] Rate limiting (`@nestjs/throttler`) + e2e tests
- [x] Helmet + CORS
- [x] TypeORM migrations (`synchronize: false`, data source in `src/database/data-source.ts`)

## Phase order

| # | Phase | Est. | Target |
|---|---|---|---|
| 0 | Cleanup: small leftovers | ~1 h | Week 1 |
| 1 | Docker (Lessons 2 to 9) | 12 to 15 h | Weeks 1 to 2 |
| 2 | Hardening | 3 to 4 h | Week 2 |
| 3 | Better Auth | plan TBD | Weeks 3 to 4 |
| 4 | AWS learning + first deploy | 40 to 70 h | Weeks 5 to 8 (first deploy ~late Dec) |
| 5 | Sales rep foundation | 8 to 12 h | January |
| 6 | Orders | 30 to 40 h | |
| 7 | Commission | 25 to 40 h | |
| 8 | Frontend + portfolio polish | 30 to 50 h | |

### Why this order

- **Cleanup first:** small, quick fixes and a proof that the compiled build (`node dist/main`) runs, since that's what Docker will run.
- **Docker before Better Auth:** the Dockerfile and Compose setup don't depend on auth, and Docker gives a throwaway MySQL to test the auth migrations safely.
- **Better Auth before AWS:** it will likely change the user id type (`created_by`, `performed_by` FKs) and move to cookies (CORS `credentials`, cookie flags, CSRF). Doing that on a deployed database is much harder, so deploy once with the final auth.
- **Deploy before orders:** every later feature then also practices deploys, logs and debugging, and it gives a live project for Upwork.
- **Reps → orders → commission:** commission rules can't be tested without real orders.

## Phase 0: Cleanup

- [ ] Proof the build runs: `pnpm build` → `node dist/main` starts
- [ ] Pin `@nestjs/mapped-types` (now `"*"`)
- [ ] Keep one hashing lib (`argon2` or `bcrypt`)
- [ ] Remove stray `console.log`s and unused imports

### Nice to have (not a blocker)

- [ ] Replace `from 'src/...'` with relative paths (26 files on 2026-11-24), then remove `paths` from `tsconfig.json` and the Jest `moduleNameMapper`
  - Verified 2026-11-24: `nest build` rewrites `src/...` into relative paths in `dist/` (0 `require("src/...")` left), so Docker is **not** blocked. Plain `tsc` would not rewrite them.

## Phase 1: Docker

- [x] 1. Mental model + first containers
- [ ] 2. Env vars, ports, volumes (MySQL in a container)
- [ ] 3. First Dockerfile + `.dockerignore`
- [ ] 4. Layer caching (copy manifests first, `pnpm install --frozen-lockfile`)
- [ ] 5. Docker Compose (app + MySQL)
- [ ] 6. Compose networking (`DB_HOST` = service name) + healthchecks + `depends_on`
- [ ] 7. Multi-stage build, pinned Node version, non-root user (watch `argon2`/`bcrypt` native builds)
- [ ] 8. Migrations in containers (separate step before app start; compiled data source, no ts-node)
- [ ] 9. Debugging drills

Rules: no `.env` in the image, secrets only at run time.

## Phase 2: Hardening

- [ ] Env validation: app refuses to start without `DB_*`, `JWT_SECRET`, `CORS_ORIGINS`
- [ ] Global exception filter: consistent error shape, no stack traces
- [ ] `GET /health`: no JWT guard, `@SkipThrottle()`
- [ ] `app.set('trust proxy', 1)` for running behind a load balancer

## Phase 3: Better Auth

Plan to be written together before starting. Points to cover:

- Current auth: `JwtAuthGuard`, `RolesGuard`, `@Roles`, `@CurrentUser()`, `CurrentUserInterceptor`, numeric `user.id`
- User id type change and its effect on `created_by` / `performed_by` FKs + migrations
- Cookies: CORS `credentials: true` with explicit origins, `httpOnly` / `secure` / `sameSite`, CSRF
- Throttled routes (`/auth/signin`, `/auth/signup`) and their e2e tests
- Don't delete the current auth first; migrate step by step

## Phase 4: AWS

Account safety (MFA, budget alert) first. Then IAM, VPC, ECR, RDS MySQL (private), ECS Fargate, ALB + ACM (HTTPS), Secrets Manager or SSM, CloudWatch, migrations as a pre-start deploy step, GitHub Actions with OIDC. Check current AWS pricing before creating resources.

## Phases 5 to 8

- **Sales reps:** waiting on the SOW. Open questions: admin + rep at once, hierarchy depth, % or fixed commission, who sets rates, when commission is payable, what reps can see, how returns reverse commission.
- **Orders:** snapshot rows (`unitPrice`, discount), `unitCost` on sale ledger rows, stock through `applyStockChange` with source `sale`, low-stock email.
- **Commission:** append-only commission ledger, rep + upline share.
- **Frontend + polish:** React on S3 + CloudFront, README with architecture, demo video.

## Open decisions

- Allow deleting a product with `currentStock > 0`? (recommended: allow, confirm on the frontend)
- Threshold DTO: drop `null` since `0` = off?
- Queues (SQS): skip unless a real need appears
