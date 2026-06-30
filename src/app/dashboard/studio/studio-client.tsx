"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EDGE_VOICES, DEFAULT_VOICE } from "@/lib/tts/voices";

import {
  type StudioPlanState,
  generateSlideshowPlan,
  requestSlideshowRender,
} from "./actions";

const initial: StudioPlanState = {};

type Props = {
  organizationId: string;
  hasAiKey: boolean;
  hasOpenAiKey: boolean;
  hasPexels: boolean;
  hasR2: boolean;
};

export function StudioClient({
  organizationId,
  hasAiKey,
  hasOpenAiKey,
  hasPexels,
  hasR2,
}: Props) {
  const [state, action, pending] = useActionState(generateSlideshowPlan, initial);

  function downloadCompositionHtml() {
    if (!state.compositionHtml) return;
    const blob = new Blob([state.compositionHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass animate-scale-in rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">1 · Describe tu slideshow</h2>

        {!hasAiKey && (
          <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            Necesitas una API key de IA activa (Ajustes) para generar el guion.
          </p>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="organizationId" value={organizationId} />
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <textarea
              id="prompt"
              name="prompt"
              required
              rows={5}
              defaultValue={state.prompt ?? ""}
              placeholder="Ej: 5 tips de productividad para emprendedores, tono motivador, cierre con CTA para seguir la cuenta."
              className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma</Label>
              <select
                id="platform"
                name="platform"
                defaultValue={state.platform ?? "instagram"}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slideCount">Slides</Label>
              <Input
                id="slideCount"
                name="slideCount"
                type="number"
                min={2}
                max={10}
                defaultValue={state.slideCount ?? 5}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Formato</Label>
              <select
                id="aspectRatio"
                name="aspectRatio"
                defaultValue={state.aspectRatio ?? "9:16"}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
              >
                <option value="9:16">9:16</option>
                <option value="4:5">4:5</option>
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="imageSource">Imágenes de fondo</Label>
              <select
                id="imageSource"
                name="imageSource"
                defaultValue={state.imageSource ?? "none"}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
              >
                <option value="none">Gradientes (sin imágenes)</option>
                <option value="pexels" disabled={!hasPexels}>
                  Stock Pexels{hasPexels ? "" : " (no configurado)"}
                </option>
                <option value="ai" disabled={!hasOpenAiKey || !hasR2}>
                  IA (OpenAI){hasOpenAiKey && hasR2 ? "" : " (requiere OpenAI + R2)"}
                </option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voiceName">Voz (Edge TTS)</Label>
              <select
                id="voiceName"
                name="voiceName"
                defaultValue={state.voiceName || DEFAULT_VOICE}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
              >
                {EDGE_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="voiceover"
              defaultChecked={state.voiceover ?? false}
              disabled={!hasR2}
              className="rounded"
            />
            Añadir voz en off {hasR2 ? "" : "(requiere R2)"}
          </label>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending || !hasAiKey} className="orange-glow bg-primary">
            {pending ? "Generando guion…" : "Generar guion"}
          </Button>
        </form>
      </div>

      <div className="glass animate-scale-in rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">2 · Previsualiza y renderiza</h2>

        {!state.plan ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-10 text-center text-sm text-muted-foreground">
            El guion generado aparecerá aquí.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">{state.plan.title}</p>
              {state.plan.caption && (
                <p className="mt-1 text-xs text-muted-foreground">{state.plan.caption}</p>
              )}
            </div>

            <ol className="space-y-2">
              {state.plan.slides.map((slide, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border/50 bg-card/50 p-3 text-sm"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-primary">#{i + 1}</span>
                    <span className="font-semibold">{slide.heading}</span>
                  </div>
                  {slide.body && (
                    <p className="mt-1 text-xs text-muted-foreground">{slide.body}</p>
                  )}
                  {slide.voiceover && (
                    <p className="mt-1 text-xs italic text-muted-foreground/80">🎙 {slide.voiceover}</p>
                  )}
                </li>
              ))}
            </ol>

            {state.plan.hashtags.length > 0 && (
              <p className="text-xs text-primary">
                {state.plan.hashtags.map((h) => `#${h}`).join(" ")}
              </p>
            )}

            {state.renderGuide && (
              <div className="space-y-2 rounded-lg border border-border/50 bg-card/40 p-3">
                <p className="text-xs font-semibold text-foreground">Render local (HyperFrames)</p>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
                  {state.renderGuide}
                </pre>
                {state.compositionHtml && (
                  <Button type="button" size="sm" variant="outline" onClick={downloadCompositionHtml}>
                    Descargar index.html
                  </Button>
                )}
              </div>
            )}

            <form action={requestSlideshowRender}>
              <input type="hidden" name="organizationId" value={organizationId} />
              <input type="hidden" name="prompt" value={state.prompt ?? ""} />
              <input type="hidden" name="platform" value={state.platform ?? "instagram"} />
              <input type="hidden" name="slideCount" value={state.slideCount ?? 5} />
              <input type="hidden" name="aspectRatio" value={state.aspectRatio ?? "9:16"} />
              <input type="hidden" name="imageSource" value={state.imageSource ?? "none"} />
              <input type="hidden" name="voiceover" value={state.voiceover ? "true" : "false"} />
              <input type="hidden" name="voiceName" value={state.voiceName || DEFAULT_VOICE} />
              <Button type="submit" className="bg-primary">
                Renderizar slideshow
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              El render usa HyperFrames en el servidor (sin API key). También podés descargar el HTML
              y renderizar en tu máquina, o pedirle a tu agente de código que instale hyperframes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
