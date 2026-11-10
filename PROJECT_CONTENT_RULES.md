# PROJECT_CONTENT_RULES.md — Fábrica de Contenido

Project-specific rules on top of `AGENTS.md` (see **## Content creation skills pack** in `AGENTS.md` and skills in `.agents/skills/`). The HARD RULES in that pack always win when they conflict with this file. **Never put secrets, API keys, personal emails/phones, wallet addresses or patient data here.**

## Product editorial policy (this repository)

- The portable **content-creation skills pack** under `.agents/skills/` is the **editorial baseline** that product agents (tenant deployments of Fábrica de Contenido) are expected to follow: complete video edits (not slideshow-style outputs), full-video QA before delivery, production notes kept separate from publishable copy, and **nothing published without explicit human approval**. When possible, produce **two model versions** of a new video for comparison (e.g. Claude Opus and Gemini); report if a model is unavailable—no silent substitution.
- **Example and seed content** in this repo must stay **generic or fictional**, not tied to Luigi Canoro's other brands or live campaigns (Pavla, Builder en la Bahía, mardelplata.dev.ar, PsicoConecta, etc.).
- This codebase is the **product** that lets customers deploy their **own** content-creation agents (BYOK, Buffer-first publishing, skills in `src/skills/`). Editorial skills in `.agents/skills/` document how Luigi and contributors develop content **for** the product; tenant-facing behavior is configured per deployment, not assumed here.

## Project
- Name / brand as written: **Fábrica de Contenido** (npm package: `fabrica-de-contenido`).
- What it is (one concrete sentence): Multi-tenant B2B SaaS for automated social video/text content with tenant BYOK AI keys, Inngest jobs, optional GitHub Actions video render, Edge TTS, and Buffer publishing (see `README.md`).
- Audience (as they name themselves): B2B teams and agencies operating social content pipelines (tenants); contributors building the product on GitHub.
- Out of scope (projects/brands that must never appear here): Luigi's unrelated brands and communities called out in the pack HARD RULES (Pavla campaigns, Builder en la Bahía episodes, mardelplata.dev.ar community promos, PsicoConecta patient-facing copy, SpaceXSI ambassador messaging, etc.) unless explicitly scoped to **fictional demos** for this product.

## Brand
- Approved logo files (paths in this repo): TBD (Luigi) — use neutral/product naming in demos until assets are checked in.
- Colors (hex) and fonts: Product UI uses Tailwind 4 + shadcn (Base UI); marketing plates for demos: TBD (Luigi).
- Approved templates (plates, lower thirds, intro/outro, carousel): TBD (Luigi).
- NOT approved / do not use (POCs, old brands): Third-party brand packs from Luigi's other projects; Pavla Nov 2026 rebrand POC per pack HARD RULES.
- Instagram/TikTok safe-zone notes: Per pack HARD RULES (no small logo + URL top-left on IG graphics).

## Voice
- Person and register (e.g. first person as Luigi, rioplatense voseo / "nosotros" for the community): **Demo/sample content:** neutral Spanish or English product voice; **Luigi-authored editorial work in this repo:** rioplatense voseo, first person when explicitly requested. Apply `qa-texto-anti-tropes-llm` to publishable text.
- Words and constructions banned in this project (in addition to `qa-texto-anti-tropes-llm`): LLM tropes listed in pack HARD RULES; no implying live publication without approval.
- Recurring people and exact spelling: TBD (Luigi) for fictional demo personas only in this repo.

## Channels and accounts
- Networks + public handles: TBD (Luigi) — product integrates **Buffer** (`src/lib/publishing/`); tenants connect their own channels.
- Scheduler used (e.g. Buffer) and plan limits: **Buffer** (see README); per-tenant Buffer credentials in app, not in this doc.
- Approval flow (who approves, how; default: Luigi, explicit OK per piece/version): **Default for all content from this repo:** explicit human approval per piece and version before any publish action; production notes never in post copy. Product code should not auto-publish without tenant-configured approval gates (TBD (Luigi) for default tenant demo policy).

## Assets
- Where masters, jingles, bumpers, B-roll, photos live (folder or drive name, no credentials): `tools/` and `docs/ffmpeg-cookbook.md` for local ffmpeg helpers; R2/video pipeline in `src/lib/storage/r2.ts` and GitHub Actions for rendered output — no credential paths here.
- Consent sources for featured people: TBD (Luigi); use fictional personas in repo examples.

## Claims
- Verified claims we can make (with source): Product capabilities described in `README.md` and `docs/PRODUCT_PLAN.md` (Buffer-first, BYOK, Inngest, Clerk, Neon/Postgres, skills executor in `src/skills/`).
- Banned claims: Anything about Luigi's ambassador role, SpaceX/company news, or other brands' live metrics unless sourced and approved; no invented engagement numbers in drafts (`blog-and-recaps` skill).

## Video specifics
- Default formats and durations: Vertical social (e.g. 1080×1920) per `tools/preflight_deliver.sh` and cookbook; tenant/product renders via Remotion/GitHub Actions — exact product defaults: TBD (Luigi).
- Intro/outro rules: Per `reel-production-complete-edit` and `video-review-package` skills; product-specific bumpers: TBD (Luigi).
- Caption style (font, size, colors, position): See `docs/ffmpeg-cookbook.md`; brand-specific style: TBD (Luigi).
