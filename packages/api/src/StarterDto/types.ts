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
  longitude: number | null;
  latitude: number | null;
  pdf: {
    filename: string;
    originalName: string;
    uploadedAt: number;
    size: number;
  } | null;
  pdfUrl: string | null;
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

export type MatchTier = 'exact' | 'related' | 'nearest';

export interface MatchedRecord extends StarterRecord {
  tier: MatchTier;
  matchedOn: string[];
}
export interface MapViewProps {
  exact: MatchedRecord[];
  related: MatchedRecord[];
  nearest: MatchedRecord[];
  onOpenRecord: (id: string) => void;
}

export interface StarterFilterResponse {
  exact: MatchedRecord[];
  nearest: MatchedRecord[];
  related: MatchedRecord[];
}