'use client';

import { useState } from 'react';
import { StarterRecord, StarterType } from '../lib/types';

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
    'w-full rounded-lg border border-stroke bg-surface-3 px-3 py-2 text-[13px] text-ink-primary outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/20';
  const label = 'mb-1.5 mt-3 block text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted';

  async function submit() {
    if (!form.address.trim() && !form.apn.trim()) {
      setError('Enter at least an address or APN.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/records', {
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
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pop-in max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-stroke bg-surface-1 p-6 shadow-popover">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-display text-[17px] font-semibold text-ink-primary">File a New Starter</h3>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-full border border-stroke text-ink-muted hover:border-stroke-strong hover:text-ink-primary"
          >
            ✕
          </button>
        </div>
        <p className="text-[12px] text-ink-muted">Add a new record to the vault, then file a PDF against it from its detail card.</p>

        <label className={label}>Type</label>
        <select className={input} value={form.type} onChange={(e) => set({ type: e.target.value as StarterType })}>
          <option>Owner</option>
          <option>Lender</option>
          <option>Commitment</option>
        </select>

        <label className={label}>Address</label>
        <input className={input} placeholder="Street address" value={form.address} onChange={(e) => set({ address: e.target.value })} />

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

        <label className={label}>Assessed Owner</label>
        <input className={input} value={form.owner} onChange={(e) => set({ owner: e.target.value })} />

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

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label}>Policy / Doc Number</label>
            <input className={input} value={form.policy} onChange={(e) => set({ policy: e.target.value })} />
          </div>
          <div>
            <label className={label}>Date</label>
            <input type="date" className={input} value={form.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
        </div>

        <label className={label}>Starter Legal</label>
        <input
          className={input}
          placeholder="Lot 13 of Encore at Rose Hill according to plat recorded..."
          value={form.legal}
          onChange={(e) => set({ legal: e.target.value })}
        />

        <label className={label}>Notes / Schedule B</label>
        <input className={input} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />

        {error && <p className="mt-3 text-[12px] text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-stroke px-4 py-2 text-[13px] font-semibold text-ink-primary hover:border-stroke-strong">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-lg bg-gradient-to-b from-brand-bright to-brand px-4 py-2 text-[13px] font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'Filing…' : 'File Starter'}
          </button>
        </div>
      </div>
    </div>
  );
}
