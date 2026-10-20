import type { Ordine, RegionAggregate } from '@/data/types';
import { getBestRegion, getLeastCoveredRegion } from '@/data/utils';

interface KPIBarProps {
  ordini: Ordine[];
  aggregates: Record<string, RegionAggregate>;
}

interface KPICardProps {
  value: string;
  label: string;
  sub?: string;
  highlight?: boolean;
}

function KPICard({ value, label, sub, highlight }: KPICardProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E3E3E3',
        borderRadius: '12px',
        padding: '20px 24px',
        minWidth: 0,
        flex: '1 1 160px',
      }}
    >
      <div
        style={{
          fontSize: '32px',
          fontWeight: 500,
          fontFamily: 'Inter, sans-serif',
          color: highlight ? '#0F5E59' : '#000000',
          lineHeight: 1,
          marginBottom: '6px',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 400,
          fontFamily: 'Inter, sans-serif',
          color: '#4D4D4D',
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontSize: '11px',
            fontWeight: 400,
            fontFamily: 'Inter, sans-serif',
            color: '#9E9E9E',
            lineHeight: 1.4,
            marginTop: '2px',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function KPIBar({ ordini, aggregates }: KPIBarProps) {
  const total = ordini.length;
  const active = ordini.filter(o => o.convention.status === 'active').length;
  const coveragePct = total > 0 ? Math.round((active / total) * 1000) / 10 : 0;

  const best = getBestRegion(aggregates);
  const leastCovered = getLeastCoveredRegion(aggregates);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <KPICard
        value={String(total)}
        label="Ordini totali"
      />
      <KPICard
        value={String(active)}
        label="Convenzioni attive"
        highlight
      />
      <KPICard
        value={`${coveragePct}%`}
        label="Copertura nazionale"
        highlight
      />
      <KPICard
        value={best ? `${best.coverage_pct}%` : '—'}
        label="Regione più coperta"
        sub={best?.region_name}
      />
      <KPICard
        value={leastCovered ? `${leastCovered.coverage_pct}%` : '—'}
        label="Regione meno coperta"
        sub={leastCovered?.region_name}
      />
    </div>
  );
}
