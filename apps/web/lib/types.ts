export type StarterType = 'Owner' | 'Lender' | 'Commitment';

export interface StarterRecord {
  id: string;
  type: StarterType;
  address: string;
  city: string;
  state: string;
  county: string;
  zip: string;
  apn: string;
  owner: string;
  subdivision: string;
  block: string;
  lot: string;
  titleco: string;
  amount: string;
  policy: string;
  date: string;
  legal: string;
  notes: string;
  filed: boolean;
  createdAt: number;
  pdf: {
    filename: string;
    originalName: string;
    uploadedAt: number;
    size: number;
  } | null;
}

export interface SearchQuery {
  address?: string;
  state?: string;
  county?: string;
  zip?: string;
  apn?: string;
  owner?: string;
  subdivision?: string;
  block?: string;
  lot?: string;
  type?: StarterType | 'All';
}

export type MatchTier = 'exact' | 'related';

export interface MatchedRecord extends StarterRecord {
  tier: MatchTier;
  matchedOn: string[];
}
