import { MatchedRecord, MatchTier, SearchQuery, StarterRecord } from './types';

function norm(v: string | undefined | null): string {
  return (v || '').trim().toLowerCase().replace(/[.,#-]/g, '').replace(/\s+/g, ' ');
}

function normApn(v: string | undefined | null): string {
  return (v || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function streetTokens(address: string): string[] {
  return norm(address)
    .split(' ')
    .filter((t) => t.length > 2 && !['street', 'st', 'avenue', 'ave', 'drive', 'dr', 'court', 'ct', 'circle', 'cir', 'road', 'rd'].includes(t));
}

function surname(owner: string): string {
  const parts = norm(owner).split(' ').filter(Boolean);
  return parts[parts.length - 1] || '';
}

const isBlank = (v?: string) => !v || !v.trim();

/**
 * Compares a record against the query and returns a match tier + which
 * fields drove the match, or null if there is no meaningful match at all.
 *
 * Exact  -> the identifying field(s) the searcher actually used (APN, or full
 *           address, or subdivision+block+lot) line up precisely.
 * Related -> partial / adjacent signal: same subdivision, same street, same
 *            owner surname, same zip/county, or a partial APN/address match.
 */
export function matchRecord(record: StarterRecord, query: SearchQuery): { tier: MatchTier; matchedOn: string[] } | null {
  const matchedOn: string[] = [];
  let exactHit = false;
  let relatedHit = false;

  if (query.type && query.type !== 'All' && record.type !== query.type) {
    // type filter is a hard constraint, not a scoring field
    return null;
  }

  // APN — strongest identifier
  if (!isBlank(query.apn)) {
    const qa = normApn(query.apn);
    const ra = normApn(record.apn);
    if (qa === ra) {
      exactHit = true;
      matchedOn.push('APN (exact)');
    } else if (ra.includes(qa) || qa.includes(ra)) {
      relatedHit = true;
      matchedOn.push('APN (partial)');
    }
  }

  // Address
  if (!isBlank(query.address)) {
    const qAddr = norm(query.address);
    const rAddr = norm(record.address);
    if (qAddr === rAddr) {
      exactHit = true;
      matchedOn.push('Address (exact)');
    } else {
      const qTokens = streetTokens(query.address!);
      const rTokens = streetTokens(record.address);
      const overlap = qTokens.filter((t) => rTokens.includes(t));
      if (rAddr.includes(qAddr) || qAddr.includes(rAddr) || overlap.length > 0) {
        relatedHit = true;
        matchedOn.push('Address (nearby / partial)');
      }
    }
  }

  // Subdivision + block + lot combination = exact legal match
  if (!isBlank(query.subdivision)) {
    const sameSub = norm(query.subdivision) === norm(record.subdivision);
    const subContains = norm(record.subdivision).includes(norm(query.subdivision)) || norm(query.subdivision).includes(norm(record.subdivision));
    if (sameSub) {
      const blockGiven = !isBlank(query.block);
      const lotGiven = !isBlank(query.lot);
      const blockMatches = !blockGiven || norm(query.block) === norm(record.block);
      const lotMatches = !lotGiven || norm(query.lot) === norm(record.lot);
      if (blockMatches && lotMatches && (blockGiven || lotGiven)) {
        exactHit = true;
        matchedOn.push('Subdivision / Block / Lot (exact)');
      } else {
        relatedHit = true;
        matchedOn.push('Subdivision (exact match, lot differs)');
      }
    } else if (subContains) {
      relatedHit = true;
      matchedOn.push('Subdivision (partial)');
    }
  }

  // Owner
  if (!isBlank(query.owner)) {
    const qOwner = norm(query.owner);
    const rOwner = norm(record.owner);
    if (qOwner === rOwner) {
      exactHit = true;
      matchedOn.push('Owner (exact)');
    } else if (rOwner.includes(qOwner) || qOwner.includes(rOwner)) {
      relatedHit = true;
      matchedOn.push('Owner (partial name)');
    } else if (surname(query.owner!) && surname(query.owner!) === surname(record.owner)) {
      relatedHit = true;
      matchedOn.push('Owner (same surname)');
    }
  }

  // Location fields — only ever "related" signal on their own
  if (!isBlank(query.zip) && norm(query.zip) === norm(record.zip)) {
    relatedHit = true;
    matchedOn.push('ZIP');
  }
  if (!isBlank(query.county) && norm(query.county) === norm(record.county)) {
    relatedHit = true;
    matchedOn.push('County');
  }
  if (!isBlank(query.state) && norm(query.state) === norm(record.state)) {
    relatedHit = true;
    matchedOn.push('State');
  }

  if (exactHit) return { tier: 'exact', matchedOn: Array.from(new Set(matchedOn)) };
  if (relatedHit) return { tier: 'related', matchedOn: Array.from(new Set(matchedOn)) };
  return null;
}

export function runSearch(records: StarterRecord[], query: SearchQuery): { exact: MatchedRecord[]; related: MatchedRecord[] } {
  const hasAnyField = Object.entries(query).some(([k, v]) => k !== 'type' && !isBlank(v as string));
  if (!hasAnyField) return { exact: [], related: [] };

  const exact: MatchedRecord[] = [];
  const related: MatchedRecord[] = [];

  for (const record of records) {
    const result = matchRecord(record, query);
    if (!result) continue;
    const entry: MatchedRecord = { ...record, tier: result.tier, matchedOn: result.matchedOn };
    if (result.tier === 'exact') exact.push(entry);
    else related.push(entry);
  }

  exact.sort((a, b) => b.createdAt - a.createdAt);
  related.sort((a, b) => b.createdAt - a.createdAt);

  return { exact, related };
}
