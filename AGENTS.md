<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Content creation (Fábrica de Contenido)

For video, reels, social copy, and editorial workflows, read **[`PROJECT_CONTENT_RULES.md`](PROJECT_CONTENT_RULES.md)** first (project-specific policy and demo-content rules). Then use the **[Content creation skills pack](#content-creation-skills-pack)** section below and the matching `.agents/skills/<name>/SKILL.md`. Antigravity/Gemini users can start from [`GEMINI.md`](GEMINI.md).

## Cursor Cloud specific instructions

Single-package Next.js 16 app (`npm`). Standard commands are in `package.json` and `README.md`.

### Local Postgres (Cloud VM)

Docker is not preinstalled. To run Postgres locally:

1. Start the daemon if needed: `sudo dockerd > /tmp/dockerd.log 2>&1 &` (use `sudo docker` for compose commands).
2. `sudo docker compose -f docker/docker-compose.yml up -d` (Postgres on `localhost:5432`, user/password/db: `postgres`/`postgres`/`fabrica`).
3. Copy `.env.example` → `.env`, set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fabrica`, generate `ENCRYPTION_MASTER_KEY` (64 hex), and `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
4. `npm run db:push` (or `npm run db:migrate`) and `npm run db:seed`.

### Clerk keys

- **Invalid or placeholder Clerk keys** (`pk_test_xxx`) cause middleware/runtime errors on every route. Omit `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` entirely for DB-only / public-route dev; `/api/health` and `/` work without Clerk.
- **Real Clerk test keys** are required for sign-in, `/dashboard`, and full UI flows.

### Running the app

- Dev server: `npm run dev` (port 3000). Use a tmux session for long-running processes.
- Quick sanity check: `curl -s http://localhost:3000/api/health` → `ok: true` and `db.ok: true`.
- Lint / build: `npm run lint`, `npm run build` (needs required env vars in `.env`; placeholders are fine for build per README).
- Tests: `npm test` (Vitest unit/integration), `npm run test:e2e` (Playwright). Ver `tests/README.md` y `.cursor/README.md`.

### Optional services

Inngest, R2, and tenant BYOK keys (Editframe, Buffer, OpenAI) are only needed for slideshow render / publish E2E; see `README.md` and `.env.example`.

### Agent skills & rules

- **Rules**: `.cursor/rules/` — convenciones modulares (Next.js, Prisma, testing, Linear, seguridad).
- **Skills del proyecto**: `.cursor/skills/` — Linear MCP, desarrollo, testing.
- **Skills de comunidad**: `.agents/skills/` — vitest, playwright, prisma, vercel-react-best-practices (instalados vía `npx skills add`).
- **Content creation (Luigi Canoro pack)**: `.agents/skills/*` (23 editorial skills), `docs/ffmpeg-cookbook.md`, `tools/` — ver **Content creation skills pack** más abajo y `PROJECT_CONTENT_RULES.md`.
- **Documentación**: `.cursor/README.md`

## Content creation skills pack

Portable, tool-agnostic rules and skills for creating content — especially **video editing** (reels, shorts, vlog episodes, talk clips), plus copy, social posts, thumbnails and decks. Works with Antigravity/Gemini, Cursor, Claude Code, or a human editor. **Project-specific rules for this repo:** [`PROJECT_CONTENT_RULES.md`](PROJECT_CONTENT_RULES.md) (read first; hard rules in this section still win on conflict).

### How to use

1. **Read the HARD RULES below.** They override anything else, including a skill.
2. Read the repo's `PROJECT_CONTENT_RULES.md` for project-specific brand, accounts, assets and voice. If it conflicts with this file, the hard rules win; otherwise the project file is more specific and wins.
3. Pick the skill(s) from the index and open `.agents/skills/<name>/SKILL.md`. Video work always combines `reel-production-complete-edit` + `video-review-package` + the specific editorial skill.
4. Edit locally with ffmpeg + Whisper + Python (`docs/ffmpeg-cookbook.md`, tested recipes) or DaVinci Resolve. Helper scripts in `tools/`.
5. Before showing anything to Luigi: `docs/qa-checklist.md` (full video QA + text anti-LLM-tropes QA), `bash tools/preflight_deliver.sh OUT.mp4 1080 1920`, and for post text `python3 tools/prepublish_check.py --network ig|x --file post.txt`.
6. Deliver as a **Review package** (files + notes + publishable copy in separate files). Luigi approves; only then is anything published.
7. When Luigi gives feedback on copy or editing, encode it as a general rule in the relevant `SKILL.md` (and commit it), then fix the current piece.

Generic replacements for bot-specific tooling used in older versions of these skills: "watch the export with your model's video understanding or watch it yourself", "run ffmpeg locally", "delegate to the strongest available model", "ask Luigi for the asset location", "second look = an independent model or a fresh re-read".

### HARD RULES (Luigi Canoro, non-negotiable)

1. **Every reel is a complete edit:** jump cuts, audio cleanup, transitions or sound effects, and plates integrated inside the MP4. Subtitles + a logo over an untouched take is **NOT** an edit.
2. **Never deliver slideshow-style, low-quality videos** (stills + text + music, dead plates under long voice-over).
3. **QA the full exported video before delivering:** watch it end to end (or analyze the whole file with real video understanding). If you cannot watch video, say so; never claim you did.
4. **Builder en la Bahía (vlog SF):** when a clip shows Luigi talking with its original audio, use that audio and cut the voice-over. VO is only for the intro, the closing and bridging silent visuals. Spelling: **Nico Barbarosch**.
5. **Instagram graphics:** never put a small logo with the URL in the top-left corner (Instagram covers it). Center the layout, make the logo bigger, put the URL at the bottom.
6. **Pavla:** use the CURRENT brand only (green isotipo from the landing + the word "Pavla"). The Nov 2026 rebrand (PV teal monogram, Geist, "Placa clara") is a POC, NOT approved; never use it in campaigns.
7. **Ambassador naming:** say "part of the SpaceXSI Community" with the role "Build ambassador" or "Bot ambassador"; write **Grok Bot**, **Cursor**, **SpaceXSI Community**. Never "SpaceXSI ambassador"/"SpaceX ambassador", never "SpaceXAI", don't mention SpaceX or company news, no homemade logos, no "official", never speak for the company.
8. **Nothing is published without Luigi's explicit approval** of that exact piece and version: produce drafts only. Production notes and internal indications (e.g. "esto se sube como carrusel en 5 historias") are kept in a separate, clearly marked internal note and are **never** included in the post text.
9. **AI voice is autonomous:** don't wait for Luigi's recordings unless he provides them. It still needs his approval before publishing.
10. **Every new video gets two versions to compare:** one made with Claude Opus and one with Gemini. If a model is unavailable, say so; no silent substitution.
11. **Copy voice:** first person as Luigi, rioplatense Spanish (voseo), planned spontaneity, no LLM tropes: no "no es X, es Y" negative parallelisms, no correctio, no "bitácora", no «corte» for sponsor breaks.
12. **Never mix projects** (Pavla, PsicoConecta, mardelplata.dev.ar, Builders OFF The Record, Shiplog, personal/Builder en la Bahía, Cursor/SpaceXSI ambassador work): each repo's content stays in its own brand.
13. **No secrets, API keys, tokens, personal contact data or patient data** in any file, commit, prompt, screenshot or video.

### Skills index

| Skill (`.agents/skills/<name>/SKILL.md`) | When to use |
|---|---|
| `reel-production-complete-edit` | EVERY reel/short, any project: the mandatory editing baseline and completion gate. |
| `video-review-package` | Any video job: WIP/Review/Approved states, source lock, preflight, Review package, delivery. |
| `short-form-reel-editor` | Interview/podcast clip → Reel/TikTok/Short with a strong hook and anti-AI-template look. |
| `event-promo-interview-editor` | Event/guest promo interviews (meetups, Builder Sessions): light edit, keep host questions. |
| `talk-clips-pipeline` | A talk/workshop recording → a series of 20–60 s clips with plates, QA and a schedule. |
| `talk-clips-getting-started` | First setup questions with a new speaker/owner for a talk-clips project. |
| `bah-a-episode-pre-edit-plan` | New Builder en la Bahía footage arrived: catalog + transcripts + edit plan before any cut. |
| `bah-a-edit-delivery-checklist` | Before handing Luigi any Bahía long cut: hard mandatory gates (intro/outro, audio, subs, bumpers, upright). |
| `bah-a-thumbnail-bait-protocol` | Bahía YouTube/Shorts thumbnails: episode title on the plate, real selfie, creative pass. |
| `bah-a-vlog-promo-short-protocol` | Promo Short/Reel for a Bahía episode that is already Public. |
| `voz-argentina-scripts-bah-a-2` | Anything Luigi says or signs: scripts, VO, titles, bumpers, posts in his voice. |
| `qa-texto-anti-tropes-llm` | After every draft of publishable or Luigi-facing text: anti-LLM-tropes gate. |
| `ai-copywriter` | Marketing copy, headlines, CTAs, deck text that must not sound AI-generated. |
| `social-content-with-purpose` | Social posts for a professional brand (Pavla, PsicoConecta, Shiplog…): job, emotion, brand, honest ask. |
| `research-first-content-pipeline` | Before ideating/briefing a campaign: research, trends, strategy, multi-model scored review. |
| `social-promotion` | mardelplata.dev.ar event promotion calendar and per-network drafts + pre-publish gate. |
| `builder-spotlight` | mardelplata.dev.ar Builder Spotlight carousel + caption (consent, complete profiles). |
| `event-creation` | Draft Luma/Partiful fields for a mardelplata.dev.ar event (never publishes). |
| `blog-and-recaps` | mardelplata.dev.ar blog posts and event recaps (drafts, no invented numbers). |
| `slide-craft-and-visual-qa` | Building or QAing decks/slides/carousels: layout, editable native text, visual QA. |
| `pitch-slides-roast-loop` | Hardening a pitch deck/spoken pitch with roast → apply → re-roast rounds. |
| `photo-integration-for-web-ui` | Putting a real person's photo into a site, plate or thumbnail without AI face edits. |
| `pavla-three-agent-marketing` | Pavla campaigns: three separate sessions (plan, content, schedule), current brand only. |

### Files in this pack (in this repo)

- `AGENTS.md` / `GEMINI.md` / `CLAUDE.md` — agent entry points; **`PROJECT_CONTENT_RULES.md`** — Fábrica-specific rules.
- `.agents/skills/<name>/SKILL.md` — one folder per skill, YAML frontmatter `name` + `description`.
- `.cursor/rules/content-creation.mdc` — Cursor rule (agent-requested) pointing here.
- `docs/ffmpeg-cookbook.md`, `docs/qa-checklist.md`, `docs/ffmpeg-test-results.md`.
- `tools/` — jumpcut, loudnorm, preflight, prepublish_check, etc.
- `PROJECT_CONTENT_RULES.template.md` — template for other repos.

### Model routing (when the agent can choose)

- Video creation/editing: Claude Opus with creative freedom, plus a Gemini version of every new video for comparison.
- UI/visual design (sites, plates, motion graphics): delegate to strong models and get an independent review from another strong model.
- Plans, bait selection, roasts: the strongest reasoning model at max effort.
- If a named model is unavailable, report it and propose an alternative; never substitute silently.
