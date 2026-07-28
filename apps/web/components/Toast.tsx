export default function Toast({ message }: { message: string | null }) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center transition-all duration-300 ${
        message ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      aria-live="polite"
    >
      <div className="flex items-center gap-2 rounded-full border border-stroke-strong bg-surface-3 px-4 py-2.5 font-body text-[13px] text-ink-primary shadow-popover">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
        {message}
      </div>
    </div>
  );
}
