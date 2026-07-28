'use client';

import { useState } from 'react';
import { SearchQuery, StarterType } from '../lib/types';

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
    'w-full rounded-lg border border-[#253342] bg-[#0e161d] px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30';

  const label = 'mb-1.5 mt-3.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400';

  return (
    <aside className="sticky top-19 h-fit w-75 shrink-0 rounded-2xl border border-[#293847] bg-[#16212b] p-5 shadow-2xl drop-shadow-[0_0_1px_rgba(45,212,191,0.4)]">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-sans text-[15px] font-bold text-slate-100">Search the Vault</h2>

        <button
          type="button"
          onClick={() => {
            setQ(emptyQuery);
            onReset();
          }}
          className="mt-2.5 w-20 rounded-xl border border-dashed border-gray-500/50 bg-teal-950/20 py-2 text-[12px] font-semibold text-gray-300 transition hover:border-gray-400 hover:bg-teal-900/30 hover:text-gray-200"
        >
          Reset
        </button>
      </div>

      {/* Subtitle */}
      <p className="mb-3 text-[11.5px] leading-snug text-slate-400">
        Search by identifier for an exact hit, or leave fields loose to surface related starters nearby.
      </p>

      {/* Address */}
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

      {/* OR Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#253342]" />
        <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">OR</span>
        <div className="h-px flex-1 bg-[#253342]" />
      </div>

      {/* State / County / Zip */}
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

      {/* APN */}
      <label className={label} htmlFor="s-apn">
        APN
      </label>
      <input id="s-apn" className={field} placeholder="Parcel number" value={q.apn} onChange={(e) => set({ apn: e.target.value })} />

      {/* Assessed Owner */}
      <label className={label} htmlFor="s-owner">
        Assessed owner
      </label>
      <input id="s-owner" className={field} placeholder="Owner name" value={q.owner} onChange={(e) => set({ owner: e.target.value })} />

      {/* Subdivision / Tract */}
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

      {/* Block / Lot */}
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

      {/* Starter Type */}
      <label className={label}>Starter type</label>
      <div className="mt-1.5 flex gap-1.5">
        {TYPES.map((t) => {
          const isSelected = q.type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => set({ type: t })}
              className={`flex-1 rounded-lg px-2 py-1.5 text-[11.5px] font-medium transition ${
                isSelected
                  ? 'border border-teal-500/50 bg-[#18646e] text-cyan-50 shadow-sm'
                  : 'border border-[#253342] bg-[#1a2530] text-slate-300 hover:border-slate-500 hover:text-slate-100'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Primary Action */}
      <button
        type="button"
        disabled={loading}
        onClick={() => onSearch(q)}
        className="mt-5 w-full rounded-xl bg-[#165a63] py-2.5 text-[13px] font-semibold text-cyan-50 shadow-md transition hover:bg-[#1b6b76] active:scale-[0.99] disabled:opacity-50"
      >
        {loading ? 'Searching…' : 'Search Vault'}
      </button>

      {/* Secondary Action */}
      <button
        type="button"
        onClick={onFileNew}
        className="mt-2.5 w-full rounded-xl border border-dashed border-teal-500/50 bg-teal-950/20 py-2 text-[12px] font-semibold text-teal-300 transition hover:border-teal-400 hover:bg-teal-900/30 hover:text-teal-200"
      >
        + File a New Starter
      </button>
    </aside>
  );
}