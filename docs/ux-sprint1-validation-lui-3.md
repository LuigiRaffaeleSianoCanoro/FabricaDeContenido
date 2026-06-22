# LUI-3 — Sprint 1 UX research + validation package (onboarding conversion)

Date: 2026-06-22  
Owner: UXDesigner (direct report, delegation LUI-3)  
Sprint window: Week 1-2  
Primary objective: de-risk conversion from onboarding start to first scheduled post.

## Scope and product-flow mapping (repo)

This Sprint 1 package validates the current implemented path:

1. `/dashboard/onboarding`
   - Step 1: `onboardingCreateOrg`
   - Step 2: `onboardingSaveAiKey`
   - Step 3: `onboardingSaveBuffer`
   - Step 4: `onboardingSaveContentConfig`
2. `/dashboard/settings`
   - Buffer channel sync: `syncBufferChannelsAction`
3. `/dashboard/studio`
   - Slideshow request: `requestSlideshowRender`
4. `/dashboard/content`
   - Approve: `approveGeneratedContent`
   - Publish/schedule: `publishGeneratedContent`
5. `/dashboard/automation`
   - Save automation: `saveAutomationSettings`
   - Trigger now: `runAutopilotNow`

---

## 1) Top 3 hypotheses to validate in week 1-2

### H1 — “Onboarding completion does not equal publish readiness”
- Hypothesis: users who finish `/dashboard/onboarding` still fail to schedule their first post because they miss channel sync in `/dashboard/settings`.
- Why this matters: false completion hurts trial confidence and conversion.
- Success signal (week 1-2): at least 70% of interviewed participants complete onboarding + channel sync without moderator intervention.
- Failure signal: more than 30% complete onboarding but cannot schedule due to missing channels.

### H2 — “Buffer step is the highest-friction conversion bottleneck”
- Hypothesis: Step 3 (`onboardingSaveBuffer`) creates the largest drop-off due to token confusion and unclear next action.
- Why this matters: this is the last technical blocker before value.
- Success signal: median time for Step 3 is <= 4 minutes and >= 80% complete in one attempt.
- Failure signal: > 20% abandon at Step 3, or median time > 4 minutes.

### H3 — “First value must be ‘approve + schedule’ in content queue, not generic generation”
- Hypothesis: users perceive value only after they move one item from `PENDING_APPROVAL`/`APPROVED` to `SCHEDULED` in `/dashboard/content`.
- Why this matters: this directly supports Activation D14 and TTFSP.
- Success signal: >= 85% complete “approve + schedule” without critical error; <= 2 minutes median from arriving on Content page to schedule request.
- Failure signal: < 85% task success or repeated blocked attempts from missing prerequisites.

---

## 2) Usability script (tasks + moderator prompts)

Session format: 45 min moderated remote, think-aloud protocol.  
Participants in Sprint 1: 8 total (6 agency profiles, 2 SMB lean marketing), split across Week 1 and Week 2.

### Moderator intro (3 min)
- “Please narrate what you expect to happen before each click.”
- “There are no wrong answers; we are testing the product, not you.”
- “If you get blocked, continue describing what you would do next.”

### Task 1 — Complete onboarding (10 min)
Goal: complete all 4 steps in `/dashboard/onboarding`.
- Prompt A: “Create your workspace and connect your AI provider.”
- Prompt B: “Now connect Buffer and finish agent setup.”
- Observe:
  - hesitation on provider selection and key entry,
  - comprehension of “Buffer is required,”
  - confidence after finishing step 4.

### Task 2 — Make channels publish-ready (7 min)
Goal: sync at least 1 Buffer channel from `/dashboard/settings`.
- Prompt: “Assume you are ready to publish. Show me how you ensure your channels are connected.”
- Observe:
  - whether participant discovers Settings path quickly,
  - ability to execute “Sincronizar canales de Buffer,”
  - recognition of success state (channel listed).

### Task 3 — Generate and schedule first content (12 min)
Goal: request slideshow and schedule one approved item.
- Prompt A: “Generate one new slideshow from Studio.”
- Prompt B: “Go to Content, approve it, and schedule it for later.”
- Observe:
  - route-finding from dashboard to Studio to Content,
  - understanding of statuses (`PENDING_APPROVAL`, `APPROVED`, `SCHEDULED`),
  - recovery behavior if blocked.

### Task 4 — Activate autopilot safely (8 min)
Goal: configure minimum viable automation in `/dashboard/automation`.
- Prompt: “Set autopilot so content can run automatically, but keep review safety on.”
- Required completion:
  - `isAutopilotActive` enabled,
  - schedule entered,
  - `requireApproval` remains enabled.
- Observe:
  - understanding of `autoPost` vs `requireApproval`,
  - confidence reading “Próxima ejecución.”

### Debrief prompts (5 min)
- “What felt most risky to trust before going live?”
- “What almost made you stop?”
- “What one UI change would make this onboarding feel simpler?”
- SUS-lite question (1-5): “I feel confident I can get to first scheduled post without support.”

---

## 3) Scoring rubric and pass/fail thresholds

### Per-task scoring
- 2 = completed without help
- 1 = completed with 1 moderator hint
- 0 = failed or needed multiple interventions

### Critical tasks
1. Onboarding 4 steps complete
2. Buffer channels synced
3. Approve + schedule one content item
4. Activate autopilot with safe settings

### Pass/fail thresholds (Sprint 1 gate)
- Task success:
  - Critical Task 1 >= 80% score 2
  - Critical Task 2 >= 70% score 2
  - Critical Task 3 >= 85% score 2
  - Critical Task 4 >= 70% score 2
- Time thresholds:
  - Onboarding total median <= 12 min
  - Step 3 (Buffer step) median <= 4 min
  - Content approve->schedule median <= 2 min
- Error thresholds:
  - “No channels synced” blocker appears in <= 20% of sessions by end of Task 3
  - No more than 1 critical blocker per participant across full session

Decision rule:
- PASS: all critical task and time thresholds met.
- CONDITIONAL PASS: one threshold missed by <= 10%, with clear quick fix.
- FAIL: two or more thresholds missed, or any critical task below 60% score 2.

---

## 4) Quick-win UX changes shippable after first 5 interviews

Ship only low-effort, high-impact changes (no architecture rewrite):

1. Onboarding Step 3 completion guidance
   - Add inline post-submit success banner on Buffer step:
     - “Next required step: sync channels in Settings.”
   - Add direct CTA link to `/dashboard/settings`.

2. Dashboard hierarchy fix
   - De-emphasize “Generar hooks rápidos” card.
   - Promote primary CTA to `/dashboard/studio` and checklist completion sequence (`Settings -> Studio -> Content -> Automation`).

3. Content-page contextual blocker guidance
   - When `publishGeneratedContent` fails due to zero channels, show actionable inline message with one-click link to `/dashboard/settings`.

4. Status helper microcopy in `/dashboard/content`
   - `PENDING_APPROVAL`: “Approve to unlock scheduling.”
   - `APPROVED` with no channels: “Sync Buffer channels to publish.”
   - `SCHEDULED`: “View in Calendar.”

5. Automation defaults guardrail
   - Keep `requireApproval` pre-checked and explain tradeoff near `autoPost`.
   - Add helper text: “Recommended for first week: approval ON + autopilot ON.”

---

## 5) Required telemetry events and naming

Telemetry naming convention for Sprint 1:
- `ux.onboarding.*` for setup funnel
- `ux.content.*` for review/scheduling
- `ux.automation.*` for autopilot activation
- snake_case properties, dot.case event names

### Event list (must-have)

1. `ux.onboarding.step_completed`
- Trigger: successful return from each onboarding action.
- Map:
  - `onboardingCreateOrg` -> `step="workspace"`
  - `onboardingSaveAiKey` -> `step="ai_key"`
  - `onboardingSaveBuffer` -> `step="buffer_key"`
  - `onboardingSaveContentConfig` -> `step="agent_config"`
- Properties:
  - `organization_id`, `user_id`, `step`, `step_index`, `provider` (if applicable), `duration_ms`

2. `ux.onboarding.step_failed`
- Trigger: validation or server failure in onboarding actions.
- Properties:
  - `organization_id`, `user_id`, `step`, `error_code`, `error_message_normalized`

3. `ux.buffer.channels_sync_clicked`
- Trigger: click on `syncBufferChannelsAction`.
- Properties:
  - `organization_id`, `has_buffer_key`, `source_screen`

4. `ux.buffer.channels_sync_succeeded`
- Trigger: successful channel sync response.
- Properties:
  - `organization_id`, `synced_count`, `duration_ms`

5. `ux.content.approval_submitted`
- Trigger: submit `approveGeneratedContent`.
- Properties:
  - `organization_id`, `generated_content_id`, `previous_status`

6. `ux.content.publish_submitted`
- Trigger: submit `publishGeneratedContent`.
- Properties:
  - `organization_id`, `generated_content_id`, `publish_now`, `has_synced_channels`

7. `ux.content.publish_blocked`
- Trigger: blocked publish path (for example zero channels).
- Properties:
  - `organization_id`, `generated_content_id`, `blocker_type` (`no_buffer_channels`), `source_screen`

8. `ux.content.first_scheduled_reached`
- Trigger: first transition to `SCHEDULED` for org.
- Properties:
  - `organization_id`, `days_since_signup`, `minutes_since_onboarding_start`

9. `ux.automation.saved`
- Trigger: submit `saveAutomationSettings`.
- Properties:
  - `organization_id`, `is_autopilot_active`, `require_approval`, `auto_post`, `schedule_slots`

10. `ux.automation.run_now_clicked`
- Trigger: submit `runAutopilotNow`.
- Properties:
  - `organization_id`, `is_autopilot_active`, `source_screen`

### Minimum dashboard cuts for week 2 decision
- Funnel: onboarding step completion rates.
- TTFSP: median + P75 from onboarding start to `ux.content.first_scheduled_reached`.
- Blockers: count of `ux.content.publish_blocked` by blocker_type.

---

## 6) Escalation criteria to CEO if hypotheses fail

Escalate within 24 hours to CEO + CTO + CMO if any of the following occur in Sprint 1:

1. Hypothesis-level failure
- Any 2 of H1/H2/H3 fail based on the thresholds above.

2. Conversion risk failure
- Fewer than 50% of participants can reach first scheduled post in-session.

3. Technical-UX mismatch
- More than 30% of sessions are blocked by missing channel sync or unclear prerequisites after completing onboarding.

4. Trust failure (autopilot confidence)
- More than 40% of participants report low confidence (<= 2/5) in understanding what is automatic vs manual.

5. Instrumentation gap
- Required events are not available by end of Week 1, preventing week-2 decision making.

### Escalation packet format (single page)
- Failed hypothesis + metric miss
- Session evidence (clip timestamp + quote)
- User impact on trial conversion
- Proposed fix path:
  - Fast patch in < 3 days
  - Deeper fix in next sprint
- Owner and deadline for each fix (UX/CTO/CMO)

