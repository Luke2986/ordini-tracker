import type { Ordine, RegionAggregate } from './types';

export const REGION_NAMES: Record<string, string> = {
  ABR: 'Abruzzo',
  BAS: 'Basilicata',
  CAL: 'Calabria',
  CAM: 'Campania',
  EMR: 'Emilia-Romagna',
  FVG: 'Friuli Venezia Giulia',
  LAZ: 'Lazio',
  LIG: 'Liguria',
  LOM: 'Lombardia',
  MAR: 'Marche',
  MOL: 'Molise',
  PIE: 'Piemonte',
  PUG: 'Puglia',
  SAR: 'Sardegna',
  SIC: 'Sicilia',
  TOS: 'Toscana',
  TAA: 'Trentino-Alto Adige',
  UMB: 'Umbria',
  VDA: "Valle d'Aosta",
  VEN: 'Veneto',
};

export function computeRegionAggregates(ordini: Ordine[]): Record<string, RegionAggregate> {
  const aggregates: Record<string, RegionAggregate> = {};

  for (const [code, name] of Object.entries(REGION_NAMES)) {
    aggregates[code] = {
      region_code: code,
      region_name: name,
      total_ordini: 0,
      active: 0,
      not_found: 0,
      expired: 0,
      not_verified: 0,
      coverage_pct: 0,
      total_lawyers: null,
      covered_lawyers: null,
    };
  }

  for (const ordine of ordini) {
    const agg = aggregates[ordine.region_code];
    if (!agg) continue;

    agg.total_ordini++;

    const status = ordine.convention.status;
    if (status === 'active') agg.active++;
    else if (status === 'not_found') agg.not_found++;
    else if (status === 'expired') agg.expired++;
    else agg.not_verified++;

    if (ordine.registered_lawyers !== null) {
      agg.total_lawyers = (agg.total_lawyers ?? 0) + ordine.registered_lawyers;
      if (status === 'active') {
        agg.covered_lawyers = (agg.covered_lawyers ?? 0) + ordine.registered_lawyers;
      }
    }
  }

  for (const agg of Object.values(aggregates)) {
    agg.coverage_pct = agg.total_ordini > 0
      ? Math.round((agg.active / agg.total_ordini) * 100 * 10) / 10
      : 0;
  }

  return aggregates;
}

export function getChoroplethColor(coveragePct: number): string {
  if (coveragePct === 0) return '#F4F4F5';
  if (coveragePct <= 25) return '#BFDCD7';
  if (coveragePct <= 50) return '#6BAFA6';
  if (coveragePct <= 75) return '#2F8077';
  return '#0F5E59';
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Attiva';
    case 'not_found': return 'Non trovata';
    case 'expired': return 'Scaduta';
    case 'not_verified': return 'Non verificata';
    default: return status;
  }
}

export function getNationalCoverage(ordini: Ordine[]): number {
  const active = ordini.filter(o => o.convention.status === 'active').length;
  return Math.round((active / ordini.length) * 100 * 10) / 10;
}

export function getBestRegion(aggregates: Record<string, RegionAggregate>): RegionAggregate | null {
  let best: RegionAggregate | null = null;
  for (const agg of Object.values(aggregates)) {
    if (agg.active > 0 && (!best || agg.coverage_pct > best.coverage_pct)) {
      best = agg;
    }
  }
  return best;
}

/** Returns the region with at least 1 verified Ordine (total_ordini > 0) that has the lowest non-zero coverage percentage. */
export function getLeastCoveredRegion(aggregates: Record<string, RegionAggregate>): RegionAggregate | null {
  let worst: RegionAggregate | null = null;
  for (const agg of Object.values(aggregates)) {
    if (agg.total_ordini > 0 && agg.coverage_pct > 0) {
      if (!worst || agg.coverage_pct < worst.coverage_pct) {
        worst = agg;
      }
    }
  }
  return worst;
}

/** Returns the count of regions with zero active conventions. */
export function getUncoveredRegionCount(aggregates: Record<string, RegionAggregate>): number {
  return Object.values(aggregates).filter(a => a.active === 0 && a.total_ordini > 0).length;
}
