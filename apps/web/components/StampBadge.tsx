type StampTone = 'exact' | 'related' | 'filed' | 'pending' | 'neutral';

const TONE_STYLES: Record<StampTone, string> = {
  exact: 'bg-brand-soft text-brand-bright border-brand/30',
  related: 'bg-related-soft text-related border-related/30',
  filed: 'bg-good-soft text-good border-good/30',
  pending: 'bg-surface-3 text-ink-muted border-stroke',
  neutral: 'bg-surface-3 text-ink-secondary border-stroke'
};

const DOT_STYLES: Record<StampTone, string> = {
  exact: 'bg-brand-bright',
  related: 'bg-related',
  filed: 'bg-good',
  pending: 'bg-ink-muted',
  neutral: 'bg-ink-secondary'
};

export default function StampBadge({
  label,
  tone = 'neutral',
  animate = false,
  delay = 0
}: {
  label: string;
  tone?: StampTone;
  tilt?: 'left' | 'right';
  animate?: boolean;
  delay?: number;
}) {
  return (
    <span
      className={`pop-in inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${TONE_STYLES[tone]}`}
      style={animate ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[tone]}`} />
      {label}
    </span>
  );
}
