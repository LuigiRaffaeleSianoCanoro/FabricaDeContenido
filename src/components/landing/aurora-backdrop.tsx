import { ShaderBackground } from "./shader-background";

/**
 * Shared dark animated background (CSS aurora + WebGL shader + grid/grain),
 * matching the landing page. Render it inside a `relative isolate` container;
 * page content should sit in a sibling with `z-10`.
 */
export function AuroraBackdrop() {
  return (
    <>
      {/* Always-on vivid animated aurora (visible even without WebGL) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="aurora-base absolute inset-0" />
        <div className="absolute right-[-12rem] top-1/4 size-[40rem] animate-blob rounded-full bg-amber-500/25 blur-[140px] [animation-delay:-6s]" />
        <div className="absolute bottom-[-16rem] left-1/2 size-[42rem] animate-blob rounded-full bg-orange-600/25 blur-[150px] [animation-delay:-10s]" />
        <div className="absolute -bottom-10 right-0 size-[34rem] animate-blob rounded-full bg-rose-600/20 blur-[140px]" />
      </div>

      {/* WebGL shader on top of the CSS fallback (degrades gracefully) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <ShaderBackground className="h-full w-full" />
      </div>

      {/* Grid + grain + readability scrims (symmetric, for centered content) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="grid-backdrop absolute inset-0" />
        <div className="noise-overlay absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-[#08060e]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08060e]/55 via-transparent to-[#08060e]/80" />
      </div>
    </>
  );
}
