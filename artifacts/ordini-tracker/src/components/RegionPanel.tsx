import type { Ordine, RegionAggregate } from '@/data/types';
import { StatusBadge } from './StatusBadge';
import { getChoroplethColor } from '@/data/utils';

interface RegionPanelProps {
  region: RegionAggregate;
  ordini: Ordine[];
  onClose: () => void;
}

export function RegionPanel({ region, ordini, onClose }: RegionPanelProps) {
  const regionOrdini = ordini.filter(o => o.region_code === region.region_code);

  const coverageColor = getChoroplethColor(region.coverage_pct);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E3E3E3',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div
            style={{
              fontSize: '18px',
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontWeight: 600,
              color: '#000000',
              lineHeight: 1.2,
            }}
          >
            {region.region_name}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '6px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: coverageColor,
                border: coverageColor === '#F4F4F5' ? '1px solid #DADADA' : 'none',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '22px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                color: '#0F5E59',
              }}
            >
              {region.coverage_pct}%
            </span>
            <span style={{ fontSize: '13px', color: '#4D4D4D', fontFamily: 'Inter, sans-serif' }}>
              copertura
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9E9E9E',
            fontSize: '18px',
            lineHeight: 1,
            padding: '2px 6px',
            borderRadius: '4px',
            flexShrink: 0,
          }}
          aria-label="Chiudi pannello regione"
          title="Chiudi"
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}
      >
        <StatCell label="Ordini totali" value={String(region.total_ordini)} />
        <StatCell label="Attive" value={String(region.active)} color="#2D8A4E" />
        <StatCell label="Non trovate" value={String(region.not_found)} />
        <StatCell label="Scadute" value={String(region.expired)} color="#B8860B" />
      </div>

      <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            color: '#9E9E9E',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          Ordini in questa regione
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
          {regionOrdini.map(ordine => (
            <div
              key={ordine.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                background: '#F4F4F5',
                gap: '10px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    color: '#000000',
                    lineHeight: 1.3,
                  }}
                >
                  {ordine.city}
                </div>
                {ordine.convention.discount_pct !== null && ordine.convention.status === 'active' && (
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#2D8A4E',
                      marginTop: '2px',
                    }}
                  >
                    Sconto {ordine.convention.discount_pct}%
                  </div>
                )}
              </div>
              <StatusBadge status={ordine.convention.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, color = '#000000' }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        background: '#F4F4F5',
        borderRadius: '8px',
        padding: '10px 12px',
      }}
    >
      <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'Inter, sans-serif', color }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#4D4D4D' }}>
        {label}
      </div>
    </div>
  );
}
