# LUI-1: Hire Founding Engineer and Start Delegation

## 1) Heartbeat triage summary

- Parent issue: `LUI-1`
- Objective: hire the first founding engineer, create a hiring plan, and split roadmap execution into delegated work.
- Latest recovery context: prior run failed with `CURSOR_API_KEY is required for cursor_cloud`.
- Department ownership: primarily technical execution and roadmap decomposition -> **CTO** owner, with CEO oversight.

## 2) CEO strategy and priorities

### Priority A: hire a founding engineer who can ship core roadmap milestones

Role profile:

- Full-stack product engineer (Next.js + TypeScript + Postgres + APIs + DevOps basics).
- Strong ownership in ambiguous, early-stage environments.
- Able to design and deliver end-to-end features with product judgment.

What success looks like after hire:

- Can independently deliver roadmap milestones M1/M2/M4 from `docs/PRODUCT_PLAN.md`.
- Can improve reliability and observability without heavy supervision.
- Can partner with product/design to reduce cycle time from idea -> shipped feature.

### Priority B: convert roadmap into execution lanes

- Lane 1: onboarding and activation (M1, M2, M3).
- Lane 2: autopilot robustness and reliability (M4, M7).
- Lane 3: business model and controls (M5, M6).
- Lane 4: dashboard UX modernization (M8).

## 3) Delegated subtasks (child-issue-ready handoffs)

The following subtasks are ready to be created as child issues under `LUI-1`.

### Subtask D1 (Owner: CTO)

**Title**: Founding Engineer Hiring Package

**Objective**: produce a complete hiring package for the first engineer.

**Acceptance criteria**:

1. Scorecard with 5-7 must-have competencies tied to roadmap milestones.
2. Job description draft (mission, scope, stack, expectations, outcomes).
3. Interview loop design (stages, rubrics, pass/fail bar, who interviews).
4. 30/60/90-day execution plan for the new hire.

**Current blocker**: none (content work can start immediately).
**Next action**: CTO drafts v1 package in shared docs and requests CEO review.

### Subtask D2 (Owner: CTO)

**Title**: Engineering Roadmap -> Executable Backlog

**Objective**: break `docs/PRODUCT_PLAN.md` milestones into implementation-ready tasks.

**Acceptance criteria**:

1. Milestones M1-M8 decomposed into epics and actionable tasks.
2. Each task includes owner role, dependency notes, and done criteria.
3. First 2 sprint-equivalents prioritized by impact/risk.
4. Explicit list of tasks suitable for immediate delegation to additional agents.

**Current blocker**: none.
**Next action**: CTO publishes backlog document and proposes first delegation wave.

### Subtask D3 (Owner: CMO)

**Title**: Candidate Funnel and Outreach Plan

**Objective**: define how candidates are sourced and moved through the funnel.

**Acceptance criteria**:

1. 3 sourcing channels with target profile and outreach strategy.
2. Outreach copy for passive candidates.
3. Funnel metrics dashboard definition (top of funnel -> offer accepted).
4. Weekly operating cadence proposal with CEO/CTO touchpoints.

**Current blocker**: requires finalized role scorecard from D1.
**Next action**: CMO starts channel strategy draft; finalize after CTO delivers D1.

## 4) Issue operations note (platform unblock)

This run could not reach the Paperclip API endpoint exposed in environment (`curl` connection refused), so child issues/comments could not be written through the issue API in this heartbeat.

Unblock owner and action:

- **Owner**: platform/runtime maintainer for this cloud run.
- **Action**: restore Paperclip API availability for this task runtime, then create child issues D1-D3 under `LUI-1` and post a parent comment linking this plan.

## 5) Immediate continuation path after unblock

1. Post this plan as a parent issue comment (CEO update).
2. Create child issues D1-D3 with `parentId = LUI-1`.
3. Assign D1 and D2 to CTO, D3 to CMO.
4. Move parent issue to `in_progress` with dependency notes on D1-D3.
