import { useState, useMemo, useEffect } from 'react';
import type { Ordine, ConventionStatus } from '@/data/types';
import { StatusBadge } from './StatusBadge';
import { REGION_NAMES, getStatusLabel } from '@/data/utils';

interface OrdiniTableProps {
  ordini: Ordine[];
  initialRegionFilter?: string | null;
}

type SortKey = 'name' | 'city' | 'region' | 'status' | 'discount_pct' | 'registered_lawyers';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS: { value: ConventionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'active', label: 'Attiva' },
  { value: 'not_found', label: 'Non trovata' },
  { value: 'expired', label: 'Scaduta' },
  { value: 'not_verified', label: 'Non verificata' },
];

const PAGE_SIZE_OPTIONS = [10, 15, 25];

const LEGEND_ITEMS = [
  {
    status: 'active',
    label: 'Attiva',
    dotColor: '#2D8A4E',
    description: 'Convenzione verificata su fonte pubblica',
  },
  {
    status: 'not_found',
    label: 'Non trovata',
    dotColor: '#B8860B',
    description: 'Cercata online, non trovata (potrebbe esistere offline)',
  },
  {
    status: 'not_verified',
    label: 'Non verificata',
    dotColor: '#9E9E9E',
    description: 'Non ancora controllata individualmente',
  },
];

export function OrdiniTable({ ordini, initialRegionFilter }: OrdiniTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConventionStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState<string>(initialRegionFilter ?? 'all');
  const [sortKey, setSortKey] = useState<SortKey>('city');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setRegionFilter(initialRegionFilter ?? 'all');
    setCurrentPage(1);
  }, [initialRegionFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, regionFilter, sortKey, sortDir, pageSize]);

  const regionOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Tutte le regioni' },
      ...Object.entries(REGION_NAMES)
        .sort((a, b) => a[1].localeCompare(b[1], 'it'))
        .map(([code, name]) => ({ value: code, label: name })),
    ];
  }, []);

  const filtered = useMemo(() => {
    let result = [...ordini];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        o =>
          o.city.toLowerCase().includes(q) ||
          o.name.toLowerCase().includes(q) ||
          o.region.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(o => o.convention.status === statusFilter);
    }

    if (regionFilter !== 'all') {
      result = result.filter(o => o.region_code === regionFilter);
    }

    result.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      switch (sortKey) {
        case 'name':
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
        case 'city':
          av = a.city.toLowerCase();
          bv = b.city.toLowerCase();
          break;
        case 'region':
          av = a.region.toLowerCase();
          bv = b.region.toLowerCase();
          break;
        case 'status':
          av = getStatusLabel(a.convention.status);
          bv = getStatusLabel(b.convention.status);
          break;
        case 'discount_pct':
          av = a.convention.discount_pct ?? -1;
          bv = b.convention.discount_pct ?? -1;
          break;
        case 'registered_lawyers':
          av = a.registered_lawyers ?? -1;
          bv = b.registered_lawyers ?? -1;
          break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [ordini, search, statusFilter, regionFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, filtered.length);
  const pageRows = filtered.slice(startIdx, endIdx);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function goToPage(p: number) {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
  }

  function SortIcon({ colKey }: { colKey: SortKey }) {
    if (sortKey !== colKey) {
      return <span style={{ color: '#DADADA', marginLeft: '4px', fontSize: '10px' }}>↕</span>;
    }
    return (
      <span style={{ color: '#0F5E59', marginLeft: '4px', fontSize: '10px' }}>
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    color: '#4D4D4D',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '2px solid #E3E3E3',
    background: '#F4F4F5',
  };

  const tdStyle: React.CSSProperties = {
    padding: '11px 14px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    color: '#000000',
    borderBottom: '1px solid #E3E3E3',
    verticalAlign: 'middle',
  };

  const pageNumbers = buildPageNumbers(safePage, totalPages);

  return (
    <>
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E3E3E3',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E3E3E3',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              color: '#000000',
            }}
          >
            Tutti gli Ordini
          </span>
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              color: '#9E9E9E',
            }}
          >
            {filtered.length} di {ordini.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Cerca città o ordine…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1px solid #E3E3E3',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#000000',
              background: '#F4F4F5',
              outline: 'none',
              minWidth: '180px',
            }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ConventionStatus | 'all')}
            style={{
              padding: '7px 12px',
              border: '1px solid #E3E3E3',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#000000',
              background: '#F4F4F5',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              border: '1px solid #E3E3E3',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#000000',
              background: '#F4F4F5',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {regionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle} onClick={() => toggleSort('name')}>
                Ordine <SortIcon colKey="name" />
              </th>
              <th style={thStyle} onClick={() => toggleSort('city')}>
                Città <SortIcon colKey="city" />
              </th>
              <th style={thStyle} onClick={() => toggleSort('region')}>
                Regione <SortIcon colKey="region" />
              </th>
              <th style={thStyle} onClick={() => toggleSort('status')}>
                Stato convenzione <SortIcon colKey="status" />
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => toggleSort('discount_pct')}>
                Sconto <SortIcon colKey="discount_pct" />
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => toggleSort('registered_lawyers')}>
                Avvocati <SortIcon colKey="registered_lawyers" />
              </th>
              <th style={{ ...thStyle, cursor: 'default' }}>Fonte</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    ...tdStyle,
                    textAlign: 'center',
                    color: '#9E9E9E',
                    padding: '32px',
                  }}
                >
                  Nessun risultato trovato
                </td>
              </tr>
            ) : (
              pageRows.map(ordine => (
                <tr
                  key={ordine.id}
                  style={{ transition: 'background 0.1s' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background = '#F4F4F5';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLTableRowElement).style.background = '';
                  }}
                >
                  <td style={{ ...tdStyle, maxWidth: '220px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif',
                        color: '#4D4D4D',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '200px',
                      }}
                      title={ordine.name}
                    >
                      {ordine.name}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500 }}>{ordine.city}</div>
                  </td>
                  <td style={{ ...tdStyle, color: '#4D4D4D' }}>
                    {ordine.region}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={ordine.convention.status} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: ordine.convention.discount_pct !== null ? '#2D8A4E' : '#9E9E9E' }}>
                    {ordine.convention.discount_pct !== null
                      ? `${ordine.convention.discount_pct}%`
                      : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#4D4D4D' }}>
                    {ordine.registered_lawyers !== null
                      ? ordine.registered_lawyers.toLocaleString('it-IT')
                      : '—'}
                  </td>
                  <td style={tdStyle}>
                    {ordine.convention.source_url ? (
                      <a
                        href={ordine.convention.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#0F5E59',
                          fontSize: '12px',
                          textDecoration: 'none',
                          fontFamily: 'Inter, sans-serif',
                          borderBottom: '1px solid #BFDCD7',
                        }}
                      >
                        Fonte →
                      </a>
                    ) : (
                      <span style={{ color: '#DADADA', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      {filtered.length > 0 && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #E3E3E3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#FAFAFA',
          }}
        >
          {/* Left: range indicator + page size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                color: '#4D4D4D',
              }}
            >
              {startIdx + 1}–{endIdx} di {filtered.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#9E9E9E' }}>
                Righe:
              </span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #E3E3E3',
                  borderRadius: '5px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  color: '#000000',
                  background: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {PAGE_SIZE_OPTIONS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: page controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PageBtn
              label="← Prec."
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
              title="Pagina precedente"
            />
            {pageNumbers.map((p, i) =>
              p === '…' ? (
                <span
                  key={`ellipsis-${i}`}
                  style={{
                    padding: '0 6px',
                    fontSize: '12px',
                    color: '#9E9E9E',
                    fontFamily: 'Inter, sans-serif',
                    userSelect: 'none',
                  }}
                >
                  …
                </span>
              ) : (
                <PageBtn
                  key={p}
                  label={String(p)}
                  onClick={() => goToPage(Number(p))}
                  active={p === safePage}
                />
              )
            )}
            <PageBtn
              label="Succ. →"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              title="Pagina successiva"
            />
          </div>
        </div>
      )}
    </div>

    {/* Status legend */}
    <div
      style={{
        marginTop: '10px',
        padding: '12px 16px',
        background: '#F4F4F5',
        borderRadius: '8px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'flex-start',
      }}
    >
      {LEGEND_ITEMS.map(item => (
        <div
          key={item.status}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0' }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: item.dotColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: '#4D4D4D',
              whiteSpace: 'nowrap',
            }}
          >
            <strong style={{ fontWeight: 600 }}>{item.label}</strong>
            {' '}—{' '}
            <span style={{ color: '#4D4D4D' }}>{item.description}</span>
          </span>
        </div>
      ))}
    </div>
  </>
  );
}

function PageBtn({
  label,
  onClick,
  disabled = false,
  active = false,
  title,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        minWidth: '30px',
        height: '30px',
        padding: '0 6px',
        border: active ? '1.5px solid #0F5E59' : '1px solid #E3E3E3',
        borderRadius: '6px',
        background: active ? '#0F5E59' : disabled ? '#F4F4F5' : '#FFFFFF',
        color: active ? '#FFFFFF' : disabled ? '#DADADA' : '#000000',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.12s, color 0.12s',
        lineHeight: '28px',
        textAlign: 'center',
      }}
      onMouseEnter={e => {
        if (!disabled && !active) {
          (e.currentTarget as HTMLButtonElement).style.background = '#F4F4F5';
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !active) {
          (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
        }
      }}
    >
      {label}
    </button>
  );
}

function buildPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '…')[] = [];
  const delta = 2;
  const left = current - delta;
  const right = current + delta;

  let prev = 0;
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= left && p <= right)) {
      if (prev && p - prev > 1) pages.push('…');
      pages.push(p);
      prev = p;
    }
  }
  return pages;
}
