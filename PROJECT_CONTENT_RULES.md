# PROJECT_CONTENT_RULES.md — Fábrica de Contenido

Project-specific rules on top of `AGENTS.md` (see **## Content creation skills pack** in `AGENTS.md` and skills in `.agents/skills/`). The HARD RULES in that pack always win when they conflict with this file. **Never put secrets, API keys, personal emails/phones, wallet addresses or patient data here.**

## Product editorial policy (this repository)

- The portable **content-creation skills pack** under `.agents/skills/` is the **editorial baseline** that agents using this repo must follow: complete video edits (not slideshow-style outputs), full-video QA before delivery, production notes kept separate from publishable copy, and **nothing published without explicit human approval**. When possible, produce **two model versions** of a new video for comparison (e.g. Claude Opus and Gemini); report if a model is unavailable—no silent substitution.
- **Fábrica de Contenido** in Luigi's workflow produces and drafts content for the **accounts listed under Channels and accounts** below (personal, Shiplog, PsicoConecta, Pavla, mardelplata.dev.ar, etc.). Do not mix brands in a single piece (pack HARD RULES).
- **Product code and automated slideshow renders** in this repo (`src/skills/`, `src/lib/video/`) are still multi-tenant SaaS; **editorial output** for Luigi follows the skills pack and this file. Automated `autoPost` must respect approval gates (see Approval flow).
- **Seeded or example strings inside the codebase** (tests, placeholders) stay generic/fictional unless they are clearly labeled as copies of approved live posts.

## Project
- Name / brand as written: **Fábrica de Contenido** (npm package: `fabrica-de-contenido`).
- What it is (one concrete sentence): Multi-tenant B2B SaaS for automated social video/text content with tenant BYOK AI keys, Inngest jobs, optional GitHub Actions video render, Edge TTS, and Buffer publishing (see `README.md`).
- Audience (as they name themselves): Luigi's brands and communities (below); plus B2B tenants when demoing the product itself.
- Out of scope in a single deliverable: mixing Pavla, PsicoConecta, mardelplata.dev.ar, Builder en la Bahía, Shiplog, SpaceXSI ambassador messaging, or unrelated third-party brands (pack HARD RULES).

## Brand
- Approved logo files (paths in this repo): **No raster logo checked in for Fábrica or tenant brands.** Product UI assets: `public/*.svg` (Next.js defaults only). Demos: use plaintext wordmark **Fábrica de Contenido** until brand files are added under `public/`.
- Colors (hex) and fonts: **Product UI** — see `src/app/globals.css`: primary accent `oklch(0.7 0.2 45)` (fluorescent orange), fonts **Space Grotesk** (sans/heading), **Space Mono** (mono). **Pavla campaigns:** green isotipo from https://pavla.com.ar landing only (pack HARD RULES; no Nov 2026 rebrand POC).
- Approved templates (plates, lower thirds, intro/outro, carousel): **In-repo product templates:** HTML slideshow composition in `src/lib/video/editframe-composition.ts` (not broadcast bumpers). **Editorial plates/bumpers** for Luigi's brands live in Luigi's content workflows per skills (`bah-a-*`, `builder-spotlight`, etc.) — **not** stored in this repo as of 2026-11-10.
- NOT approved / do not use (POCs, old brands): Pavla Nov 2026 rebrand POC (PV teal monogram, Geist, "Placa clara"); third-party marks not listed on each brand's official site.
- Instagram/TikTok safe-zone notes: Pack HARD RULES + `docs/ffmpeg-cookbook.md` §9 (Reels 1080×1920, safe zones); `tools/network_rules.json` for caption/carousel limits.

## Voice
- Person and register: **Luigi / personal / Bahía / mardelplata:** first person as Luigi, rioplatense voseo when he signs copy (`voz-argentina-scripts-bah-a-2`, pack HARD RULES). **Pavla / PsicoConecta / Shiplog:** brand-appropriate register per each skill (`social-content-with-purpose`, `pavla-three-agent-marketing`). Always run `qa-texto-anti-tropes-llm` on publishable text.
- Words and constructions banned: Pack HARD RULES (LLM tropes, ambassador wording, etc.) + skill-specific bans.
- Recurring people and exact spelling (verified in repo or official sites): **Nico Barbarosch** (Bahía, pack HARD RULES); **Franco Petruccelli** (cofounder mardelplata.dev.ar, `https://mardelplata.dev.ar/prensa/spacex-ai-0223`); **Raffaele Nunzio Canoro** (Bahía jingle credit, `bah-a-edit-delivery-checklist` skill). Fictional names only in automated product/test copy (`prisma/seed.ts` has no person names).

## Channels and accounts

Fábrica agents draft for these **public handles** (verify live before scheduling; Buffer connects the same channels in the product).

| Brand / scope | Network | Public handle or URL |
|---------------|---------|----------------------|
| **Luigi personal** | X | https://x.com/LuigiMdpDev (`@LuigiMdpDev`) |
| **Luigi personal** | YouTube | https://www.youtube.com/@LuigiRaffaeleSiano |
| **Luigi personal** | LinkedIn | https://www.linkedin.com/in/luigicanoro |
| **Shiplog** | X | https://x.com/shiplogoss (`@shiplogoss`) |
| **Shiplog** | Bluesky | https://shiploghelp.bsky.social |
| **Shiplog** | Mastodon | https://mastodon.social/@shiploghelp (`@shiploghelp` on mastodon.social) |
| **PsicoConecta** | Instagram | https://www.instagram.com/psicoconecta_argentina/ (`@psicoconecta_argentina`) |
| **Pavla** | Instagram | https://www.instagram.com/pavla.app/ (`@pavla.app`) — linked from https://pavla.com.ar |
| **Pavla** | X | https://x.com/pavla_app (`@pavla_app`) — linked from https://pavla.com.ar |
| **Pavla** | Web | https://pavla.com.ar |
| **mardelplata.dev.ar** | Web (canonical) | https://mardelplata.dev.ar |
| **mardelplata.dev.ar** | Instagram | **No `@handle` in crawlable homepage HTML** (Cloudflare challenge on automated fetch, 2026-11-10). Use the IG channel connected in Luigi's Buffer for community posts; do not invent a handle. |
| **mardelplata.dev.ar** | X / LinkedIn for events | Drafts per `social-promotion` skill; prefer community link https://mardelplata.dev.ar and confirmed mentions only. Personal promotion may use Luigi's X/LinkedIn above when the piece is in his voice. |

- Scheduler used: **Buffer** (`src/lib/publishing/providers/buffer.ts`, `README.md`); limits enforced in editorial QA via `tools/network_rules.json` + `tools/prepublish_check.py` (free-plan style caps documented there).
- Approval flow: **Luigi explicit OK per piece and version** before anything goes live (pack HARD RULES). **In product code:** `ContentConfig.requireApproval` defaults **true** (`prisma/schema.prisma`); generated content starts `PENDING_APPROVAL` when approval is required (`src/lib/inngest/functions.ts`); dashboard approve sets `APPROVED` with `approvedBy` (`src/app/dashboard/actions.ts`); Buffer publish requires `APPROVED` (`src/lib/inngest/functions.ts`). Onboarding wizard pre-checks **requireApproval** (`src/app/dashboard/onboarding/onboarding-wizard.tsx`). **Policy:** keep `requireApproval` enabled for Luigi's tenant; `autoPost` only after approval.

## Assets
- Where masters, jingles, bumpers, B-roll, photos live: **In-repo:** `tools/`, `docs/ffmpeg-cookbook.md`; rendered product video URLs via R2/GitHub Actions (`src/lib/storage/r2.ts`, `README.md`). **Brand masters** (Bahía intro/outro, Pavla plates, etc.): **not in this git repo** — ask Luigi; paths may be documented in future commits under `public/` or external storage names only (no credentials).
- Consent sources for featured people: **No consent database in this repo.** mardelplata **Builder Spotlight** requires consent on the community consent spreadsheet (`builder-spotlight` skill). Obtain current sheet/process from Luigi before spotlight or event posts naming real attendees.

## Claims
- Verified claims we can make (with source): Product capabilities in `README.md`, `docs/PRODUCT_PLAN.md` (Buffer-first, BYOK, Inngest, Clerk, Postgres, skills in `src/skills/`).
- Banned claims: SpaceX/company news or "official" ambassador language except as permitted in pack HARD RULES; invented attendance or engagement numbers (`blog-and-recaps` skill); patient-identifiable content for PsicoConecta/Pavla.

## Video specifics
- Default formats and durations: **Product render defaults:** aspect ratio **9:16**, **1080×1920** when unset (`src/lib/video/editframe-composition.ts`); slideshow slides **1500–15000 ms** per slide, planner default **4000 ms** (`src/skills/slideshow-planner/skill.ts`). **Editorial social exports:** **1080×1920** Reels/Shorts/TikTok, **≤90 s** recommended for Reels distribution (`docs/ffmpeg-cookbook.md` §9); preflight `bash tools/preflight_deliver.sh OUT.mp4 1080 1920`.
- Intro/outro rules: **Complete edits** per `reel-production-complete-edit` (jump cuts, audio, transitions, integrated plates—not slideshow). **Bahía long-form:** motion intro/outro per `bah-a-edit-delivery-checklist`. **Product-generated slideshows:** no mandatory branded intro/outro MP4 in codebase—HTML composition only.
- Caption style (font, size, colors, position): **ffmpeg editorial burns:** ASS style `Reel`, 2–5 words per line, safe zone, names verified (`docs/ffmpeg-cookbook.md` §5); example lower-third accent `0x58A6FF`. **Pavla/Shiplog/PsicoConecta plates:** follow each brand's approved design off-repo unless assets are later committed here.

## Sources

Checked **2026-11-10** unless noted.

| Topic | Source |
|-------|--------|
| Product stack, Buffer, video pipeline | `README.md`, `docs/PRODUCT_PLAN.md` |
| UI colors/fonts | `src/app/globals.css` |
| Video dimensions / default 9:16 | `src/lib/video/editframe-composition.ts` |
| Slideshow slide duration | `src/skills/slideshow-planner/skill.ts` |
| Approval fields & defaults | `prisma/schema.prisma` (`ContentConfig.requireApproval`, `ContentStatus`), `src/lib/inngest/functions.ts`, `src/app/dashboard/actions.ts`, `src/app/dashboard/onboarding/onboarding-wizard.tsx` |
| Editorial export table | `docs/ffmpeg-cookbook.md` |
| Network caption limits | `tools/network_rules.json` |
| Luigi X / YouTube | User task spec; YouTube title fetch `Luigi Canoro - YouTube` for `@LuigiRaffaeleSiano` |
| Luigi LinkedIn | User task spec `linkedin.com/in/luigicanoro` |
| Shiplog, PsicoConecta handles | User task spec; HTTP 200/302 on profile URLs (X, Bluesky, Mastodon, Instagram login redirect for IG) |
| Pavla IG/X | https://pavla.com.ar homepage HTML (`instagram.com/pavla.app`, `x.com/pavla_app`) |
| Pavla brand copy / positioning | https://pavla.com.ar (WebFetch) |
| mardelplata canonical site | https://mardelplata.dev.ar (WebFetch); Franco Petruccelli `https://mardelplata.dev.ar/prensa/spacex-ai-0223` |
| mardelplata IG handle absent in HTML | `curl` homepage → Cloudflare interstitial, 5248 bytes, no `instagram.com/` links |
| Bahía spelling / intro rules | `.agents/skills/bah-a-edit-delivery-checklist/SKILL.md`, pack `AGENTS.md` HARD RULES |
| Secret hygiene | No `.env` content copied; ripgrep on committed docs/skills/tools |
