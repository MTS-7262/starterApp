export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stroke bg-surface-0/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-gradient-to-br from-brand-bright to-brand-dim font-display text-[13px] font-bold text-white shadow-glow">
              P
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink-primary">
              Parcel Vault
            </span>
          </div>
          <span className="hidden rounded-full border border-stroke px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted sm:inline">
            title plant
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full border border-stroke bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-ink-secondary md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-good shadow-[0_0_6px_rgba(62,207,142,0.8)]" />
            vault online
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-full border border-stroke bg-surface-2 text-[11px] font-semibold text-ink-secondary">
            RE
          </div>
        </div>
      </div>
    </header>
  );
}
