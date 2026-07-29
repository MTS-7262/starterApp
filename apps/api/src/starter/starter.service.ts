import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MatchedRecord, MatchTier, SearchQuery, StarterFilterResponse, StarterType } from '@repo/api';
import { Prisma, StarterRecord } from '@repo/database';
import { PrismaService } from 'src/prisma/prisma.service';

const FIRST_NAMES = [
  'Marguerite', 'Theo', 'Priya', 'Declan', 'Owen', 'Sarah', 'Marcus', 'Elena',
  'David', 'Sophia', 'James', 'Aisha', 'Carlos', 'Emily', 'Vikram', 'Rachel',
  'Julian', 'Nora', 'Alexander', 'Maya'
];

const LAST_NAMES = [
  'Alvante', 'Kestrel', 'Marchetti', 'Falk', 'Chen', 'Vargas', "O'Connor",
  'Patel', 'Washington', 'Kim', 'Gallagher', 'Novak', 'Gupta', 'Sinclair',
  'Reynolds', 'Mercer', 'Zhao', 'Thorne'
];

// Base coordinates typed as floats (number)
const LOCATIONS: { city: string; county: string; zip: string; lat: number; lng: number }[] = [
  { city: 'Kirkland', county: 'King', zip: '98033', lat: 47.6768, lng: -122.2060 },
  { city: 'Bellevue', county: 'King', zip: '98004', lat: 47.6101, lng: -122.2015 },
  { city: 'Seattle', county: 'King', zip: '98101', lat: 47.6062, lng: -122.3321 },
  { city: 'Redmond', county: 'King', zip: '98052', lat: 47.6740, lng: -122.1215 },
  { city: 'Renton', county: 'King', zip: '98055', lat: 47.4829, lng: -122.2171 },
  { city: 'Tacoma', county: 'Pierce', zip: '98402', lat: 47.2529, lng: -122.4443 },
  { city: 'Bothell', county: 'Snohomish', zip: '98012', lat: 47.7601, lng: -122.2054 },
  { city: 'Woodinville', county: 'King', zip: '98072', lat: 47.7543, lng: -122.0800 },
];

const STREET_NAMES = [
  'Rose Hill Ave', 'Harborview Dr', 'Overlook Ct', 'Crestview Way', 'Main St',
  'Bellevue Way', 'Lake Washington Blvd', 'Highland Dr', 'Pine St', 'Forest Ln',
  'Maple Ave', 'Summit Ridge Blvd', 'Viewridge Dr'
];

const SUBDIVISIONS = [
  'Encore at Rose Hill', 'Harborview Terrace', 'Overlook Estates',
  'Highland Park', 'Evergreen Ridge', 'Sunset Valley', 'Cascade Heights',
  'Pinecrest Crest'
];

const TITLE_COMPANIES = [
  'Cascade Title & Escrow', 'Pacific Rim Title', 'Evergreen Title Co.',
  'Northwest Escrow & Title', 'First American Title', 'Old Republic Title'
];

const NOTES_TEMPLATES = [
  'Schedule B: Easement for public utilities per instrument.',
  'Deed of trust in favor of Meridian Home Lending.',
  'Pending: satisfaction of prior deed of trust required prior to close.',
  'Held in trust; successor trustee documentation on file.',
  'Refinance; prior deed of trust reconveyed.',
  'Standard owner policy coverage without exceptions.',
  'Subject to CC&Rs recorded under King County recording no.'
];

function getRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function generateSeedData(count: number = 500): Prisma.StarterRecordCreateInput[] {
  const records: Prisma.StarterRecordCreateInput[] = [];

  for (let i = 1; i <= count; i++) {
    const idNum = 1000 + i;
    const location = getRandom(LOCATIONS);
    const streetNum = Math.floor(Math.random() * 8999) + 1000;
    const address = `${streetNum} ${getRandom(STREET_NAMES)}`;

    const types: ('Owner' | 'Lender' | 'Commitment')[] = ['Owner', 'Lender', 'Commitment'];
    const type = types[i % 3];

    const year = 2020 + (i % 6);
    const monthNum = (i % 12) + 1;
    const dayNum = (i % 28) + 1;
    const monthStr = String(monthNum).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const date = `${year}-${monthStr}-${dayStr}`;

    const prefixMap = { Owner: 'OP', Lender: 'LP', Commitment: 'CM' };
    const policy = `${prefixMap[type]}-${year}-${10000 + ((i * 137) % 89999)}`;

    const isJoint = i % 4 === 0;
    const ownerName = isJoint
      ? `${getRandom(FIRST_NAMES)} & ${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`
      : `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`;

    const block = String((i % 8) + 1);
    const lot = String((i % 25) + 1);
    const subdivision = getRandom(SUBDIVISIONS);

    const apnPart1 = Math.floor(100000 + (i * 311) % 899999);
    const apnPart2 = Math.floor(1000 + (i * 577) % 8999);
    const apn = `${apnPart1}-${apnPart2}`;

    const rawAmount = (Math.floor((i * 47) % 2500) + 450) * 1000;
    const amount = rawAmount.toLocaleString('en-US');

    const recNo = `${year}${monthStr}${dayStr}${String(100000 + ((i * 73) % 899999))}`;
    const legal = `Lot ${lot}, Block ${block}, ${subdivision}, according to the plat thereof recorded under Recording No. ${recNo}, records of ${location.county} County, Washington.`;

    // Calculate float offsets (~30-50m parcel gaps)
    const latOffset = (((i % 30) - 15) * 0.00035);
    const lngOffset = ((((i * 7) % 30) - 15) * 0.00035);

    // Guaranteed Float values (JS numbers are 64-bit floating point)
    const lat: number = parseFloat((location.lat + latOffset).toFixed(6));
    const lng: number = parseFloat((location.lng + lngOffset).toFixed(6));

    records.push({
      id: `st_${idNum}`,
      type,
      address,
      city: location.city,
      state: 'WA',
      county: location.county,
      zip: location.zip,
      apn,
      owner: ownerName,
      subdivision,
      block,
      lot,
      titleco: getRandom(TITLE_COMPANIES),
      amount,
      policy,
      date,
      legal,
      notes: NOTES_TEMPLATES[i % NOTES_TEMPLATES.length],
      filed: i % 5 !== 0,
      latitude: lat, // Float
      longitude: lng, // Float
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i * 2)),
    });
  }

  return records;
}

export const SEED_DATA: Prisma.StarterRecordCreateInput[] = generateSeedData(1000);
@Injectable()
export class StarterService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) { }

  async onModuleInit() {
    await this.seedDatabase();
  }

  async seedDatabase() {
    const count = await this.prisma.starterRecord.count();
    if (count === 0) {
      for (const record of SEED_DATA) {
        await this.prisma.starterRecord.upsert({
          where: { id: record.id },
          update: {},
          create: record,
        });
      }
      console.log('✅ Starter records successfully seeded into the database.');
    }
  }
  async create(data: Prisma.StarterRecordCreateInput): Promise<StarterRecord> {
    return this.prisma.starterRecord.create({
      data,
    });
  }

  getApnDifference(apn1: string, apn2: string): number {
    const n1 = parseInt(apn1.replace(/\D/g, ''), 10);
    const n2 = parseInt(apn2.replace(/\D/g, ''), 10);
    if (!isNaN(n1) && !isNaN(n2)) {
      return Math.abs(n1 - n2);
    }
    return apn1.toLowerCase() === apn2.toLowerCase() ? 0 : Infinity;
  }

  getDistanceInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async filter(query: SearchQuery): Promise<StarterFilterResponse> {
    if (
      !query.address &&
      !query.apn &&
      !query.owner &&
      !query.subdivision &&
      !query.block &&
      !query.lot &&
      !query.zip &&
      !query.county &&
      !query.state
    ) {
      return { exact: [], nearest: [], related: [] };
    }

    const where: Prisma.StarterRecordWhereInput = {};
    const apnSearch = query.apn?.trim();
    const ownerSearch = query.owner?.trim();

    if (query.address) where.address = { contains: query.address.trim(), mode: 'insensitive' };
    if (query.state) where.state = { equals: query.state.trim(), mode: 'insensitive' };
    if (query.county) where.county = { equals: query.county.trim(), mode: 'insensitive' };
    if (query.zip) where.zip = { equals: query.zip.trim(), mode: 'insensitive' };
    if (query.subdivision) where.subdivision = { contains: query.subdivision.trim(), mode: 'insensitive' };
    if (query.block) where.block = { equals: query.block.trim(), mode: 'insensitive' };
    if (query.lot) where.lot = { equals: query.lot.trim(), mode: 'insensitive' };
    if (query.type && query.type !== 'All') where.type = { equals: query.type, mode: 'insensitive' };

    // Note: Searching by APN prefix (or broad query) allows Prisma to fetch neighboring APNs
    // if an exact match isn't present in the DB.
    if (apnSearch) {
      const apnPrefix = apnSearch.length > 3 ? apnSearch.slice(0, -2) : apnSearch;
      where.apn = { contains: apnPrefix, mode: 'insensitive' };
    }
    if (ownerSearch) {
      where.owner = { contains: ownerSearch, mode: 'insensitive' };
    }

    const records = await this.prisma.starterRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      return { exact: [], nearest: [], related: [] };
    }

    const hasApnFilter = Boolean(apnSearch);
    const hasOwnerFilter = Boolean(ownerSearch);

    const exact: MatchedRecord[] = [];
    const nearest: MatchedRecord[] = [];
    const related: MatchedRecord[] = [];

    const mapToMatchedRecord = (
      rec: typeof records[0],
      tier: MatchTier,
      matchedOn: string[],
    ): MatchedRecord => ({
      id: rec.id,
      type: rec.type as StarterType,
      address: rec.address ?? '',
      city: rec.city ?? '',
      state: rec.state ?? '',
      county: rec.county ?? '',
      zip: rec.zip ?? '',
      apn: rec.apn ?? '',
      owner: rec.owner ?? '',
      subdivision: rec.subdivision ?? '',
      block: rec.block ?? '',
      lot: rec.lot ?? '',
      titleco: rec.titleco ?? '',
      amount: rec.amount ?? '',
      policy: rec.policy ?? '',
      date: rec.date ?? '',
      legal: rec.legal ?? '',
      notes: rec.notes ?? '',
      filed: Boolean(rec.filed),
      createdAt:
        typeof rec.createdAt === 'number'
          ? rec.createdAt
          : new Date(rec.createdAt).getTime(),
      pdf: rec.pdf ? (rec.pdf as MatchedRecord['pdf']) : null,
      tier,
      matchedOn,
      latitude: rec.latitude ?? null,
      longitude: rec.longitude ?? null,
    });

    // --------------------------------------------------------------------------
    // STEP 1: Check for Exact Matches on APN or Owner
    // --------------------------------------------------------------------------
    const exactRecords = records.filter((rec) => {
      const isApnExact =
        hasApnFilter && rec.apn?.trim().toLowerCase() === apnSearch!.toLowerCase();
      const isOwnerExact =
        hasOwnerFilter && rec.owner?.trim().toLowerCase() === ownerSearch!.toLowerCase();

      return isApnExact || isOwnerExact;
    });

    if (exactRecords.length > 0) {
      exactRecords.forEach((rec) => {
        const matchedOn: string[] = [];
        if (hasApnFilter && rec.apn?.trim().toLowerCase() === apnSearch!.toLowerCase()) {
          matchedOn.push('apn');
        }
        if (hasOwnerFilter && rec.owner?.trim().toLowerCase() === ownerSearch!.toLowerCase()) {
          matchedOn.push('owner');
        }
        exact.push(mapToMatchedRecord(rec, 'exact', matchedOn));
      });

      // Reference point: first exact match
      const refRecord = exactRecords[0];
      const exactIds = new Set(exactRecords.map((r) => r.id));
      const candidateRecords = records.filter((r) => !exactIds.has(r.id));

      if (refRecord.latitude != null && refRecord.longitude != null) {
        for (const rec of candidateRecords) {
          if (rec.latitude != null && rec.longitude != null) {
            const distance = this.getDistanceInMeters(
              refRecord.latitude,
              refRecord.longitude,
              rec.latitude,
              rec.longitude,
            );
            if (distance <= 250) {
              related.push(mapToMatchedRecord(rec, 'related', ['250m_radius']));
            }
          }
        }
      }

      return { exact, nearest: [], related };
    }

    // --------------------------------------------------------------------------
    // STEP 2: Find Nearest APN record (if APN query was provided)
    // --------------------------------------------------------------------------
    if (hasApnFilter) {
      let closestRecord: typeof records[0] | null = null;
      let minDiff = Infinity;

      for (const rec of records) {
        if (rec.apn) {
          const diff = this.getApnDifference(rec.apn, apnSearch!);
          if (diff < minDiff) {
            minDiff = diff;
            closestRecord = rec;
          }
        }
      }

      if (closestRecord && minDiff !== Infinity) {
        nearest.push(mapToMatchedRecord(closestRecord, 'nearest', ['closest_apn']));

        const refRecord = closestRecord;
        const candidateRecords = records.filter((r) => r.id !== refRecord.id);

        if (refRecord.latitude != null && refRecord.longitude != null) {
          for (const rec of candidateRecords) {
            if (rec.latitude != null && rec.longitude != null) {
              const distance = this.getDistanceInMeters(
                refRecord.latitude,
                refRecord.longitude,
                rec.latitude,
                rec.longitude,
              );
              if (distance <= 250) {
                related.push(mapToMatchedRecord(rec, 'related', ['250m_radius']));
              }
            }
          }
        }

        return { exact: [], nearest, related };
      }
    }

    // --------------------------------------------------------------------------
    // STEP 3: Fallback Search (No APN/Owner filters or no exact/nearest APN match)
    // All retrieved records are placed in `related` without radius filtering.
    // --------------------------------------------------------------------------
    for (const rec of records) {
      related.push(mapToMatchedRecord(rec, 'related', ['query']));
    }

    return { exact: [], nearest: [], related };
  }

  // 2. READ ALL
  async findAll(): Promise<StarterRecord[]> {
    return this.prisma.starterRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. READ ONE
  async findOne(id: string): Promise<StarterRecord> {
    const record = await this.prisma.starterRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException(`StarterRecord with ID "${id}" not found`);
    }

    return record;
  }

  // 4. UPDATE
  async update(id: string, data: Prisma.StarterRecordUpdateInput): Promise<StarterRecord> {
    await this.findOne(id); // Ensure record exists
    return this.prisma.starterRecord.update({
      where: { id },
      data,
    });
  }

  // 5. DELETE
  async remove(id: string): Promise<StarterRecord> {
    await this.findOne(id); // Ensure record exists
    return this.prisma.starterRecord.delete({
      where: { id },
    });
  }
}
