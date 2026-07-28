// ---------------------------------------------------------------------------
// Data access layer. Every function below is the ONLY place the rest of the
// app talks to storage — swap this file's internals for Prisma/Postgres,
// Supabase, Mongo, etc. later without touching any component or API route,
// as long as the exported function signatures (getAllRecords, getRecordById,
// createRecord, updateRecord, deleteRecord) stay the same.
// ---------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { StarterRecord } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'records.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const seed: StarterRecord[] = [
  {
    id: 'st_1001',
    type: 'Owner',
    address: '4412 Rose Hill Ave',
    city: 'Kirkland',
    state: 'WA',
    county: 'King',
    zip: '98033',
    apn: '322505-9142',
    owner: 'Marguerite & Theo Alvante',
    subdivision: 'Encore at Rose Hill',
    block: '3',
    lot: '13',
    titleco: 'Cascade Title & Escrow',
    amount: '1,400,000',
    policy: 'OP-2023-88410',
    date: '2023-06-02',
    legal: 'Lot 13, Block 3, Encore at Rose Hill, according to the plat thereof recorded under Recording No. 20180412000933, records of King County, Washington.',
    notes: 'Schedule B: Easement for public utilities per instrument 8809140221. HOA assessment lien released 2023.',
    filed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 400,
    pdf: null
  },
  {
    id: 'st_1002',
    type: 'Lender',
    address: '4420 Rose Hill Ave',
    city: 'Kirkland',
    state: 'WA',
    county: 'King',
    zip: '98033',
    apn: '322505-9143',
    owner: 'Priya Kestrel',
    subdivision: 'Encore at Rose Hill',
    block: '3',
    lot: '14',
    titleco: 'Cascade Title & Escrow',
    amount: '860,000',
    policy: 'LP-2024-10032',
    date: '2024-01-19',
    legal: 'Lot 14, Block 3, Encore at Rose Hill, according to the plat thereof recorded under Recording No. 20180412000933, records of King County, Washington.',
    notes: 'Deed of trust in favor of Meridian Home Lending, dated 2024-01-19.',
    filed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 180,
    pdf: null
  },
  {
    id: 'st_1003',
    type: 'Commitment',
    address: '118 Harborview Dr',
    city: 'Kirkland',
    state: 'WA',
    county: 'King',
    zip: '98033',
    apn: '198740-0210',
    owner: 'Declan Marchetti',
    subdivision: 'Harborview Terrace',
    block: '1',
    lot: '6',
    titleco: 'Cascade Title & Escrow',
    amount: '2,150,000',
    policy: 'CM-2025-00187',
    date: '2025-03-11',
    legal: 'Lot 6, Block 1, Harborview Terrace, according to the plat thereof recorded under Recording No. 20090710000441, records of King County, Washington.',
    notes: 'Pending: satisfaction of prior deed of trust required prior to close.',
    filed: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    pdf: null
  },
  {
    id: 'st_1004',
    type: 'Owner',
    address: '882 Overlook Ct',
    city: 'Bellevue',
    state: 'WA',
    county: 'King',
    zip: '98004',
    apn: '405610-3320',
    owner: 'Marguerite Alvante Trust',
    subdivision: 'Overlook Estates',
    block: '2',
    lot: '9',
    titleco: 'Pacific Rim Title',
    amount: '3,020,000',
    policy: 'OP-2022-55210',
    date: '2022-09-27',
    legal: 'Lot 9, Block 2, Overlook Estates, according to the plat thereof recorded under Recording No. 20050902000112, records of King County, Washington.',
    notes: 'Held in trust; successor trustee documentation on file.',
    filed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 900,
    pdf: null
  },
  {
    id: 'st_1005',
    type: 'Lender',
    address: '77 Rose Hill Cir',
    city: 'Kirkland',
    state: 'WA',
    county: 'King',
    zip: '98033',
    apn: '322505-9201',
    owner: 'Owen Falk',
    subdivision: 'Encore at Rose Hill',
    block: '5',
    lot: '2',
    titleco: 'Cascade Title & Escrow',
    amount: '910,000',
    policy: 'LP-2021-40021',
    date: '2021-11-04',
    legal: 'Lot 2, Block 5, Encore at Rose Hill, according to the plat thereof recorded under Recording No. 20180412000933, records of King County, Washington.',
    notes: 'Refinance; prior deed of trust reconveyed 2021-11-01.',
    filed: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1000,
    pdf: null
  }
];

function readAll(): StarterRecord[] {
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as StarterRecord[];
  } catch {
    return seed;
  }
}

function writeAll(records: StarterRecord[]) {
  ensureDirs();
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2));
}

export function getAllRecords(): StarterRecord[] {
  return readAll();
}

export function getRecordById(id: string): StarterRecord | undefined {
  return readAll().find((r) => r.id === id);
}

export function createRecord(record: StarterRecord): StarterRecord {
  const all = readAll();
  all.unshift(record);
  writeAll(all);
  return record;
}

// export function updateRecord(id: string, patch: Partial<StarterRecord>): StarterRecord | null {
//   const all = readAll();
//   const idx = all.findIndex((r) => r.id === id);
//   if (idx === -1) return null;
//   all[idx] = { ...all[idx], ...patch };
//   writeAll(all);
//   return all[idx];
// }

export function deleteRecord(id: string): boolean {
  const all = readAll();
  const next = all.filter((r) => r.id !== id);
  writeAll(next);
  return next.length !== all.length;
}
