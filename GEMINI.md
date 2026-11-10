# GEMINI.md — Fábrica de Contenido (content creation)

Antigravity / Gemini entry point for this repo.

**Read first:** [`PROJECT_CONTENT_RULES.md`](PROJECT_CONTENT_RULES.md) (Fábrica-specific brand, approval, and demo-content policy).

**Then read:** [`AGENTS.md`](AGENTS.md) (Cursor Cloud / Next.js dev instructions plus **## Content creation skills pack** — hard rules, skills index, model routing).

Skills live in **`.agents/skills/<name>/SKILL.md`** (YAML frontmatter `name` + `description`). For any video: `reel-production-complete-edit` + `video-review-package` + the matching editorial skill.

Example prompt in Antigravity after opening this repo: *"Use `reel-production-complete-edit` on this clip; follow `PROJECT_CONTENT_RULES.md` and deliver a Review package only."*

Local ffmpeg helpers: `docs/ffmpeg-cookbook.md`, `tools/`. QA: `docs/qa-checklist.md`, `bash tools/preflight_deliver.sh OUT.mp4 1080 1920`, `python3 tools/prepublish_check.py` for post text.

Nothing is published without explicit human approval.
