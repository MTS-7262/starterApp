'use client';

import { MatchedRecord, MatchTier } from '../lib/types';
import StampBadge from './StampBadge';

function fmtMoney(v: string) {
  if (!v) return '—';
  const num = parseFloat(v.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(num)) return v;
  return '$' + num.toLocaleString();
}

function RecordCard({
  record,
  tier,
  index,
  onOpen
}: {
  record: MatchedRecord;
  tier: MatchTier;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
      className="rise-in group relative flex w-full flex-col rounded-xl border border-[#253342] bg-[#111a22] p-4 text-left shadow-lg transition hover:-translate-y-[2px] hover:border-teal-500/50 hover:bg-[#15202b]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {record.type}
          </div>
          <h3 className="truncate font-sans text-[15px] font-bold leading-snug text-slate-100">
            {record.address || 'No address on file'}
          </h3>
        </div>
        <StampBadge
          label={tier === 'exact' ? 'Exact' : 'Related'}
          tone={tier === 'exact' ? 'exact' : 'related'}
        />
      </div>

      <div className="mt-1 font-mono text-[11.5px] text-slate-400">
        APN {record.apn || '—'}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[#253342] pt-3 text-[12px]">
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Owner
          </div>
          <div className="truncate font-medium text-slate-200">
            {record.owner || '—'}
          </div>
        </div>
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Subdivision
          </div>
          <div className="truncate font-medium text-slate-200">
            {record.subdivision || '—'}
          </div>
        </div>
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Block / Lot
          </div>
          <div className="font-medium text-slate-200">
            {record.block || '—'} / {record.lot || '—'}
          </div>
        </div>
        <div>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Amount
          </div>
          <div className="font-medium text-slate-200">
            {fmtMoney(record.amount)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#253342] pt-3">
        <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.06em]">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              record.pdf
                ? 'bg-[#4ade80] shadow-[0_0_8px_#4ade80]'
                : 'bg-slate-600'
            }`}
          />
          <span className={record.pdf ? 'text-emerald-400' : 'text-slate-500'}>
            {record.pdf ? 'PDF filed' : 'No PDF filed'}
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11.5px] font-semibold text-slate-400 transition group-hover:text-teal-300">
          Open record
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
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
    <section className="min-w-0 flex-1 rounded-2xl border border-[#293847] bg-[#16212b] shadow-2xl overflow-hidden">
      {/* Top Search Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#253342] px-5 py-3.5 text-[12px]">
        <div className="text-slate-400">
          <span className="font-mono uppercase tracking-wider text-slate-400">
            SEARCH CRITERIA:
          </span>{' '}
          <span className="font-semibold text-slate-200">
            {criteria || 'none yet'}
          </span>
        </div>
        <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {hasSearched ? `${total} RECORDS FOUND` : '0 RECORDS FOUND'}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-[#253342] bg-[#121c25] px-4 pt-1.5">
        {(['exact', 'related'] as MatchTier[]).map((t) => {
          const isActive = activeTab === t;
          const count = t === 'exact' ? exact.length : related.length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange(t)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition ${
                isActive
                  ? 'text-teal-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t === 'exact' ? 'Exact Matches' : 'Related Records'}</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                  isActive
                    ? 'border border-teal-500/30 bg-teal-950/80 text-teal-300'
                    : 'bg-[#1e2c3a] text-slate-400'
                }`}
              >
                {count}
              </span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-teal-400 shadow-[0_0_8px_#2dd4bf]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="min-h-[380px] p-5">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[180px] animate-pulse rounded-xl border border-[#253342] bg-[#111a22]"
              />
            ))}
          </div>
        ) : !hasSearched ? (
          /* Initial State */
          <div className="flex h-[340px] flex-col items-center justify-center text-center">
            <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-teal-500/10 blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-teal-500/40 bg-[#111a22]">
                <span className="text-3xl text-teal-300 drop-shadow-[0_0_12px_rgba(45,212,191,0.6)]">
                  ⌕
                </span>
              </div>
            </div>
            <p className="font-sans text-[16px] font-bold text-slate-100">
              Search the vault to begin
            </p>
            <p className="mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-slate-400">
              Enter an address, APN, or legal description on the left. Precise
              identifiers surface exact matches; looser criteria surface
              related starters nearby.
            </p>
          </div>
        ) : active.length === 0 ? (
          /* No Results Found State */
          <div className="flex h-[340px] flex-col items-center justify-center text-center">
            <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-teal-500/10 blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-teal-500/40 bg-[#111a22]">
                <span className="text-3xl text-teal-300 drop-shadow-[0_0_12px_rgba(45,212,191,0.6)]">
                  ∅
                </span>
              </div>
            </div>
            <p className="font-sans text-[16px] font-bold text-slate-100">
              No {activeTab === 'exact' ? 'exact matches' : 'related records'} found
            </p>
            <p className="mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-slate-400">
              {activeTab === 'exact'
                ? 'Try the Related tab, or file this property as a new starter.'
                : 'Nothing nearby is filed yet for this search.'}
            </p>
          </div>
        ) : (
          /* Results Grid */
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((r, i) => (
              <RecordCard
                key={r.id}
                record={r}
                tier={activeTab}
                index={i}
                onOpen={() => onOpenRecord(r.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}