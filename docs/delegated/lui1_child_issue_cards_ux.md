# LUI-1 — UXDesigner Child Issue Cards (Dashboard Redesign + Onboarding Clarity)

## Card 1
- **Proposed title:** M1 UX — Single-brief onboarding flow with derived strategy confirmation
- **Department owner:** UXDesigner
- **Objective:** Redesign onboarding into one clear "master brief" experience that reduces cognitive load and confirms derived strategy fields (`topics`, `tone`, `audience`, `platforms`, `postsPerDay`) before handoff to automation defaults.
- **Acceptance criteria:**
  - Deliver a step-by-step UX spec (low/high fidelity) for a single-brief onboarding path, including loading, success, and fallback/error states for derivation.
  - Include explicit copy and helper text that explain what is auto-derived vs user-editable, with a clear confirmation step before save.
  - Provide an interaction contract for engineering (field map, validation rules, and state transitions) compatible with M1-T1/M1-T2 payload expectations.
  - Include a "time-to-first-content" fast path CTA after completion that points users directly to the next dashboard action.
- **Blockers/dependencies:** Depends on M1-T1 JSON contract and M1-T2 persistence wiring; requires PM-approved copy direction and backend error code list for derivation failures.
- **Next action:** Produce annotated onboarding flow + state matrix and review with Engineering lead for implementation sequencing in `onboarding-wizard` and server action responses.
- **Suggested priority:** high

## Card 2
- **Proposed title:** M8 UX — Dashboard design primitives and motion/accessibility guidelines
- **Department owner:** UXDesigner
- **Objective:** Define reusable dashboard visual primitives (glass surfaces, gradient accents, spacing, motion tokens) so engineering can implement M8-T1 consistently across routes without accessibility regressions.
- **Acceptance criteria:**
  - Publish a compact design spec for component primitives (cards, section headers, CTA treatments, status chips) with usage rules and anti-patterns.
  - Provide token-level guidance for color, elevation, border, and motion timing, including reduced-motion alternatives for all animated patterns.
  - Include accessibility constraints (contrast targets, focus visibility, readability on dark backgrounds) that engineering can verify route by route.
  - Map each primitive to likely implementation touchpoints (`globals.css`, shared UI components) to reduce translation ambiguity for frontend engineers.
- **Blockers/dependencies:** Depends on visual parity goals from M8-T1 and existing dashboard component inventory; needs agreement with frontend owner on token naming and rollout strategy.
- **Next action:** Deliver the primitives pack (Figma + implementation notes) and run a 30-minute handoff with frontend engineering to lock token naming and component ownership.
- **Suggested priority:** high

## Card 3
- **Proposed title:** M8/M1 UX — Dashboard information architecture and "next best action" onboarding bridge
- **Department owner:** UXDesigner
- **Objective:** Clarify post-onboarding dashboard navigation and CTA hierarchy so new users always see an actionable next step (connect Buffer, create content, activate autopilot) within the redesigned dashboard.
- **Acceptance criteria:**
  - Deliver updated IA and page-level wireframes for `/dashboard`, `/dashboard/studio`, `/dashboard/automation`, and `/dashboard/calendar` with consistent CTA placement.
  - Define a "Next best action" ruleset for key user states (new org, partial setup, ready to autopilot, blocked by dependency) with exact UI copy and status messaging.
  - Provide responsive layout guidance (desktop + mobile baseline) ensuring primary actions remain visible and unambiguous.
  - Include an implementation handoff checklist tying each CTA/state to route-level components so engineering can execute M8-T2 without breaking current flows.
- **Blockers/dependencies:** Depends on Card 1 completion for onboarding exit states, Card 2 primitives for visual consistency, and service-health visibility direction from M7 to avoid silent dead-ends.
- **Next action:** Finalize IA + CTA hierarchy spec, then align with engineering on phased rollout order and feature-flag plan for route-by-route adoption.
- **Suggested priority:** medium
