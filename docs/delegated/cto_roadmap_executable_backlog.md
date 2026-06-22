# LUI-1 — CTO Executable Engineering Backlog (M1-M8)

## Scope and execution intent

This document decomposes milestones **M1-M8** from `docs/PRODUCT_PLAN.md` into executable engineering work with explicit ownership, dependencies, and acceptance criteria.  
It is structured for immediate delegation to child agents under issue **LUI-1**.

## Prioritized sprint-equivalent waves (impact/risk first)

### Wave 1 (Sprint-equivalent #1, highest impact and risk reduction)

| Priority | Task ID | Why now (impact/risk) | Blocks |
|---|---|---|---|
| 1 | M7-T1 | Removes "silent failure" mode (`D5`/`D18`) by surfacing dependency health in one place. | M3/M4 ops confidence |
| 2 | M4-T1 | Prevents duplicate generation/publishing via hard idempotency `(config, slot)`. | Reliable autopilot scale |
| 3 | M3-T2 | Eliminates invalid Buffer key path before users hit runtime failures. | M3-T3 success rate |
| 4 | M3-T3 | Turns Buffer sync into deterministic setup with explicit success/error recovery. | Activation funnel |
| 5 | M1-T1 | Consolidates onboarding into one flow to increase completion and lower drop-off. | M1-T2, M2-T1 |
| 6 | M1-T2 | Ensures derived onboarding fields actually drive default `ContentConfig`. | M2 auto-provisioning |
| 7 | M2-T1 | Auto-creates baseline skill configuration right after onboarding completion. | M2-T2, M4 throughput |
| 8 | M4-T2 | Adds retry/backoff behavior to convert transient failures into recoverable outcomes. | M4-T3 DLQ |

### Wave 2 (Sprint-equivalent #2, stabilization and monetization base)

| Priority | Task ID | Why now (impact/risk) | Blocks |
|---|---|---|---|
| 1 | M7-T2 | Gives operators and users visibility by job/run, needed for support and trust. | M7-T3 alerts |
| 2 | M4-T3 | Adds DLQ + replay to close failure loop from M4-T2. | Production readiness |
| 3 | M2-T2 | Completes auto-activation and fallback behavior for skill stack reliability. | Lower support load |
| 4 | M2-T3 | Improves fail-fast UX and remediation in onboarding/settings. | Better conversion |
| 5 | M5-T1 | Starts metering and entitlement enforcement groundwork. | M5-T2, M5-T3 |
| 6 | M6-T1 | Hardens webhook attack surface and malformed event handling. | Compliance posture |
| 7 | M8-T1 | Establishes dashboard design primitives for route-by-route rollout. | M8-T2 |
| 8 | M5-T2 | Enforces quota limits with clear user-facing responses. | Billing correctness |

---

## Milestone decomposition (epics and actionable tasks)

### M1 — Cuestionario único (G7)
**Epic objective:** Replace fragmented setup with one master questionnaire that derives and persists content strategy defaults.

| Task ID | Objective (concrete) | Dependencies | Owner role | Done criteria | Delegation-ready child task suggestion |
|---|---|---|---|---|---|
| M1-T1 | Implement a single master prompt step in `src/app/dashboard/onboarding/onboarding-wizard.tsx` that captures one free-text brief and derives `topics/tone/audience/platforms/postsPerDay`. | Existing onboarding org/key steps working; AI provider available from saved org key. | Full-stack Product Engineer | 1) Wizard has one "brief" step replacing separate strategy fields. 2) Derivation runs server-side and returns structured JSON with validation. 3) If AI derivation fails, deterministic fallback values are returned (no blocker). | **Agent brief:** "Implement questionnaire master-brief step and derived JSON contract in onboarding wizard + server action; include Zod validation and fallback path." |
| M1-T2 | Persist derived fields into default `ContentConfig` in `src/app/dashboard/onboarding/actions.ts` so automation/studio use consistent values immediately. | M1-T1 | Backend Engineer (TypeScript/Prisma) | 1) `ContentConfig` creation/update stores all derived fields. 2) Existing `saveAutomationSettings` reads same config without manual edits. 3) Migration-free (schema-compatible) implementation verified via `db:push` + onboarding run. | **Agent brief:** "Wire derived onboarding payload into `onboardingSaveContentConfig`, ensure no regression in `/dashboard/automation` defaults." |
| M1-T3 | Add activation telemetry: onboarding completion and time-to-first-content (audit + usage records) tied to org ID. | M1-T2 | Data/Platform Engineer | 1) Emits event at onboarding completion. 2) Emits event on first successful `content/slideshow.requested` completion. 3) Queryable by org/day from DB (`UsageRecord` and/or `AuditLog`). | **Agent brief:** "Add two activation metrics events with org-scoped timestamps and a SQL query snippet for weekly reporting." |

### M2 — Auto-armado de skills
**Epic objective:** Automatically provision and activate generation skills with safe defaults immediately after onboarding.

| Task ID | Objective (concrete) | Dependencies | Owner role | Done criteria | Delegation-ready child task suggestion |
|---|---|---|---|---|---|
| M2-T1 | Build onboarding post-completion hook that ensures required skill definitions are present/active (`slideshow-planner`, generation dependencies) using `src/skills/registry.ts` + DB records. | M1-T2 | Backend Engineer | 1) Org can run slideshow pipeline without manual skill setup. 2) Missing skill definitions are upserted safely. 3) Idempotent re-run does not duplicate records. | **Agent brief:** "Create idempotent skill bootstrap service called after onboarding completion; include unit-level guard tests if pattern exists." |
| M2-T2 | Add default skill profile assignment (voice/image/script defaults) into config path so generated content quality is predictable from day 1. | M2-T1 | AI/Content Systems Engineer | 1) New org has deterministic defaults for voice/image source/slide count. 2) Defaults visible in `/dashboard/automation` and `/dashboard/studio`. 3) Default source values align with existing enum/string constraints. | **Agent brief:** "Implement default skill profile map and connect it to content config creation/update with clear constants." |
| M2-T3 | Add explicit failure UX when skill bootstrap fails, including retry action and support-facing error details. | M2-T1 | Frontend Engineer | 1) Onboarding/dashboard shows actionable error state (not generic boundary). 2) Retry action triggers bootstrap again. 3) Failure logs include org ID + failure stage. | **Agent brief:** "Build onboarding error card + retry server action for skill bootstrap failures; include translated copy and structured logs." |

### M3 — Conectar Buffer guiado
**Epic objective:** Make Buffer connection deterministic with guided setup, key validation, and reliable channel sync feedback.

| Task ID | Objective (concrete) | Dependencies | Owner role | Done criteria | Delegation-ready child task suggestion |
|---|---|---|---|---|---|
| M3-T1 | Convert Buffer onboarding instructions into explicit checklist in `src/app/dashboard/onboarding/guides.ts` + onboarding UI, including preflight requirements and expected key format. | None | Product Engineer | 1) User sees ordered checklist before key submission. 2) Each step has success indicator and retry hint. 3) Copy references actual Buffer GraphQL setup path used by app. | **Agent brief:** "Implement guided Buffer checklist UI with step states and links; no backend change." |
| M3-T2 | Validate Buffer API key before persisting by calling provider account endpoint from server action (`onboardingSaveBuffer` or dedicated validator). | M3-T1 | Backend Integrations Engineer | 1) Invalid key is rejected with exact reason (401/network/schema). 2) Valid key saves encrypted token and account metadata. 3) No key is persisted when validation fails. | **Agent brief:** "Add pre-save Buffer token validation in onboarding action and return granular error codes/messages." |
| M3-T3 | Improve channel sync to show per-channel result state (created/updated/skipped/error) in Settings and Onboarding. | M3-T2 | Full-stack Product Engineer | 1) Sync response includes channel-level status list. 2) UI renders summary counts + retry option. 3) Failed sync attempts create auditable log entry with root cause. | **Agent brief:** "Refactor Buffer sync flow to expose per-channel statuses and render them in settings/onboarding UI." |

### M4 — Trigger robusto (autopiloto)
**Epic objective:** Make recurring autopilot safe and recoverable with idempotency, retries, and DLQ operations.

| Task ID | Objective (concrete) | Dependencies | Owner role | Done criteria | Delegation-ready child task suggestion |
|---|---|---|---|---|---|
| M4-T1 | Enforce idempotency key generation per `(contentConfigId, slotStart)` in `autopilotTick` and `slideshowPipelineV1` using `ContentJob.idempotencyKey`. | None | Backend Systems Engineer | 1) Duplicate cron ticks for same slot produce a single effective job. 2) Idempotency collisions are handled as safe no-op. 3) Key format documented in code comment and run logs. | **Agent brief:** "Implement deterministic slot keying and conflict-safe upsert/create for `ContentJob` in autopilot paths." |
| M4-T2 | Add retry/backoff policy for transient failures and increment `retryCount`, `maxRetries` semantics before marking failures terminal. | M4-T1 | Reliability Engineer | 1) Transient provider failures retry with backoff (bounded). 2) Final state transitions are consistent (`FAILED` or `DEAD_LETTER`). 3) Retry metadata visible in jobs page data source. | **Agent brief:** "Add retry wrapper utilities for pipeline steps and persist retry metadata on `ContentJob`." |
| M4-T3 | Implement DLQ workflow for dead-lettered jobs: list, inspect error, replay with guardrails from `/dashboard/jobs` or admin route. | M4-T2, M7-T2 | Full-stack Engineer | 1) Dead-letter jobs are queryable/filterable. 2) Replay action creates a new run with reference to original job ID. 3) Replay attempts are auditable and role-restricted (OWNER/ADMIN). | **Agent brief:** "Add DLQ filter and replay action for dead-letter jobs with audit logging and role check." |

### M5 — Negocio (planes, cuotas, billing)
**Epic objective:** Enforce product plans and monetize usage with clear entitlement and billing behavior.

| Task ID | Objective (concrete) | Dependencies | Owner role | Done criteria | Delegation-ready child task suggestion |
|---|---|---|---|---|---|
| M5-T1 | Define plan entitlements matrix and meter events (`render_minutes`, `posts_published`, `ai_generations`) via `UsageRecord` writes in pipeline/publish functions. | M4-T1 stable job IDs | Backend Engineer | 1) Every successful run writes metering records with org + metric + quantity. 2) Free/Starter/Pro limits are codified in one source file. 3) Metering is idempotent per job outcome. | **Agent brief:** "Implement usage metering hooks in Inngest functions and central plan entitlement constants." |
| M5-T2 | Enforce quota/rate limits with `@upstash/ratelimit` at generation and publish entry points. | M5-T1 | Platform Engineer | 1) Exceeding quota blocks request with actionable UI message. 2) Ratelimit decisions logged with org + metric. 3) Limits can be overridden by plan type without code changes. | **Agent brief:** "Add ratelimit guard service and integrate with slideshow/publish triggers + surfaced error messages." |
| M5-T3 | Build billing pages and Stripe lifecycle sync (checkout, portal, webhook updates) to keep `Organization.plan` current. | M5-T1 | Full-stack + Billing Engineer | 1) `/dashboard/settings` (or dedicated billing route) supports upgrade/manage flow. 2) Stripe webhook updates plan status reliably. 3) Downgrade/failed-payment edge states are visible to user. | **Agent brief:** "Implement Stripe checkout + portal + webhook reconciliation to `Organization.plan` with idempotent webhook handling." |

### M6 — Endurecimiento (seguridad y cumplimiento)
**Epic objective:** Reduce production/security risk through validation, least privilege, and lifecycle controls.

| Task ID | Objective (concrete) | Dependencies | Owner role | Done criteria | Delegation-ready child task suggestion |
|---|---|---|---|---|---|
| M6-T1 | Add strict webhook validation for inbound routes (`/api/webhooks/clerk`, `/api/webhooks/video-complete`, Stripe route when added) with replay protection. | None | Security-minded Backend Engineer | 1) Every webhook route verifies signature and timestamp window. 2) Invalid signature returns 401 and no side-effects. 3) Replay attempts are detected and logged. | **Agent brief:** "Implement shared webhook-verification utility and apply to all inbound webhook handlers." |
| M6-T2 | Implement org-level deletion workflow (owner-confirmed) that cascades data cleanup and key revocation while preserving audit trace. | M5-T1 preferred | Backend Engineer | 1) Owner can request deletion; operation is role-protected. 2) PII and org resources are removed/anonymized per policy. 3) Completion and failures are audited. | **Agent brief:** "Create org deletion service + confirmation flow and asynchronous cleanup job with audit entries." |
| M6-T3 | Complete RBAC enforcement in UI and server actions (hide write controls for VIEWER; guard admin nav/routes). | Existing `assertOrgRole` patterns | Frontend + Full-stack Engineer | 1) VIEWER cannot trigger writes from UI or direct action calls. 2) Sidebar/admin visibility respects role. 3) RBAC behavior verified on dashboard routes/actions. | **Agent brief:** "Audit and patch dashboard UI/action RBAC gaps, especially admin visibility and write controls for VIEWER." |

### M7 — Observabilidad
**Epic objective:** Provide clear runtime visibility, failure diagnosis, and proactive alerting.

| Task ID | Objective (concrete) | Dependencies | Owner role | Done criteria | Delegation-ready child task suggestion |
|---|---|---|---|---|---|
| M7-T1 | Extend `/api/health` (`src/app/api/health/route.ts`) to include Inngest connectivity, R2 readiness, Buffer provider probe, and Pexels key status. | None | Platform Engineer | 1) Health JSON includes `services.{inngest,r2,buffer,pexels}` with `ok/error` shape. 2) Endpoint remains safe (no secret leakage). 3) Non-healthy deps return 503 with actionable diagnostics. | **Agent brief:** "Expand health endpoint with service probes and structured response contract while masking secrets." |
| M7-T2 | Add job status detail surface in `/dashboard/jobs` and `/dashboard/content` with step, retries, timestamps, and failure reason. | M4-T2 | Full-stack Engineer | 1) User can inspect failing job and see exact failing stage. 2) Retry/dead-letter metadata appears in UI. 3) API/server actions fetch data with org scoping and pagination. | **Agent brief:** "Implement job detail drawer/page with retry/error timeline sourced from `ContentJob` + related entities." |
| M7-T3 | Configure failure alerts for repeated job errors (e.g., N failures/15m per org or global) with escalation channel. | M7-T2 | SRE/Platform Engineer | 1) Alert thresholds defined in code/config. 2) Alert fires on synthetic failure test. 3) Alert payload includes org/job IDs and dominant error category. | **Agent brief:** "Add repeated-failure detector and notifier integration (Slack/webhook) with testable threshold logic." |

### M8 — Rediseño dashboard (paridad con landing)
**Epic objective:** Bring landing visual quality to dashboard routes without hurting usability/performance.

| Task ID | Objective (concrete) | Dependencies | Owner role | Done criteria | Delegation-ready child task suggestion |
|---|---|---|---|---|---|
| M8-T1 | Create shared dashboard design primitives (glass cards, accent gradients, motion tokens) in `src/app/globals.css` + `src/components/ui/*`. | None | Design Systems Engineer | 1) Reusable primitives documented in component examples. 2) Supports `prefers-reduced-motion`. 3) No regression in color contrast/accessibility. | **Agent brief:** "Build reusable dashboard style primitives and refactor at least two existing components to prove adoption." |
| M8-T2 | Apply redesign to routes: `/dashboard`, `/dashboard/studio`, `/dashboard/automation`, `/dashboard/calendar` with consistent layout and CTA hierarchy. | M8-T1 | Frontend Product Engineer | 1) All listed routes follow shared visual language. 2) Existing interactions remain functional (forms/actions/navigation). 3) Screenshots before/after captured for each route in PR artifacts. | **Agent brief:** "Roll out new dashboard styling route-by-route while preserving current behavior and form actions." |
| M8-T3 | Add UX/perf acceptance gate for redesigned dashboard (reduced-motion compliance, interaction latency check, mobile breakpoint sanity). | M8-T2 | Frontend Engineer | 1) Reduced-motion path verified manually. 2) Key route interactions remain <200ms client transition under dev baseline. 3) Mobile layout (>=360px) keeps primary actions visible. | **Agent brief:** "Run and document UX/perf validation checklist for redesigned routes with concrete pass/fail evidence." |

---

## Cross-milestone dependency map (critical path)

1. **M7-T1 -> M4-T1 -> M4-T2 -> M4-T3** (make autopilot observable, then safe, then recoverable).
2. **M1-T1 -> M1-T2 -> M2-T1 -> M2-T2/M2-T3** (single onboarding input drives auto-skill setup and reliable defaults).
3. **M3-T2 -> M3-T3** (validate key before channel sync UX can be trusted).
4. **M5-T1 -> M5-T2 -> M5-T3** (meter first, enforce limits second, bill third).
5. **M8-T1 -> M8-T2 -> M8-T3** (tokens/components first, rollout second, validation third).

## Recommended immediate delegation packet (child-agent ready)

Start with these 6 child tasks in parallel where dependencies allow:

1. **Agent A (Platform):** M7-T1 health endpoint expansion.
2. **Agent B (Backend Systems):** M4-T1 idempotency `(config, slot)` and conflict-safe job creation.
3. **Agent C (Integrations):** M3-T2 Buffer key pre-validation with granular error handling.
4. **Agent D (Product Full-stack):** M3-T3 channel sync status UX + retry.
5. **Agent E (Onboarding):** M1-T1 master questionnaire + derivation contract.
6. **Agent F (Backend Product):** M1-T2 persistence wiring into default `ContentConfig`.

Each child task should ship with:
- touched-file list,
- migration/schema impact statement,
- evidence of behavior (terminal output and/or UI artifact),
- rollback note.
