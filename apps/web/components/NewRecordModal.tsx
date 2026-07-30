'use client';

import { StarterRecord } from '@repo/api';
import { useState } from 'react';

const emptyForm = {
  address: '',
  city: '',
  state: '',
  county: '',
  zip: '',
  apn: '',
  owner: '',
  legalUnit: '',
  legalLotNumber: '',
  legalDistrict: '',
  legalBriefDescription: '',
  latitude: '',
  longitude: '',
  exowners: '', // Comma-separated string in form UI
};

export default function NewRecordModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (r: StarterRecord) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof emptyForm>) =>
    setForm((p) => ({ ...p, ...patch }));

  const input =
    'w-full rounded-lg border border-[#253342] bg-[#0e161d] px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-teal-400 transition-colors';

  const label =
    'mb-1.5 mt-3 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400';

  async function submit() {
    if (!form.address.trim() && !form.apn.trim()) {
      setError('Enter at least an address or APN.');
      return;
    }
    setSaving(true);
    setError(null);

    // Format form state to match Prisma StarterRecord Schema
    const payload = {
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      county: form.county.trim() || null,
      zip: form.zip.trim() || null,
      apn: form.apn.trim() || null,
      owner: form.owner.trim() || null,
      legalUnit: form.legalUnit.trim() || null,
      legalLotNumber: form.legalLotNumber ? parseInt(form.legalLotNumber, 10) : null,
      legalDistrict: form.legalDistrict ? parseInt(form.legalDistrict, 10) : null,
      legalBriefDescription: form.legalBriefDescription.trim() || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      exowners: form.exowners
        ? form.exowners
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/starter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Could not file starter.');
      
      onCreated(data.record || data);
    } catch (e: any) {
      setError(e.message || 'An error occurred during filing.');
    } finally {
      setSaving(false);
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
          <h3 className="font-sans text-[17px] font-bold text-slate-100">
            File a New Starter Record
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-full border border-[#253342] bg-[#1a2530] text-slate-400 transition hover:border-slate-500 hover:text-slate-100"
          >
            ✕
          </button>
        </div>
        <p className="text-[12px] text-slate-400">
          Add a new starter record to the vault, then upload a PDF against it from its detail card.
        </p>

        {/* Property Address */}
        <label className={label}>Address</label>
        <input
          className={input}
          placeholder="123 Main St"
          value={form.address}
          onChange={(e) => set({ address: e.target.value })}
        />

        {/* City / State / Zip */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <label className={label}>City</label>
            <input
              className={input}
              placeholder="Seattle"
              value={form.city}
              onChange={(e) => set({ city: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>State</label>
            <input
              className={input}
              placeholder="WA"
              value={form.state}
              onChange={(e) => set({ state: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Zip</label>
            <input
              className={input}
              placeholder="98101"
              value={form.zip}
              onChange={(e) => set({ zip: e.target.value })}
            />
          </div>
        </div>

        {/* County / APN */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label}>County</label>
            <input
              className={input}
              placeholder="King"
              value={form.county}
              onChange={(e) => set({ county: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>APN</label>
            <input
              className={input}
              placeholder="123-456-789"
              value={form.apn}
              onChange={(e) => set({ apn: e.target.value })}
            />
          </div>
        </div>

        {/* Assessed Owner */}
        <label className={label}>Assessed Owner</label>
        <input
          className={input}
          placeholder="John Doe"
          value={form.owner}
          onChange={(e) => set({ owner: e.target.value })}
        />

        {/* Former / Ex-Owners */}
        <label className={label}>Former Owners (Ex-owners)</label>
        <input
          className={input}
          placeholder="Jane Doe, Robert Smith (comma-separated)"
          value={form.exowners}
          onChange={(e) => set({ exowners: e.target.value })}
        />

        {/* Legal Info: Unit / Lot / District */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={label}>Legal Unit</label>
            <input
              className={input}
              placeholder="Unit A"
              value={form.legalUnit}
              onChange={(e) => set({ legalUnit: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Legal Lot #</label>
            <input
              type="number"
              className={input}
              placeholder="12"
              value={form.legalLotNumber}
              onChange={(e) => set({ legalLotNumber: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Legal District #</label>
            <input
              type="number"
              className={input}
              placeholder="4"
              value={form.legalDistrict}
              onChange={(e) => set({ legalDistrict: e.target.value })}
            />
          </div>
        </div>

        {/* Starter Legal Description */}
        <label className={label}>Legal Brief Description</label>
        <textarea
          rows={3}
          className={`${input} resize-none`}
          placeholder="Lot 13 of Encore at Rose Hill according to plat recorded..."
          value={form.legalBriefDescription}
          onChange={(e) => set({ legalBriefDescription: e.target.value })}
        />

        {/* Coordinates: Latitude / Longitude */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={label}>Latitude</label>
            <input
              type="number"
              step="any"
              className={input}
              placeholder="47.6062"
              value={form.latitude}
              onChange={(e) => set({ latitude: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Longitude</label>
            <input
              type="number"
              step="any"
              className={input}
              placeholder="-122.3321"
              value={form.longitude}
              onChange={(e) => set({ longitude: e.target.value })}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-3 text-[12px] font-medium text-red-400">{error}</p>
        )}

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