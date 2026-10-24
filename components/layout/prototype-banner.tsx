export function PrototypeBanner() {
  return (
    <aside
      aria-label="Application release status"
      className="prototype-banner sticky top-0 z-[60] flex shrink-0 flex-col items-center justify-center gap-1 border-b border-amber-300/30 bg-[#30230d] px-4 text-center text-xs leading-5 text-amber-50 sm:flex-row sm:gap-3"
    >
      <span className="shrink-0 rounded border border-amber-300/50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-200">
        Beta prototype
      </span>
      <p>
        This app is experimental. Features may change or fail. Verify AI reviews before relying on them.
      </p>
    </aside>
  );
}
