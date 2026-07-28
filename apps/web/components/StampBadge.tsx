'use client';

export type StampTone = 'exact' | 'related' | 'filed' | 'pending' | 'neutral';

const TONE_STYLES: Record<StampTone, string> = {
  exact: 'bg-teal-950/80 text-teal-300 border-teal-500/30',
  related: 'bg-sky-950/80 text-sky-300 border-sky-500/30',
  filed: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
  neutral: 'bg-[#1e2c3a] text-slate-300 border-[#2b3c4e]'
};

const DOT_STYLES: Record<StampTone, string> = {
  exact: 'bg-teal-400 shadow-[0_0_6px_#2dd4bf]',
  related: 'bg-sky-400 shadow-[0_0_6px_#38bdf8]',
  filed: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
  pending: 'bg-amber-400 shadow-[0_0_6px_#fbbf24]',
  neutral: 'bg-slate-400'
};

export default function StampBadge({
  label,
  tone = 'neutral',
  animate = false,
  delay = 0
}: {
  label: string;
  tone?: StampTone;
  animate?: boolean;
  delay?: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] transition ${TONE_STYLES[tone]}`}
      style={animate ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[tone]}`} />
      {label}
    </span>
  );
}