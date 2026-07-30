'use client';

import { useRef, useState } from 'react';
import StampBadge from './StampBadge';
import { StarterRecord } from '@repo/api';

function fmtMoney(v: string) {
  if (!v) return '—';
  const num = parseFloat(v.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(num)) return v;
  return '$' + num.toLocaleString();
}

function fmtBytes(n?: number) {
  if (!n) return '—';
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {k}
      </div>
      <div className="mt-0.5 truncate text-[13.5px] font-medium text-slate-200">
        {v || '—'}
      </div>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="mb-3 mt-6 border-b border-[#253342] pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
      {title}
    </div>
  );
}

export default function RecordDrawer({
  record,
  onClose,
  onChanged,
  onDeleted,
  onToast,
}: {
  record: StarterRecord & { pdfUrl?: string | null };
  onClose: () => void;
  onChanged: (r: StarterRecord) => void;
  onDeleted: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // <-- Track percentage (0-100)
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files can be filed against a record.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const form = new FormData();
      form.append('file', file);

      // Wrap XMLHttpRequest in a Promise to get real-time upload progress
      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${process.env.NEXT_PUBLIC_BASE_URL}/starter/${record.id}/uploadpdf`);

        // Track upload progress percentage
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          let responseJson = {};
          try {
            responseJson = JSON.parse(xhr.responseText);
          } catch (e) {}

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(responseJson);
          } else {
            reject(
              new Error(
                (responseJson as any).message ||
                  (responseJson as any).error ||
                  'Upload failed.',
              ),
            );
          }
        };

        xhr.onerror = () => reject(new Error('Network error during file upload.'));

        xhr.send(form);
      });

      // Merge updated record data and presigned URL
      const updatedRecord = {
        ...(data.record || record),
        pdfUrl: data.presignedUrl,
      };

      onChanged(updatedRecord);
      onToast('PDF filed against this record.');
    } catch (e: any) {
      setError(e.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function removePdf() {
    if (!confirm('Remove the filed PDF from this record?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/starter/${record.id}/pdf`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      onChanged(data.record);
      onToast('PDF removed.');
    }
  }

  async function deleteRecord() {
    if (!confirm('Permanently delete this starter and any filed PDF? This cannot be undone.')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/starter/${record.id}`, { method: 'DELETE' });
    if (res.ok) {
      onDeleted(record.id);
      onToast('Starter removed from the vault.');
    }
  }

  const pdfFileName =
    typeof record.pdf === 'object' && record.pdf !== null
      ? (record.pdf as any).originalName
      : 'Document.pdf';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-full w-full max-w-120 flex-col overflow-y-auto border-l border-[#253342] bg-[#111a22] text-slate-100 shadow-2xl">
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#253342] bg-[#111a22]/95 px-6 py-5 backdrop-blur">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <span>{record.type}</span>
              <span>·</span>
              <span>{record.id}</span>
            </div>
            <h2 className="mt-1 font-sans text-[18px] font-bold leading-snug text-slate-100">
              {record.address || 'Untitled starter'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <StampBadge
              label={record.pdf ? 'Filed' : 'Pending PDF'}
              tone={record.pdf ? 'filed' : 'pending'}
            />
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-[#253342] bg-[#16212b] text-slate-400 transition hover:border-slate-500 hover:text-slate-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 px-6 py-5">
          {/* PDF Panel */}
          <SectionDivider title="Filed Document" />
          <div className="rounded-xl border border-[#253342] bg-[#16212b] p-4 shadow-lg">
            {record.pdf ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-10 shrink-0 place-items-center rounded-lg border border-teal-500/30 bg-teal-950/60 font-mono text-[10px] font-bold text-teal-300">
                    PDF
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold text-slate-100">
                      {pdfFileName}
                    </div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-slate-400">
                      {typeof record.pdf === 'object' && (record.pdf as any)?.size
                        ? `${fmtBytes((record.pdf as any).size)} · `
                        : ''}
                      filed {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Progress Bar for Replace */}
                {uploading && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0d141b]">
                      <div
                        className="h-full bg-teal-500 transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <a
                    href={record.pdfUrl || '#'}
                    className={`flex-1 rounded-lg bg-teal-600 py-2 text-center text-[12.5px] font-semibold text-white shadow-[0_0_12px_rgba(45,212,191,0.25)] transition hover:bg-teal-500 ${
                      !record.pdfUrl ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    View PDF
                  </a>
                  <button
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                    className="flex-1 rounded-lg border border-[#253342] bg-[#1e2c3a] py-2 text-[12.5px] font-semibold text-slate-200 transition hover:border-slate-500 disabled:opacity-60"
                  >
                    {uploading ? `Uploading ${uploadProgress}%` : 'Replace'}
                  </button>
                  <button
                    onClick={removePdf}
                    disabled={uploading}
                    className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 text-[12.5px] font-semibold text-red-400 transition hover:border-red-500/60 hover:bg-red-900/50 disabled:opacity-60"
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
                className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#253342] bg-[#0d141b] px-4 py-6 text-center"
              >
                <p className="text-[13px] font-medium text-slate-200">
                  No PDF filed against this starter yet.
                </p>
                <p className="mt-0.5 text-[11.5px] text-slate-400">
                  Drag a PDF here, or
                </p>

                {/* Progress Bar for Initial Upload */}
                {uploading && (
                  <div className="mt-3 w-full max-w-xs">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#16212b]">
                      <div
                        className="h-full bg-teal-500 transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_0_12px_rgba(45,212,191,0.25)] transition hover:bg-teal-500 disabled:opacity-60"
                >
                  {uploading ? `Uploading ${uploadProgress}%` : 'Upload PDF'}
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
            {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
          </div>

          {/* Property Details */}
          <SectionDivider title="Property Details" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Field k="Address" v={record.address} />
            <Field k="APN" v={record.apn} />
            <Field k="Assessed Owner" v={record.owner} />
            <Field k="Title Company" v={record.titleco} />
            <Field
              k="City / State"
              v={[record.city, record.state].filter(Boolean).join(', ')}
            />
            <Field
              k="County / Zip"
              v={[record.county, record.zip].filter(Boolean).join(' · ')}
            />
          </div>

          {/* Legal Description */}
          <SectionDivider title="Starter Legal" />
          <div className="rounded-lg border border-[#253342] bg-[#0d141b] p-3 text-[13px] leading-relaxed text-slate-300">
            {record.legal || 'No legal description on file.'}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <Field
              k="Block / Lot"
              v={`${record.block || '—'} / ${record.lot || '—'}`}
            />
            <Field k="Subdivision / Tract" v={record.subdivision} />
          </div>

          {/* Policy */}
          <SectionDivider title="Policy Information" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Field k="Policy / Doc No." v={record.policy} />
            <Field k="Date" v={record.date} />
            <Field k="Amount" v={fmtMoney(record.amount)} />
          </div>

          {/* Notes */}
          <SectionDivider title="Schedule B / Notes" />
          <div className="rounded-lg border border-[#253342] bg-[#0d141b] p-3 text-[13px] leading-relaxed text-slate-300">
            {record.notes || 'No notes on file.'}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="sticky bottom-0 flex justify-end border-t border-[#253342] bg-[#111a22]/95 px-6 py-4 backdrop-blur">
          <button
            onClick={deleteRecord}
            className="text-[12px] font-semibold text-slate-400 transition hover:text-red-400"
          >
            Delete this starter
          </button>
        </div>
      </div>
    </div>
  );
}