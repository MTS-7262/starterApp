'use client';

import { useCallback, useState } from 'react';
import Header from '../components/Header';
import SearchRail from '../components/SearchRail';
import ResultsPanel from '../components/ResultsPanel';
import RecordDrawer from '../components/RecordDrawer';
import NewRecordModal from '../components/NewRecordModal';
import Toast from '../components/Toast';
import { MatchedRecord, MatchTier, SearchQuery, StarterRecord } from '../lib/types';

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
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });
      const data = await res.json();
      setExact(data.exact || []);
      setRelated(data.related || []);
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
    const res = await fetch(`/api/records/${id}`);
    const data = await res.json();
    if (res.ok) setDrawerRecord(data.record);
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
    <main className="min-h-screen bg-surface-0">
      <Header />

      <div className="mx-auto flex max-w-[1240px] gap-6 px-6 py-6">
        <SearchRail onSearch={runSearch} onReset={resetSearch} onFileNew={() => setNewModalOpen(true)} loading={loading} />
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
      </div>

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
