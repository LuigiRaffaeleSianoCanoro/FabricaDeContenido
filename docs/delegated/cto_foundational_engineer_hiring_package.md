# LUI-1 Technical Hiring Package — Foundational Engineer (CTO Delegate)

## 1) Role scorecard (must-have competencies)

Scoring scale for all competencies:
- **4 = Exceeds bar** (can lead and teach)
- **3 = Meets bar** (can independently own in this environment)
- **2 = Below bar** (can contribute with heavy support)
- **1 = No signal / miss**

| Competency | What "meets bar" looks like in this company | Roadmap and gap linkage (must-own outcomes) |
|---|---|---|
| 1. Ambiguous product execution | Translates a fuzzy product goal into a shippable scope, ships end-to-end in weekly increments, and closes feedback loops without waiting for perfect specs. | **M1, M2, M3, M8**; closes **G7** (prompt-first onboarding), supports **G9** (preview UX), resolves dead-ends like **D1-D4** through better product flow decisions. |
| 2. Workflow reliability and distributed systems judgment | Designs idempotent background workflows, failure handling, retries, and visibility for async jobs (not just happy path). | **M4, M7**; closes **D5, D18, D19** (silent failures, missing health visibility, idempotency). |
| 3. External API and integration ownership | Can safely own third-party API integrations (Buffer/Editframe/AI providers), including error handling, state reconciliation, and operator-friendly diagnostics. | **M3, M4, M7**; closes **D9, D10** (channel targeting and published status reconciliation). |
| 4. Commercial and platform guardrails | Ships usage limits, plans, and security/compliance controls that keep the product usable and billable in production. | **M5, M6**; closes **G8**, **D11, D12, D13, D16** (billing, members/RBAC, deletion flows). |
| 5. Full-stack product quality (UI + backend) | Delivers production-grade UX and backend behavior together; does not hand-wave polish, accessibility, or operational details. | **M8** plus cross-cutting UX quality in **M1-M4**; closes **D14, D15** and supports dashboard parity from landing to product surface. |
| 6. Ownership, communication, and operating cadence | Communicates tradeoffs clearly, raises risks early, writes decision docs, and keeps CEO/CTO informed with objective delivery status. | Required across **M1-M8**; critical to run parallel lanes (activation, reliability, business model, redesign) with predictable weekly throughput. |

### Scorecard weighting for hiring decision
- Competencies **1, 2, and 6 are non-negotiable** (hard fail if any scores below 3).
- Competencies **3, 4, and 5** must average at least 3 by final debrief.
- Final hiring recommendation requires demonstrated ability to deliver **M1/M2/M4** without heavy supervision.

---

## 2) Job description (execution-oriented draft)

### Role
**Foundational Full-Stack Engineer (first engineering hire reporting to CTO).**

### Mission
Help turn the current working engine into a reliable, self-serve product where a new user can go from signup to recurring auto-published content without manual intervention.

### What you will own
- Ship activation and onboarding milestones: **M1-M3**.
- Harden autopilot and production behavior: **M4 + M7**.
- Build business and security guardrails: **M5 + M6**.
- Raise dashboard UX to landing-level quality: **M8**.
- Operate directly on the existing stack (Next.js 16, TypeScript, Prisma/Postgres, Inngest, Buffer/Editframe/AI integrations).

### What success looks like
- In first quarter, independently ships roadmap slices with measurable outcomes (activation, reliability, observability).
- Reduces time from idea -> production merge by converting fuzzy requirements into scoped increments.
- Prevents silent failures by introducing operational visibility and explicit failure handling.

### Required profile
- 5+ years building and shipping full-stack product features in startup-like environments.
- Strong TypeScript and React/Next.js backend/frontend ownership.
- Practical experience with async workflows, retries/backoff, idempotency, and external API integration.
- Can write clear technical proposals, acceptance criteria, and postmortems.

### Nice-to-have
- Prior Stripe billing implementation.
- Experience with role/permission systems and org-level data lifecycle controls.
- Experience in content/media pipelines.

---

## 3) Interview loop and stage rubrics

## Interview design principles
- Every stage must map to at least one milestone from **M1-M8**.
- We only hire candidates who demonstrate they can ship in ambiguity, not just solve isolated coding puzzles.
- Final decision is evidence-based against the scorecard (not "gut feel").

| Stage | Duration | Interviewer(s) | What we test | Pass bar |
|---|---:|---|---|---|
| 1. Recruiter/CTO intro screen | 30 min | CTO | Career context, ownership examples, startup pace fit, communication quality. | Must show credible ownership of shipped outcomes (not only task execution). |
| 2. Technical deep-dive (systems + architecture) | 60 min | CTO | Design exercise: harden autopilot for idempotency, retries, and observability (M4/M7, D5/D18/D19). | Score >=3 in competencies 2 and 6. |
| 3. Practical coding exercise (live or take-home + review) | 90-150 min | Senior engineer/CTO | Build an incremental feature slice (example: M1 questionnaire derivation + clear error states, or M3 validation flow). | Code quality, pragmatic scoping, and tradeoff clarity all >=3. |
| 4. Product execution simulation | 60 min | CTO + CEO | Convert a milestone (for example M5 or M8) into 2-week execution plan with risks, dependencies, and acceptance criteria. | Competency 1 and 6 must both be >=3. |
| 5. Values and founder collaboration | 45 min | CEO | Accountability, urgency, integrity, and ability to disagree constructively. | No red flags in ownership/accountability behaviors. |

### Stage rubric details (what "good" looks like)

1. **Ambiguous execution (M1/M2/M3/M8)**  
   - Good: proposes tight scope, measurable outcomes, and explicit "not now" boundaries.
   - Fail signal: jumps to implementation without validating problem framing.

2. **Reliability (M4/M7)**  
   - Good: includes idempotency key strategy, retry/backoff policy, DLQ behavior, and instrumentation.
   - Fail signal: only happy-path flow, no operator visibility.

3. **Integration rigor (M3/M4)**  
   - Good: plans API error classification, reconciliation logic, and actionable user-facing errors.
   - Fail signal: assumes third-party APIs are deterministic and always available.

4. **Commercial/security judgment (M5/M6)**  
   - Good: discusses quotas, abuse controls, RBAC constraints, and auditability.
   - Fail signal: treats billing/security as "later" with no sequencing.

5. **Communication/cadence (all milestones)**  
   - Good: writes concise plan with owners, dates, dependencies, and done criteria.
   - Fail signal: status is vague; risks are discovered too late.

### Final debrief decision rule
- **Hire**: non-negotiables (1,2,6) all >=3, overall average >=3.2, and no critical red flags.
- **No hire**: any non-negotiable below 3, or repeated inability to tie decisions to execution outcomes.

---

## 4) 30/60/90-day plan (first engineer)

### First 30 days — Activate and de-risk core path
- Own codebase onboarding, local/prod runbooks, and current pipeline constraints.
- Ship production-ready increments for **M1** (single questionnaire path) and close major onboarding ambiguity in **G7**.
- Deliver baseline service visibility for **D5/D18** (surface failure states, health checks, and operator-readable errors).

**30-day exit criteria**
- New user activation flow from onboarding to first generated content is measurable.
- At least one reliability/health dashboard surface is live and used in daily ops.
- Weekly delivery cadence established (planning + demo + retrospective).

### Days 31-60 — Integrations and autopilot hardening
- Complete **M2** auto-skill provisioning with fallback defaults and failure messaging.
- Strengthen **M3** guided Buffer flow (validation UX and sync confidence).
- Implement first tranche of **M4** hardening: idempotency by `(config, slot)` and retry/backoff policy.
- Address integration gaps **D9/D10** (channel selection and status reconciliation design/implementation plan).

**60-day exit criteria**
- Onboarding -> skill provisioning -> Buffer connection path is self-serve for a new tenant.
- Autopilot can recover from transient failures without manual intervention in common scenarios.
- Integration failures are observable and actionable.

### Days 61-90 — Production readiness and scale foundations
- Ship **M7** observability baseline (job-level status, core alerts, and operational triage process).
- Lead sequence for **M5/M6** implementation (plans/usage limits/security checklist) with CTO sign-off.
- Deliver first visible tranche of **M8** dashboard redesign on highest-traffic routes.
- Publish quarter roadmap proposal for next milestones, explicitly addressing remaining gaps (**G8, G9, D11-D17**).

**90-day exit criteria**
- Autopilot reliability and observability are no longer blind spots.
- Business guardrails are on track with agreed implementation sequence.
- Product surface shows clear UX consistency improvements beyond landing page.

---

## 5) CEO acceptance criteria and immediate next actions

### Acceptance criteria for approving this hiring package
1. Role scorecard includes **6 competencies** with explicit pass/fail thresholds.
2. Each competency is mapped to concrete roadmap outcomes from **M1-M8** and known gaps (G/D items).
3. Job description is execution-first (mission, ownership scope, required profile, and expected outcomes).
4. Interview loop has stage-by-stage rubrics, interviewer ownership, and hard hiring bar.
5. 30/60/90 plan is milestone-linked and measurable.
6. Package is ready to use immediately for sourcing and interviewer calibration.

### Immediate next actions (for CEO approval and kickoff)
| Action | Owner | Deadline | Output |
|---|---|---|---|
| Approve role scope, non-negotiables, and compensation band | CEO + CTO | Within 2 business days | Signed hiring brief for outreach |
| Finalize interview kit (question bank, scorecard template, take-home prompt) | CTO | Within 3 business days after approval | Interviewer-ready packet |
| Launch sourcing across predefined channels (from D3) | CMO | Within 1 business day after brief sign-off | Candidate pipeline opened |
| Run 2-3 calibration interviews and tighten rubric wording | CTO + CEO | First 2 weeks of funnel | Updated rubric with reduced false positives |
| Weekly hiring review (funnel health + quality bar adherence) | CEO + CTO + CMO | Weekly | Decision log and hiring velocity report |

If approved, this package can be used immediately as the operating template for subtask **D1** under **LUI-1**.
