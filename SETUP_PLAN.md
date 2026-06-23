# LUI-4 — Company setup plan (CEO onboarding + execution roadmap)

Date: 2026-06-23  
Canonical issue: **LUI-4 — Onboard yourself on this structure and plan how to get everything setup**  
Operational fallback: **PSI-129** (Linear) when Paperclip canonical mutations are unavailable.

---

## 1) Executive structure (how we operate)

### Agent hierarchy

| Role | Owns | Routes to |
|------|------|-----------|
| **CEO** | Strategy, prioritization, cross-functional coordination, board comms, hiring decisions | Delegates all IC work |
| **CTO** | Code, bugs, features, infra, devtools, technical setup | — |
| **CMO** | Marketing, content, social, growth, devrel | — |
| **UXDesigner** | UX, design, user research, design system | — |

### Delegation rules (CEO policy)

1. CEO **does not** write code, fix bugs, or implement features.
2. Every delegated handoff includes: objective, owner, acceptance criteria, blocker (if any), next action.
3. Cross-functional work is split into department-owned child issues.
4. When ownership is unclear, default technical work to **CTO**.

### Artifact locations

| Type | Location |
|------|----------|
| Company-wide plans, charters, roadmaps | Project root (`/`) and `/docs/` |
| CEO personal memory / notes | Paperclip agent home directory (per-agent) |
| Product source of truth | `docs/PRODUCT_PLAN.md` |
| Business + GTM strategy | `docs/business-plan-lui-3.md`, `docs/delegation-map-lui-3.md` |
| Engineering execution | `docs/cto-sprint1-charter-lui-3.md`, `ROADMAP_TASK_BREAKDOWN.md` |
| Hiring | `HIRING_PLAN.md` |

---

## 2) Product workspace (Fabrica de Contenido)

This repo is a **Next.js 16 multi-tenant SaaS** for AI-powered social content autopilot.

### Stack summary

- **App**: Next.js 16, TypeScript, Tailwind 4, shadcn
- **Auth**: Clerk (omit invalid placeholder keys in local dev)
- **DB**: PostgreSQL + Prisma
- **Queue**: Inngest (`/api/inngest`)
- **Publishing**: Buffer GraphQL (BYOK per tenant)
- **Video**: Editframe (BYOK) + optional GitHub Actions legacy path
- **Storage**: Cloudflare R2 (required for public media URLs)

### Core user journey

`Onboarding (4 steps)` → `Studio / Automation` → `Content approval` → `Buffer publish` → `Autopilot cron`

See `docs/PRODUCT_PLAN.md` for milestone status (M1–M8) and dead-end audit (D1–D19).

---

## 3) Setup phases

### Phase 0 — Agent operating system (Paperclip)

**Owner: CTO** (platform) + **Board** (provisioning)

| Step | Action | Owner | Status |
|------|--------|-------|--------|
| 0.1 | Restore Paperclip API reachability from cloud agents (`PAPERCLIP_API_URL` not localhost-only) | CTO | Blocked — see `PSI-117` |
| 0.2 | Provision assignable **CMO** and **UXDesigner** agents | Board | Blocked — see `PSI-112` |
| 0.3 | Verify CEO can create child issues + comments on canonical LUI-* issues | CTO | Pending 0.1 |
| 0.4 | Establish durable canonical↔fallback alias policy | CTO | Partial — `PSI-104` done |

### Phase 1 — Local development (this repo)

**Owner: CTO**

| Step | Action | Verification |
|------|--------|--------------|
| 1.1 | `npm install` | `node_modules` present |
| 1.2 | Copy `.env.example` → `.env`; set `DATABASE_URL`, `ENCRYPTION_MASTER_KEY`, `NEXT_PUBLIC_APP_URL` | Server starts without env validation errors |
| 1.3 | Start Postgres (`docker compose -f docker/docker-compose.yml up -d`) | Port 5432 reachable |
| 1.4 | `npm run db:push` + `npm run db:seed` | Schema + skills seeded |
| 1.5 | Omit invalid Clerk placeholder keys OR use real test keys | `/api/health` returns `ok: true`, `db.ok: true` |
| 1.6 | `npm run dev` | `curl -s http://localhost:3000/api/health` |

Clerk keys: invalid `pk_test_xxx` placeholders cause middleware errors on every route. For DB-only dev, omit Clerk env vars entirely.

### Phase 2 — Optional services (E2E pipeline)

**Owner: CTO** — required only for slideshow render/publish E2E

| Service | Purpose | Required for |
|---------|---------|--------------|
| Inngest | Job orchestration + autopilot cron | Pipeline + automation |
| R2 | Public MP4/image/audio hosting | Buffer publish + Editframe |
| Tenant BYOK keys | OpenAI, Editframe, Buffer | Full product demo |
| Pexels API key | Stock images (optional) | Image fallback |

### Phase 3 — Multi-repo company setup

**Owner: CTO** — tracked under LUI-2 (`PSI-106` / `PSI-107`)

Repos in scope: Pavla, PsicoConecta, FabricaDeContenido, Mardelplata.dev.ar

| Step | Action |
|------|--------|
| 3.1 | Verify GitHub integration / repo access for all in-scope projects |
| 3.2 | Document MCP credential matrix per repo |
| 3.3 | Board-facing key request packet for missing integrations |

### Phase 4 — Team capacity + first sprint

**Owner: CEO** (prioritization) → **CTO / CMO / UXDesigner** (execution)

| Track | Charter | Priority |
|-------|---------|----------|
| CTO Sprint 1 | `docs/cto-sprint1-charter-lui-3.md` — E2E reliability + activation | P0 |
| UX Sprint 1 | `docs/ux-execution-plan-lui-3.md` — onboarding conversion | P0 (blocked on CMO/UX agents) |
| CMO Sprint 1 | `docs/cmo-sprint1-playbook-lui-3.md` — demand + lifecycle | P1 (blocked on CMO agent) |
| Hiring LUI-1 | `HIRING_PLAN.md` — first founding engineer | P1 — `PSI-95` |

**Sequencing rule** (from delegation map): no mass commercial push until WS-CTO-1 (pipeline reliability) is green.

---

## 4) Current blockers (board action may be required)

| Blocker | Impact | Unblock owner | Issue |
|---------|--------|---------------|-------|
| Paperclip API unreachable from cloud (`127.0.0.1:3100`) | CEO cannot persist comments/delegation on canonical LUI-* | CTO + Board | `PSI-117` |
| CMO / UXDesigner agents not provisioned | Marketing and design tracks cannot be delegated | Board | `PSI-112` |
| Canonical LUI-* IDs not in Linear | Fallback PSI-* issues required for continuity | CTO | `PSI-108` pattern |
| Previous heartbeat adapter error (`agent` not in PATH) | Paperclip cursor adapter failed | CTO / Platform | LUI-4 run log |

---

## 5) Delegated child work (LUI-4)

| Objective | Owner | Acceptance criteria | Issue |
|-----------|-------|---------------------|-------|
| Verify Fabrica local dev stack end-to-end | CTO | Health check passes; db push + seed documented with evidence | `PSI-130` |
| Recover canonical source mapping for LUI-4 | CTO | LUI-4 resolvable or alias bridge documented | `PSI-131` |
| Continue multi-repo setup (LUI-2) | CTO | GitHub + MCP matrix from PSI-107 | `PSI-107` |
| Restore Paperclip API for cloud agents | CTO | CEO can POST comments/issues from cloud heartbeat | `PSI-117` |

---

## 6) Definition of done (LUI-4)

CEO onboarding on LUI-4 is **complete** when:

- [x] Company structure and delegation model documented (this file)
- [x] Setup phases defined with owners and verification steps
- [x] Blockers named with unblock owners
- [x] Child issues created and assigned to CTO
- [ ] CTO confirms Phase 1 local dev verification (`PSI-130`) — *delegated, not CEO IC work*

---

## 7) Related documents

- `README.md` — local dev quickstart
- `AGENTS.md` — cloud VM instructions (Postgres, Clerk, health check)
- `docs/PRODUCT_PLAN.md` — product milestones
- `docs/delegation-map-lui-3.md` — 90-day workstreams by function
- `ROADMAP_TASK_BREAKDOWN.md` — Q1–Q2 child tasks
- `HIRING_PLAN.md` — LUI-1 founding engineer plan
