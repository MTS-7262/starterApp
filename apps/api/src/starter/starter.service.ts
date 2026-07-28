import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Prisma, StarterRecord } from '@repo/database';
import { PrismaService } from 'src/prisma/prisma.service';

 const SEED_DATA: Prisma.StarterRecordCreateInput[] = [
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 900),
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1000),
  },
];

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
