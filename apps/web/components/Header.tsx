export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#334155] backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-14 max-w-310 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5"> 
            <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-[#1E293B] from-brand-bright to-brand-dim font-display text-[13px] font-bold text-white shadow-glow">
              P
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink-primary">
              Parcel Vault
            </span>
          </div>
          <span className="hidden rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] bg-[#1E293B] text-ink-muted sm:inline">
            title plant
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-full shadow-sm bg-gray-600 px-3 py-1.5 font-mono text-[11px] text-ink-secondary md:flex">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80,0_0_16px_rgba(74,222,128,0.6),0_0_28px_rgba(74,222,128,0.35)]" />
            vault online
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-500 text-white border border-stroke border-gray-300 text-[11px] font-semibold text-ink-secondary">
            RE
          </div>
        </div>
      </div>
    </header>
  );
}
