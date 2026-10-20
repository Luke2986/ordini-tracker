import { useState, useMemo } from 'react';
import type { OrdiniDataset } from '@/data/types';
import { computeRegionAggregates } from '@/data/utils';
import { KPIBar } from './KPIBar';
import { ItalyMap } from './ItalyMap';
import { RegionPanel } from './RegionPanel';
import { OrdiniTable } from './OrdiniTable';

interface DashboardProps {
  dataset: OrdiniDataset;
}

export function Dashboard({ dataset }: DashboardProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const aggregates = useMemo(
    () => computeRegionAggregates(dataset.ordini),
    [dataset.ordini]
  );

  const selectedAgg = selectedRegion ? aggregates[selectedRegion] : null;

  function handleSelectRegion(code: string | null) {
    setSelectedRegion(code);
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  const sortedRegions = useMemo(
    () =>
      Object.values(aggregates).sort((a, b) => b.coverage_pct - a.coverage_pct || b.active - a.active),
    [aggregates]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F4F4F5',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          background: '#0F5E59',
          padding: '0 32px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span
            style={{
              fontSize: '20px',
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}
          >
            Ordini Tracker
          </span>
          <span
            className="header-subtitle"
            style={{
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 400,
            }}
          >
            Mappa convenzioni con gli Ordini degli Avvocati · prototipo
          </span>
        </div>
      </header>

      <div
        role="note"
        style={{
          background: '#FFF8E1',
          borderBottom: '1px solid #F0E2B6',
          color: '#5C4A12',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.5,
          padding: '10px 24px',
          textAlign: 'center',
        }}
      >
        <strong style={{ fontWeight: 600 }}>Dati dimostrativi.</strong> Gli Ordini e il numero di iscritti sono reali;
        stati, sconti e date delle convenzioni sono inventati per mostrare come funziona lo strumento.
      </div>

      {/* Page content */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '28px 24px 48px', flex: '1' }}>
        {/* KPI Bar */}
        <section style={{ marginBottom: '24px' }}>
          <KPIBar ordini={dataset.ordini} aggregates={aggregates} />
        </section>

        {/* Map row: map left, region list/detail right — responsive stacks below 900px */}
        <section
          className="map-section"
          style={{
            display: 'grid',
            gridTemplateColumns: 'clamp(280px, 30%, 400px) 1fr',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left: map */}
          <ItalyMap
            aggregates={aggregates}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
          />

          {/* Right: either detail panel or region summary */}
          {selectedAgg ? (
            <RegionPanel
              region={selectedAgg}
              ordini={dataset.ordini}
              onClose={() => setSelectedRegion(null)}
            />
          ) : (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E3E3E3',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  color: '#000000',
                  marginBottom: '14px',
                }}
              >
                Riepilogo per regione
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  maxHeight: '520px',
                  overflowY: 'auto',
                }}
              >
                {sortedRegions.map(agg => (
                  <RegionRow
                    key={agg.region_code}
                    agg={agg}
                    isSelected={selectedRegion === agg.region_code}
                    onClick={() =>
                      setSelectedRegion(selectedRegion === agg.region_code ? null : agg.region_code)
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Full table */}
        <OrdiniTable
          ordini={dataset.ordini}
          initialRegionFilter={selectedRegion}
        />
      </main>

      {/* Footer disclaimer */}
      <footer
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E3E3E3',
          padding: '16px 32px',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: '#9E9E9E',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          Prototipo indipendente, costruito di mia iniziativa con sole fonti pubbliche durante una candidatura in
          una legaltech italiana. Non commissionato né approvato dall'azienda.
        </p>
        <p
          style={{
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            color: '#9E9E9E',
            margin: '4px 0 0',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          {dataset.metadata.notes} · Fonti: {dataset.metadata.data_source}.
        </p>
      </footer>

      <style>{`
        @media (max-width: 800px) {
          .map-section {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .header-subtitle {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function RegionRow({
  agg,
  isSelected,
  onClick,
}: {
  agg: import('@/data/types').RegionAggregate;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: isSelected ? '#EDF6F4' : 'transparent',
        border: isSelected ? '1px solid #BFDCD7' : '1px solid transparent',
        borderRadius: '8px',
        padding: '8px 10px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.background = '#F4F4F5';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5px',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            color: '#000000',
          }}
        >
          {agg.region_name}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            color: agg.coverage_pct > 0 ? '#0F5E59' : '#9E9E9E',
          }}
        >
          {agg.active}/{agg.total_ordini}
        </span>
      </div>
      <div
        style={{
          height: '4px',
          borderRadius: '3px',
          background: '#E3E3E3',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: '3px',
            background: agg.coverage_pct > 0 ? '#0F5E59' : '#DADADA',
            width: `${agg.coverage_pct}%`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </button>
  );
}
