'use client';

import { useCallback, useState } from 'react';
import Header from '../components/Header';
import SearchRail from '../components/SearchRail';
import ResultsPanel from '../components/ResultsPanel';
import MapView from '../components/MapView';
import RecordDrawer from '../components/RecordDrawer';
import NewRecordModal from '../components/NewRecordModal';
import Toast from '../components/Toast';
import { MatchedRecord, MatchTier, SearchQuery, StarterRecord, StarterType } from '@repo/api';

function summarize(q: SearchQuery): string {
  const parts: string[] = [];
  if (q.address) parts.push(`Address: ${q.address}`);
  if (q.apn) parts.push(`APN: ${q.apn}`);
  if (q.owner) parts.push(`Owner: ${q.owner}`);
  if (q.subdivision) parts.push(`Subdivision: ${q.subdivision}`);
  if (q.block) parts.push(`Block: ${q.block}`);
  if (q.lot) parts.push(`Lot: ${q.lot}`);
  if (q.zip) parts.push(`Zip: ${q.zip}`);
  if (q.county) parts.push(`County: ${q.county}`);
  if (q.state) parts.push(`State: ${q.state}`);
  return parts.join('  ·  ');
}

export default function Home() {
  const [exact, setExact] = useState<MatchedRecord[]>([]);
  const [related, setRelated] = useState<MatchedRecord[]>([]);
  const [activeTab, setActiveTab] = useState<MatchTier>('exact');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid'); // Added View Switch Mode
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [criteria, setCriteria] = useState('');
  const [lastQuery, setLastQuery] = useState<SearchQuery | null>(null);

  const [drawerRecord, setDrawerRecord] = useState<StarterRecord | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 2400);
  }, []);

  async function runSearch(query: SearchQuery) {
    setLoading(true);
    setHasSearched(true);
    setCriteria(summarize(query));
    setLastQuery(query);
    try {
      const res = await fetch('http://localhost:3000/starter/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });

      const data = await res.json();

      setExact(data.exact || []);
      setRelated(data.related|| data.nearest || []);
      setActiveTab((data.exact || []).length > 0 || (data.related || []).length === 0 ? 'exact' : 'related');
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setExact([]);
    setRelated([]);
    setHasSearched(false);
    setCriteria('');
    setLastQuery(null);
    setActiveTab('exact');
  }

  async function openRecord(id: string) {
    const records = [...exact, ...related];
    const rawData = records.find((r) => r.id === id);

    const record: StarterRecord | null = rawData
      ? {
        id: rawData.id,
        type: rawData.type as StarterType,
        address: rawData.address ?? '',
        city: rawData.city ?? '',
        state: rawData.state ?? '',
        county: rawData.county ?? '',
        zip: rawData.zip ?? '',
        apn: rawData.apn ?? '',
        owner: rawData.owner ?? '',
        subdivision: rawData.subdivision ?? '',
        block: rawData.block ?? '',
        lot: rawData.lot ?? '',
        titleco: rawData.titleco ?? '',
        amount: rawData.amount ?? '',
        policy: rawData.policy ?? '',
        date: rawData.date ?? '',
        legal: rawData.legal ?? '',
        notes: rawData.notes ?? '',
        filed: Boolean(rawData.filed),
        latitude: rawData.latitude ?? null,
        longitude: rawData.longitude ?? null,
        createdAt:
          typeof rawData.createdAt === 'number'
            ? rawData.createdAt
            : new Date(rawData.createdAt).getTime(),
        pdf: rawData.pdf ? (rawData.pdf as StarterRecord['pdf']) : null,
      }
      : null;

    setDrawerRecord(record);
  }

  function patchRecordInResults(updated: StarterRecord) {
    setExact((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setRelated((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setDrawerRecord((prev) => (prev && prev.id === updated.id ? updated : prev));
  }

  function removeRecordFromResults(id: string) {
    setExact((prev) => prev.filter((r) => r.id !== id));
    setRelated((prev) => prev.filter((r) => r.id !== id));
    setDrawerRecord(null);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#1a2530] font-sans antialiased text-slate-100">
      {/* Central Radial Slate Lighting Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_25%,#263545_0%,#1a2430_60%,#121b24_100%)]" />

      {/* Main UI Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-6 py-6">
          <SearchRail
            onSearch={runSearch}
            onReset={resetSearch}
            onFileNew={() => setNewModalOpen(true)}
            loading={loading}
          />

          <div className="flex-1 flex flex-col gap-3">
            {/* View Mode Toggle Bar */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'border border-[#253342] bg-[#16212b] text-slate-400 hover:text-slate-100'
                }`}
              >
                Grid View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                  viewMode === 'map'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'border border-[#253342] bg-[#16212b] text-slate-400 hover:text-slate-100'
                }`}
              >
                Map View
              </button>
            </div>

            {/* Display Mode Switcher */}
            {viewMode === 'grid' ? (
              <ResultsPanel
                exact={exact}
                related={related}
                loading={loading}
                hasSearched={hasSearched}
                criteria={criteria}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenRecord={openRecord}
              />
            ) : (
              <MapView exact={exact} related={related} onOpenRecord={openRecord} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Right Sparkle Star Accent */}
      <svg
        className="pointer-events-none fixed bottom-12 right-12 h-10 w-10 text-[#4c5f73]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>

      {/* Overlays & Drawers */}
      {drawerRecord && (
        <RecordDrawer
          record={drawerRecord}
          onClose={() => setDrawerRecord(null)}
          onChanged={patchRecordInResults}
          onDeleted={removeRecordFromResults}
          onToast={showToast}
        />
      )}

      {newModalOpen && (
        <NewRecordModal
          onClose={() => setNewModalOpen(false)}
          onCreated={(r) => {
            setNewModalOpen(false);
            showToast('Starter filed to the vault.');
            if (lastQuery) runSearch(lastQuery);
          }}
        />
      )}

      <Toast message={toast} />
    </main>
  );
}