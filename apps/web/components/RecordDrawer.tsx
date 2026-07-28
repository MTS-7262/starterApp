'use client';

import { useRef, useState } from 'react';
import { StarterRecord } from '../lib/types';

function fmtMoney(v: string) {
  if (!v) return '—';
  const num = parseFloat(v.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(num)) return v;
  return '$' + num.toLocaleString();
}

function fmtBytes(n: number) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-[0.08em] text-ink-muted">{k}</div>
      <div className="mt-0.5 text-[13.5px] text-ink-primary">{v || '—'}</div>
    </div>
  );
}

export default function RecordDrawer({
  record,
  onClose,
  onChanged,
  onDeleted,
  onToast
}: {
  record: StarterRecord;
  onClose: () => void;
  onChanged: (r: StarterRecord) => void;
  onDeleted: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files can be filed against a record.');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('recordId', record.id);
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      onChanged(data.record);
      onToast('PDF filed against this record.');
    } catch (e: any) {
      setError(e.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function removePdf() {
    if (!confirm('Remove the filed PDF from this record?')) return;
    const res = await fetch(`/api/pdf/${record.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      onChanged(data.record);
      onToast('PDF removed.');
    }
  }

  async function deleteRecord() {
    if (!confirm('Permanently delete this starter and any filed PDF? This cannot be undone.')) return;
    const res = await fetch(`/api/records/${record.id}`, { method: 'DELETE' });
    if (res.ok) {
      onDeleted(record.id);
      onToast('Starter removed from the vault.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pop-in flex h-full w-full max-w-[480px] flex-col overflow-y-auto border-l border-stroke bg-surface-1 shadow-popover">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-stroke bg-surface-1/95 px-6 py-5 backdrop-blur">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
              {record.type} · {record.id}
            </div>
            <h2 className="font-display text-[18px] font-semibold text-ink-primary">{record.address || 'Untitled starter'}</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-stroke text-ink-muted transition hover:border-stroke-strong hover:text-ink-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 px-6 py-5">
          {/* PDF panel — the core action of this drawer */}
          <div className="rail-divider mb-3 text-[10px] uppercase tracking-[0.1em]">Filed Document</div>
          <div className="rounded-xl border border-stroke bg-surface-2 p-4 shadow-card">
            {record.pdf ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-9 shrink-0 place-items-center rounded-md border border-brand/30 bg-brand-soft font-mono text-[9px] font-bold text-brand-bright">
                    PDF
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-ink-primary">{record.pdf.originalName}</div>
                    <div className="font-mono text-[10.5px] text-ink-muted">
                      {fmtBytes(record.pdf.size)} · filed {new Date(record.pdf.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`/api/pdf/${record.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-lg bg-gradient-to-b from-brand-bright to-brand py-2 text-center text-[12.5px] font-semibold text-white shadow-glow transition hover:brightness-110"
                  >
                    View PDF
                  </a>
                  <button
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                    className="flex-1 rounded-lg border border-stroke bg-surface-3 py-2 text-[12.5px] font-semibold text-ink-primary transition hover:border-stroke-strong disabled:opacity-60"
                  >
                    {uploading ? 'Uploading…' : 'Replace'}
                  </button>
                  <button
                    onClick={removePdf}
                    className="rounded-lg border border-stroke px-3 text-[12.5px] font-semibold text-danger transition hover:border-danger/40 hover:bg-danger-soft"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stroke-strong bg-surface-1/60 px-4 py-6 text-center"
              >
                <p className="text-[13px] text-ink-primary">No PDF filed against this starter yet.</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">Drag a PDF here, or</p>
                <button
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="mt-3 rounded-lg bg-gradient-to-b from-brand-bright to-brand px-4 py-2 text-[12.5px] font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60"
                >
                  {uploading ? 'Uploading…' : 'Upload PDF'}
                </button>
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
          </div>

          <div className="rail-divider mb-3 mt-6 text-[10px] uppercase tracking-[0.1em]">Property Details</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Field k="Address" v={record.address} />
            <Field k="APN" v={record.apn} />
            <Field k="Assessed Owner" v={record.owner} />
            <Field k="Title Company" v={record.titleco} />
            <Field k="City / State" v={[record.city, record.state].filter(Boolean).join(', ')} />
            <Field k="County / Zip" v={[record.county, record.zip].filter(Boolean).join(' · ')} />
          </div>

          <div className="rail-divider mb-3 mt-6 text-[10px] uppercase tracking-[0.1em]">Starter Legal</div>
          <div className="rounded-lg border border-stroke bg-surface-2 p-3 text-[13px] leading-relaxed text-ink-secondary">
            {record.legal || 'No legal description on file.'}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <Field k="Block / Lot" v={`${record.block || '—'} / ${record.lot || '—'}`} />
            <Field k="Subdivision / Tract" v={record.subdivision} />
          </div>

          <div className="rail-divider mb-3 mt-6 text-[10px] uppercase tracking-[0.1em]">Policy</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Field k="Policy / Doc No." v={record.policy} />
            <Field k="Date" v={record.date} />
            <Field k="Amount" v={fmtMoney(record.amount)} />
          </div>

          <div className="rail-divider mb-3 mt-6 text-[10px] uppercase tracking-[0.1em]">Schedule B / Notes</div>
          <div className="rounded-lg border border-stroke bg-surface-2 p-3 text-[13px] leading-relaxed text-ink-secondary">
            {record.notes || 'No notes on file.'}
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end border-t border-stroke bg-surface-1/95 px-6 py-4 backdrop-blur">
          <button onClick={deleteRecord} className="text-[12px] font-medium text-ink-muted transition hover:text-danger">
            Delete this starter
          </button>
        </div>
      </div>
    </div>
  );
}
