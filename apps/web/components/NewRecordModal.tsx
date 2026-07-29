'use client';

import { StarterRecord, StarterType } from '@repo/api';
import { useState } from 'react';

const empty = {
  type: 'Owner' as StarterType,
  address: '',
  city: '',
  state: '',
  county: '',
  zip: '',
  apn: '',
  owner: '',
  subdivision: '',
  block: '',
  lot: '',
  titleco: '',
  amount: '',
  policy: '',
  date: '',
  legal: '',
  notes: ''
};

export default function NewRecordModal({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: (r: StarterRecord) => void;
}) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof empty>) => setForm((p) => ({ ...p, ...patch }));

  const input =
    'w-full rounded-lg border border-[#253342] bg-[#0e161d] px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-teal-400 transition-colors';
  
  const label = 'mb-1.5 mt-3 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400';

  async function submit() {
    if (!form.address.trim() && !form.apn.trim()) {
      setError('Enter at least an address or APN.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not file starter.');
      onCreated(data.record);
    } catch (e: any) {
      setError(e.message);
    } finally {
      // setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pop-in max-h-[88vh] w-full max-w-140 overflow-y-auto rounded-2xl border border-[#293847] bg-[#16212b] p-6 shadow-2xl drop-shadow-[0_0_5px_rgba(45,212,191,0.4)]">
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-sans text-[17px] font-bold text-slate-100">File a New Starter</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-full border border-[#253342] bg-[#1a2530] text-slate-400 transition hover:border-slate-500 hover:text-slate-100"
          >
            ✕
          </button>
        </div>
        <p className="text-[12px] text-slate-400">
          Add a new record to the vault, then file a PDF against it from its detail card.
        </p>

        {/* Type Select */}
        <label className={label}>Type</label>
        <select
          className={input}
          value={form.type}
          onChange={(e) => set({ type: e.target.value as StarterType })}
        >
          <option className="bg-[#0e161d] text-slate-100">Owner</option>
          <option className="bg-[#0e161d] text-slate-100">Lender</option>
          <option className="bg-[#0e161d] text-slate-100">Commitment</option>
        </select>

        {/* Address */}
        <label className={label}>Address</label>
        <input
          className={input}
          placeholder="Street address"
          value={form.address}
          onChange={(e) => set({ address: e.target.value })}
        />

        {/* City / State / Zip */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <label className={label}>City</label>
            <input className={input} value={form.city} onChange={(e) => set({ city: e.target.value })} />
          </div>
          <div>
            <label className={label}>State</label>
            <input className={input} value={form.state} onChange={(e) => set({ state: e.target.value })} />
          </div>
          <div>
            <label className={label}>Zip</label>
            <input className={input} value={form.zip} onChange={(e) => set({ zip: e.target.value })} />
          </div>
        </div>

        {/* County / APN */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label}>County</label>
            <input className={input} value={form.county} onChange={(e) => set({ county: e.target.value })} />
          </div>
          <div>
            <label className={label}>APN</label>
            <input className={input} value={form.apn} onChange={(e) => set({ apn: e.target.value })} />
          </div>
        </div>

        {/* Assessed Owner */}
        <label className={label}>Assessed Owner</label>
        <input className={input} value={form.owner} onChange={(e) => set({ owner: e.target.value })} />

        {/* Subdivision / Block / Lot */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={label}>Subdivision/Tract</label>
            <input className={input} value={form.subdivision} onChange={(e) => set({ subdivision: e.target.value })} />
          </div>
          <div>
            <label className={label}>Block</label>
            <input className={input} value={form.block} onChange={(e) => set({ block: e.target.value })} />
          </div>
          <div>
            <label className={label}>Lot</label>
            <input className={input} value={form.lot} onChange={(e) => set({ lot: e.target.value })} />
          </div>
        </div>

        {/* Title Company / Amount */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label}>Title Company</label>
            <input className={input} value={form.titleco} onChange={(e) => set({ titleco: e.target.value })} />
          </div>
          <div>
            <label className={label}>Amount</label>
            <input className={input} placeholder="1,400,000" value={form.amount} onChange={(e) => set({ amount: e.target.value })} />
          </div>
        </div>

        {/* Policy / Date */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label}>Policy / Doc Number</label>
            <input className={input} value={form.policy} onChange={(e) => set({ policy: e.target.value })} />
          </div>
          <div>
            <label className={label}>Date</label>
            <input type="date" className={`${input} [color-scheme:dark]`} value={form.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
        </div>

        {/* Starter Legal */}
        <label className={label}>Starter Legal</label>
        <input
          className={input}
          placeholder="Lot 13 of Encore at Rose Hill according to plat recorded..."
          value={form.legal}
          onChange={(e) => set({ legal: e.target.value })}
        />

        {/* Notes */}
        <label className={label}>Notes / Schedule B</label>
        <input className={input} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />

        {/* Error Message */}
        {error && <p className="mt-3 text-[12px] font-medium text-red-400">{error}</p>}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#253342] bg-[#1a2530] px-4 py-2 text-[13px] font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-lg bg-[#165a63] px-4 py-2 text-[13px] font-semibold text-cyan-50 shadow-md transition hover:bg-[#1b6b76] active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? 'Filing…' : 'File Starter'}
          </button>
        </div>
      </div>
    </div>
  );
}