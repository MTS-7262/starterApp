'use client';

import { MatchedRecord, MatchTier } from '@/lib/types';
import StampBadge from './StampBadge';

function fmtMoney(v: string) {
  if (!v) return '—';
  const num = parseFloat(v.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(num)) return v;
  return '$' + num.toLocaleString();
}

function RecordCard({ record, tier, index, onOpen }: { record: MatchedRecord; tier: MatchTier; index: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
      className="rise-in group relative flex w-full flex-col rounded-xl border border-stroke bg-surface-1 p-4 text-left shadow-card transition hover:-translate-y-[2px] hover:border-stroke-strong hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">{record.type}</div>
          <h3 className="truncate font-display text-[15px] font-semibold leading-snug text-ink-primary">
            {record.address || 'No address on file'}
          </h3>
        </div>
        <StampBadge label={tier === 'exact' ? 'Exact' : 'Related'} tone={tier === 'exact' ? 'exact' : 'related'} />
      </div>

      <div className="mt-1 font-mono text-[11.5px] text-ink-muted">APN {record.apn || '—'}</div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-stroke-soft pt-3 text-[12px]">
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.08em] text-ink-muted">Owner</div>
          <div className="truncate text-ink-secondary">{record.owner || '—'}</div>
        </div>
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.08em] text-ink-muted">Subdivision</div>
          <div className="truncate text-ink-secondary">{record.subdivision || '—'}</div>
        </div>
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.08em] text-ink-muted">Block / Lot</div>
          <div className="text-ink-secondary">{record.block || '—'} / {record.lot || '—'}</div>
        </div>
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.08em] text-ink-muted">Amount</div>
          <div className="text-ink-secondary">{fmtMoney(record.amount)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-stroke-soft pt-3">
        <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em]">
          <span className={`h-1.5 w-1.5 rounded-full ${record.pdf ? 'bg-good shadow-[0_0_6px_rgba(62,207,142,0.7)]' : 'bg-ink-faint'}`} />
          <span className={record.pdf ? 'text-good' : 'text-ink-muted'}>{record.pdf ? 'PDF filed' : 'No PDF filed'}</span>
        </div>
        <span className="flex items-center gap-1 text-[11.5px] font-medium text-ink-muted group-hover:text-brand-bright">
          Open record
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </button>
  );
}

export default function ResultsPanel({
  exact,
  related,
  loading,
  hasSearched,
  criteria,
  activeTab,
  onTabChange,
  onOpenRecord
}: {
  exact: MatchedRecord[];
  related: MatchedRecord[];
  loading: boolean;
  hasSearched: boolean;
  criteria: string;
  activeTab: MatchTier;
  onTabChange: (t: MatchTier) => void;
  onOpenRecord: (id: string) => void;
}) {
  const active = activeTab === 'exact' ? exact : related;
  const total = exact.length + related.length;

  return (
    <section className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border border-b-0 border-stroke bg-surface-1 px-5 py-3.5">
        <div className="text-[12.5px] text-ink-muted">
          <span className="uppercase tracking-[0.06em]">Search criteria:</span>{' '}
          <span className="font-medium text-ink-primary">{criteria || 'none yet'}</span>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          {hasSearched ? `${total} record${total === 1 ? '' : 's'} found` : ''}
        </div>
      </div>

      <div className="flex gap-1 border border-b-0 border-stroke bg-surface-1 px-4 pt-1.5">
        {(['exact', 'related'] as MatchTier[]).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={`relative rounded-t-lg px-4 py-2.5 text-[13px] font-semibold transition ${
              activeTab === t ? 'bg-surface-0 text-ink-primary' : 'text-ink-muted hover:text-ink-secondary'
            }`}
          >
            {t === 'exact' ? 'Exact Matches' : 'Related Records'}{' '}
            <span
              className={`ml-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                t === 'exact' ? 'bg-brand-soft text-brand-bright' : 'bg-related-soft text-related'
              }`}
            >
              {t === 'exact' ? exact.length : related.length}
            </span>
            {activeTab === t && <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-brand-bright" />}
          </button>
        ))}
      </div>

      <div className="min-h-[360px] rounded-b-xl border border-stroke bg-surface-0 p-5">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[176px] animate-pulse rounded-xl border border-stroke bg-surface-1" />
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="flex h-[320px] flex-col items-center justify-center text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-dashed border-stroke-strong text-ink-muted">
              ⌕
            </div>
            <p className="font-display text-[15px] text-ink-primary">Search the vault to begin</p>
            <p className="mt-1 max-w-[320px] text-[12.5px] text-ink-muted">
              Enter an address, APN, or legal description on the left. Precise identifiers surface exact matches;
              looser criteria surface related starters nearby.
            </p>
          </div>
        ) : active.length === 0 ? (
          <div className="flex h-[320px] flex-col items-center justify-center text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-dashed border-stroke-strong text-ink-muted">
              ∅
            </div>
            <p className="font-display text-[15px] text-ink-primary">
              No {activeTab === 'exact' ? 'exact matches' : 'related records'} found
            </p>
            <p className="mt-1 max-w-[320px] text-[12.5px] text-ink-muted">
              {activeTab === 'exact'
                ? 'Try the Related tab, or file this property as a new starter.'
                : 'Nothing nearby is filed yet for this search.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((r, i) => (
              <RecordCard key={r.id} record={r} tier={activeTab} index={i} onOpen={() => onOpenRecord(r.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
