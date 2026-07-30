import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MatchedRecord, MatchTier, SearchQuery, StarterFilterResponse, StarterType } from '@repo/api';
import { Prisma, StarterRecord } from '@repo/database';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fsp from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
const csv = require('csv-parser');

@Injectable()
export class StarterService {
  constructor(private readonly prisma: PrismaService) { }

  async importFromFolder(folderPath: string ) {
    
    if (!folderPath) {
      throw new BadRequestException('folderPath is required.');
    }

    // 1. Verify that the directory exists
    try {
      await fsp.access(folderPath);
    } catch {
      throw new BadRequestException(`Directory not found: ${folderPath}`);
    }

    // 2. Read all file names from the directory
    const dirEntries = await fsp.readdir(folderPath, { withFileTypes: true });

    // 3. Filter to include only CSV files (ignoring subdirectories)
    const csvFiles = dirEntries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.csv'))
      .map((entry) => entry.name);

    if (csvFiles.length === 0) {
      return {
        success: true,
        message: 'No CSV files found in the specified directory.',
        processedFiles: 0,
      };
    }

    const summary = {
      total: csvFiles.length,
      successful: 0,
      failed: 0,
      details: [] as Array<{ file: string; status: string; error?: string }>,
    };

    // 4. Loop through each file and process it
    for (const fileName of csvFiles) {
      const fullFilePath = path.join(folderPath, fileName);

      try {
        await await this.importCsvFromPath(fullFilePath);

        summary.successful++;
        summary.details.push({ file: fileName, status: 'success' });
      } catch (error: any) {
        summary.failed++;
        summary.details.push({
          file: fileName,
          status: 'failed',
          error: error.message || 'Unknown error',
        });
      }
    }

    return {
      success: true,
      message: `Completed processing ${summary.total} files.`,
      summary,
    };
  }

  async importCsvFromPath(filePath: string): Promise<{ file: string; count: number; message: string }> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File not found at path: ${filePath}`);
    }

    const BATCH_SIZE = 2000;
    let batch: any[] = [];
    let totalProcessed = 0;

    const stream = fs.createReadStream(filePath).pipe(csv());

    try {
      for await (const row of stream) {
        const { city, state } = this.parseCityState(row['Site Address City/State']);

        const record = {
          owner: row['Owner Name2']?.trim() || null,
          apn: row['Parcel Number']?.trim() || null,
          county: row['County']?.trim() || null,
          address: row['Full Site Address']?.trim() || null,
          latitude: this.parseFloatNullable(row['Latitude']),
          longitude: this.parseFloatNullable(row['Longitude']),
          legalBriefDescription: row['Legal Brief Description']?.trim() || null,
          legalDistrict: this.parseBigIntNullable(row['Legal District']),
          legalLotNumber: this.parseBigIntNullable(row['Legal Lot Number']),
          legalUnit: row['Legal Unit']?.trim() || null,
          city,
          state,
          zip: this.formatZip(row['Site Address Zip']),
          filed: false,
        };

        batch.push(record);

        // Process batch when size limit is reached
        if (batch.length >= BATCH_SIZE) {
          await this.prisma.starterRecord.createMany({
            data: batch,
            skipDuplicates: true,
          });
          totalProcessed += batch.length;
          batch = [];
        }
      }

      // Insert any remaining records
      if (batch.length > 0) {
        await this.prisma.starterRecord.createMany({
          data: batch,
          skipDuplicates: true,
        });
        totalProcessed += batch.length;
      }

      return {
        file: filePath,
        count: totalProcessed,
        message: `Successfully imported ${totalProcessed} records into starter_records table.`,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to process CSV file: ${error.message}`);
    }
  }
  private parseCityState(rawVal?: string): { city: string | null; state: string | null } {
    if (!rawVal || !rawVal.trim()) return { city: null, state: null };
    const trimmed = rawVal.trim();

    const match = trimmed.match(/^(.*?)(?:\s+([A-Za-z]{2}))?$/);
    if (match) {
      let city = match[1]?.trim() || null;
      let state = match[2]?.trim() || null;

      if (city && !state && city.length === 2) {
        state = city;
        city = null;
      }
      return { city, state };
    }
    return { city: trimmed, state: null };
  }

  private parseBigIntNullable(rawVal?: any): bigint | null {
    if (rawVal === undefined || rawVal === null || rawVal === '') return null;
    const numStr = String(rawVal).trim().split('.')[0];
    if (!numStr || isNaN(Number(numStr))) return null;
    try {
      return BigInt(numStr);
    } catch {
      return null;
    }
  }

  private parseFloatNullable(rawVal?: any): number | null {
    if (rawVal === undefined || rawVal === null || rawVal === '') return null;
    const parsed = parseFloat(String(rawVal));
    return isNaN(parsed) ? null : parsed;
  }

  private formatZip(rawVal?: any): string | null {
    if (!rawVal) return null;
    return String(rawVal).trim().replace(/\.0$/, '');
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
    )
      return { exact: [], nearest: [], related: [] };

    const where: Prisma.StarterRecordWhereInput = {};
    const apnSearch = query.apn?.trim();
    const addressSearch = query.address?.trim();

    if (query.address) where.address = { contains: query.address.trim(), mode: 'insensitive' };
    if (query.state) where.state = { equals: query.state.trim(), mode: 'insensitive' };
    if (query.county) where.county = { equals: query.county.trim(), mode: 'insensitive' };
    if (query.zip) where.zip = { equals: query.zip.trim(), mode: 'insensitive' };
    if (query.owner) where.owner = { contains: query.owner.trim(), mode: 'insensitive' };

    if (apnSearch) {
      const apnPrefix = apnSearch.length > 3 ? apnSearch.slice(0, -2) : apnSearch;
      where.apn = { contains: apnPrefix, mode: 'insensitive' };
    }
    if (addressSearch) {
      where.address = { contains: addressSearch, mode: 'insensitive' };
    }

    const records = await this.prisma.starterRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0)
      return { exact: [], nearest: [], related: [] };

    const hasApnFilter = Boolean(apnSearch);
    const hasAddressFilter = Boolean(addressSearch);

    const exact: MatchedRecord[] = [];
    const nearest: MatchedRecord[] = [];
    const related: MatchedRecord[] = [];

    const mapToMatchedRecord = (
      rec: typeof records[0],
      tier: MatchTier,
      matchedOn: string[],
    ): MatchedRecord => ({
      id: rec.id,
      type: "Owner" as StarterType,
      address: rec.address ?? '',
      city: rec.city ?? '',
      state: rec.state ?? '',
      county: rec.county ?? '',
      zip: rec.zip ?? '',
      apn: rec.apn ?? '',
      owner: rec.owner ?? '',
      subdivision: '',
      block: '',
      lot: '',
      titleco: '',
      amount: '',
      policy: '',
      date: '',
      legal: '',
      notes: '',
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
    // STEP 1: Check for Exact Matches on APN or Address
    // --------------------------------------------------------------------------
    const exactRecords = records.filter((rec) => {
      const isApnExact =
        hasApnFilter && rec.apn?.trim().toLowerCase() === apnSearch!.toLowerCase();
      const isAddressExact =
        hasAddressFilter && rec.address?.trim().toLowerCase() === addressSearch!.toLowerCase();

      return isApnExact || isAddressExact;
    });

    if (exactRecords.length > 0) {
      exactRecords.forEach((rec) => {
        const matchedOn: string[] = [];
        if (hasApnFilter && rec.apn?.trim().toLowerCase() === apnSearch!.toLowerCase()) {
          matchedOn.push('apn');
        }
        if (hasAddressFilter && rec.address?.trim().toLowerCase() === addressSearch!.toLowerCase()) {
          matchedOn.push('address');
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
    const fallbackRecords = records.slice(0, 10);
    for (const rec of fallbackRecords) {
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
