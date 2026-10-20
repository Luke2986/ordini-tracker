export type ConventionStatus = 'active' | 'not_found' | 'expired' | 'not_verified';

export interface Convention {
  status: ConventionStatus;
  discount_pct: number | null;
  source_url: string | null;
  detected_date: string | null;
  expiry_date: string | null;
  notes: string;
}

export interface Ordine {
  id: string;
  name: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  registered_lawyers: number | null;
  registered_lawyers_source: string | null;
  convention: Convention;
}

export interface OrdiniMetadata {
  last_updated: string;
  total_ordini: number;
  verified_ordini: number;
  active_conventions: number;
  data_source: string;
  notes: string;
}

export interface OrdiniDataset {
  metadata: OrdiniMetadata;
  ordini: Ordine[];
}

export interface RegionAggregate {
  region_code: string;
  region_name: string;
  total_ordini: number;
  active: number;
  not_found: number;
  expired: number;
  not_verified: number;
  coverage_pct: number;
  total_lawyers: number | null;
  covered_lawyers: number | null;
}
