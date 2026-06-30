import type { SlideshowComposition } from "@/lib/video/editframe-composition";

/**
 * Human-readable instructions for rendering a slideshow locally with HyperFrames
 * (or Editframe CLI as fallback). Shown in Studio and stored on render jobs.
 */
export function buildSlideshowRenderGuide(
  composition: SlideshowComposition,
  opts: { title?: string } = {},
): string {
  const title = opts.title?.trim() || "slideshow";
  const safeName = title.replace(/[^\w\-]+/g, "-").replace(/^-+|-+$/g, "") || "slideshow";
  const durationSec = Math.round(composition.durationMs / 1000);

  return [
    `# Renderizar "${title}" (${durationSec}s · ${composition.width}×${composition.height})`,
    "",
    "Este guion se convierte en un MP4 con **HyperFrames** (open source, sin API key).",
    "Alternativa equivalente: CLI de Editframe si ya lo tenés instalado.",
    "",
    "## Requisitos",
    "- Node.js 22+",
    "- FFmpeg (`brew install ffmpeg` / `apt install ffmpeg`)",
    "- Chrome (HyperFrames lo descarga automáticamente la primera vez)",
    "",
    "## Opción A — HyperFrames (recomendada)",
    "```bash",
    "mkdir -p ~/Videos/" + safeName,
    "cd ~/Videos/" + safeName,
    "# Pegá el HTML de composición en index.html (descargalo desde Studio o Trabajos)",
    "npm install hyperframes",
    `npx hyperframes render . -o ${safeName}.mp4 -f ${composition.fps} -q standard`,
    "```",
    "",
    "## Opción B — una sola línea con npx",
    "```bash",
    `# Desde la carpeta que contiene index.html`,
    `npx hyperframes render . -o ${safeName}.mp4 -f ${composition.fps}`,
    "```",
    "",
    "## Opción C — Editframe CLI (si lo preferís)",
    "```bash",
    "npm install -g @editframe/cli",
    `# Guardá la composición HTML y renderizá con el CLI de Editframe`,
    "```",
    "",
    "## Preview antes de renderizar",
    "```bash",
    "npx hyperframes preview",
    "# Abrí http://localhost:5173 para ver el slideshow en el navegador",
    "```",
    "",
    "Tip: si usás un agente de código (Cursor, Claude Code, etc.), pedile:",
    `"Instalá hyperframes, guardá este HTML como index.html y renderizá el slideshow a MP4."`,
  ].join("\n");
}
