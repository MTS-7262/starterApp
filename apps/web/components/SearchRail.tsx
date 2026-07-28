'use client';

import { useState } from 'react';
import { SearchQuery, StarterType } from '@/lib/types';

const TYPES: (StarterType | 'All')[] = ['All', 'Owner', 'Lender', 'Commitment'];

const emptyQuery: SearchQuery = {
  address: '',
  state: '',
  county: '',
  zip: '',
  apn: '',
  owner: '',
  subdivision: '',
  block: '',
  lot: '',
  type: 'All'
};

export default function SearchRail({
  onSearch,
  onReset,
  onFileNew,
  loading
}: {
  onSearch: (q: SearchQuery) => void;
  onReset: () => void;
  onFileNew: () => void;
  loading: boolean;
}) {
  const [q, setQ] = useState<SearchQuery>(emptyQuery);

  const set = (patch: Partial<SearchQuery>) => setQ((prev) => ({ ...prev, ...patch }));

  const field =
    'w-full rounded-lg border border-stroke bg-surface-2 px-3 py-2 text-[13px] text-ink-primary placeholder:text-ink-faint outline-none transition focus:border-brand/60 focus:bg-surface-3 focus:ring-2 focus:ring-brand/20';

  const label = 'mb-1.5 mt-3.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted';

  return (
    <aside className="sticky top-[76px] h-fit w-[292px] shrink-0 rounded-xl border border-stroke bg-surface-1 p-5 shadow-panel">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold text-ink-primary">Search the Vault</h2>
        <button
          type="button"
          onClick={() => {
            setQ(emptyQuery);
            onReset();
          }}
          className="text-[11.5px] font-medium text-ink-muted transition hover:text-brand-bright"
        >
          Reset
        </button>
      </div>
      <p className="mb-1 text-[11.5px] leading-snug text-ink-muted">
        Search by identifier for an exact hit, or leave fields loose to surface related starters nearby.
      </p>

      <label className={label} htmlFor="s-address">
        Address
      </label>
      <input
        id="s-address"
        className={field}
        placeholder="Street address"
        value={q.address}
        onChange={(e) => set({ address: e.target.value })}
      />

      <div className="rail-divider my-3.5 text-[10px] uppercase tracking-[0.1em]">or</div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={label} htmlFor="s-state">
            State
          </label>
          <input id="s-state" className={field} placeholder="WA" value={q.state} onChange={(e) => set({ state: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="s-county">
            County
          </label>
          <input id="s-county" className={field} placeholder="King" value={q.county} onChange={(e) => set({ county: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="s-zip">
            Zip
          </label>
          <input id="s-zip" className={field} placeholder="98033" value={q.zip} onChange={(e) => set({ zip: e.target.value })} />
        </div>
      </div>

      <label className={label} htmlFor="s-apn">
        APN
      </label>
      <input id="s-apn" className={field} placeholder="Parcel number" value={q.apn} onChange={(e) => set({ apn: e.target.value })} />

      <label className={label} htmlFor="s-owner">
        Assessed owner
      </label>
      <input id="s-owner" className={field} placeholder="Owner name" value={q.owner} onChange={(e) => set({ owner: e.target.value })} />

      <label className={label} htmlFor="s-sub">
        Subdivision / tract
      </label>
      <input
        id="s-sub"
        className={field}
        placeholder="e.g. Encore at Rose Hill"
        value={q.subdivision}
        onChange={(e) => set({ subdivision: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={label} htmlFor="s-block">
            Block
          </label>
          <input id="s-block" className={field} placeholder="optional" value={q.block} onChange={(e) => set({ block: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="s-lot">
            Lot
          </label>
          <input id="s-lot" className={field} placeholder="optional" value={q.lot} onChange={(e) => set({ lot: e.target.value })} />
        </div>
      </div>

      <label className={label}>Starter type</label>
      <div className="mt-1.5 flex gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set({ type: t })}
            className={`flex-1 rounded-md border px-2 py-1.5 text-[11.5px] font-medium transition ${
              q.type === t
                ? 'border-brand/50 bg-brand-soft text-brand-bright'
                : 'border-stroke bg-surface-2 text-ink-secondary hover:border-stroke-strong hover:text-ink-primary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => onSearch(q)}
        className="mt-5 w-full rounded-lg bg-gradient-to-b from-brand-bright to-brand py-2.5 text-[13px] font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50 disabled:shadow-none"
      >
        {loading ? 'Searching…' : 'Search Vault'}
      </button>

      <button
        type="button"
        onClick={onFileNew}
        className="mt-2.5 w-full rounded-lg border border-dashed border-stroke-strong bg-transparent py-2 text-[12px] font-semibold text-ink-secondary transition hover:border-brand/50 hover:text-brand-bright"
      >
        + File a New Starter
      </button>
    </aside>
  );
}
