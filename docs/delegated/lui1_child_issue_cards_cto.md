# LUI-1 — CTO Child Issue Cards (Execution Focus)

## Card 1
- Proposed title: M7-T1 Expand `/api/health` to dependency-aware readiness checks
- Department owner: CTO
- Objective: Eliminate silent failures by exposing actionable health for core runtime dependencies.
- Acceptance criteria:
  - Health JSON includes `services.inngest`, `services.r2`, `services.buffer`, and `services.pexels` with consistent `ok/error` shape.
  - Endpoint masks secrets and returns diagnostics without leaking credentials.
  - Endpoint returns `503` when a critical dependency is unhealthy; returns `200` only when healthy.
  - Curl smoke check verifies `ok: true` and `db.ok: true` plus service statuses in local dev.
- Blockers/dependencies: Environment keys and reachable service probes for Inngest/R2/Buffer/Pexels.
- Next action: Assign implementation of probe contract in `src/app/api/health/route.ts` and run local health smoke checks.
- Suggested priority: high

## Card 2
- Proposed title: M4-T1 Enforce autopilot idempotency by `(contentConfigId, slotStart)`
- Department owner: CTO
- Objective: Prevent duplicate job creation/publishing when recurring ticks overlap or retry.
- Acceptance criteria:
  - Idempotency key is deterministic per `(contentConfigId, slotStart)` across autopilot and pipeline entrypoints.
  - `ContentJob` creation handles key collisions as safe no-op behavior, not failures.
  - Duplicate ticks for the same slot result in one effective downstream job execution.
  - Logs include idempotency key and conflict outcome for debugging.
- Blockers/dependencies: Alignment across `autopilotTick` and slideshow pipeline job creation paths.
- Next action: Implement deterministic key generation and conflict-safe persistence on job create paths.
- Suggested priority: high

## Card 3
- Proposed title: M3-T2 Add pre-save Buffer API key validation in onboarding
- Department owner: CTO
- Objective: Reduce activation drop-off by rejecting invalid Buffer credentials before persistence.
- Acceptance criteria:
  - Onboarding validates Buffer key against provider account endpoint before saving.
  - Validation failures return explicit reason classes (auth, network, schema/provider error).
  - Valid keys are stored encrypted with account metadata; invalid keys are never persisted.
  - Failure state is returned in a UI-ready structure for immediate user remediation.
- Blockers/dependencies: Buffer provider availability and encryption key configuration.
- Next action: Add a Buffer validation service and call it from onboarding Buffer save action.
- Suggested priority: high

## Card 4
- Proposed title: M3-T3 Ship channel-level Buffer sync status + retry flow
- Department owner: CTO
- Objective: Make Buffer connection completion deterministic with explicit per-channel outcomes.
- Acceptance criteria:
  - Sync response includes channel-level statuses (`created`, `updated`, `skipped`, `error`).
  - Onboarding/settings UI shows aggregate counts and detailed failed channel reasons.
  - Retry action re-attempts only failed channels and updates status deterministically.
  - Sync failures create auditable entries with org ID and root-cause category.
- Blockers/dependencies: Depends on M3-T2 validation and current channel sync response refactor.
- Next action: Define response schema and wire status rendering + retry action in onboarding/settings surfaces.
- Suggested priority: high

## Card 5
- Proposed title: M1-T1 Implement single-brief onboarding questionnaire with derived strategy fields
- Department owner: CTO
- Objective: Improve activation by replacing fragmented onboarding inputs with one guided brief + structured derivation.
- Acceptance criteria:
  - Onboarding captures one master brief and submits to server derivation action.
  - Derivation returns validated `topics`, `tone`, `audience`, `platforms`, and `postsPerDay`.
  - On derivation failure, deterministic fallback defaults are returned so onboarding can continue.
  - Completion event logging supports onboarding completion and time-to-first-content tracking.
- Blockers/dependencies: Derivation contract validation and provider availability for AI-backed parsing.
- Next action: Implement wizard brief step, server derivation contract, and fallback constants.
- Suggested priority: high

## Card 6
- Proposed title: M1-T2 Persist derived onboarding outputs into default `ContentConfig`
- Department owner: CTO
- Objective: Ensure automation/studio start with immediately usable defaults from onboarding.
- Acceptance criteria:
  - Onboarding save action persists all derived strategy fields to default `ContentConfig`.
  - `/dashboard/automation` and `/dashboard/studio` read the same persisted defaults without manual edits.
  - Save path is idempotent per org and does not create duplicate default configs.
  - Local DB smoke run confirms schema-compatible behavior during onboarding flow.
- Blockers/dependencies: Depends on M1-T1 derivation payload and existing config read/write contract.
- Next action: Wire derived payload into onboarding config save path and run onboarding + dashboard sanity checks.
- Suggested priority: high
