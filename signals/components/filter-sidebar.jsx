// filter-sidebar.jsx — FilterSidebar component

const { useState: useSidebarState, useMemo: useSidebarMemo } = React;

const ALL_DOMAINS = ['Artificial Intelligence', 'Semiconductors', 'Quantum Computing'];
const ALL_STATUSES = ['active', 'developing', 'resolved', 'invalidated'];

const STATUS_LABELS = {
  active: 'Active',
  developing: 'Developing',
  resolved: 'Resolved',
  invalidated: 'Invalidated',
};

const HORIZON_OPTIONS = [
  { value: null, label: 'All' },
  { value: '6-12', label: '6–12 mo' },
  { value: '12-18', label: '12–18 mo' },
  { value: '18-24', label: '18–24 mo' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'confidence', label: 'Confidence ↓' },
  { value: 'horizon', label: 'Horizon' },
];

const CONFIDENCE_TOOLTIP = [
  '',
  'Weak signal — preliminary observation, limited supporting evidence',
  'Low confidence — some evidence but significant gaps remain',
  'Moderate confidence — reasonable evidence with notable uncertainties',
  'Strong confidence — strong evidence, minor gaps in supporting data',
  'High confidence — strong evidence across multiple independent sources',
];

// Micro-label style
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.08em',
      color: 'var(--color-text-faint)',
      textTransform: 'uppercase',
      marginBottom: '10px',
      marginTop: '24px',
    }}>
      {children}
    </div>
  );
}

function FilterSidebar({ signals, filters, onFiltersChange, sortBy, onSortChange, hasActiveFilters, onReset }) {
  const [disabledTooltip, setDisabledTooltip] = useSidebarState(false);

  // Counts for domain chips (excluding domain filter itself)
  const domainCounts = useSidebarMemo(() => {
    let base = signals;
    if (filters.statuses.length > 0) base = base.filter(s => filters.statuses.includes(s.status));
    base = base.filter(s => s.confidence >= filters.minConfidence);
    if (filters.horizon) base = base.filter(s => s.horizon === filters.horizon);
    const counts = {};
    ALL_DOMAINS.forEach(d => { counts[d] = base.filter(s => s.domain === d).length; });
    return counts;
  }, [signals, filters.statuses, filters.minConfidence, filters.horizon]);

  // Counts for status chips (excluding status filter)
  const statusCounts = useSidebarMemo(() => {
    let base = signals;
    if (filters.domains.length > 0) base = base.filter(s => filters.domains.includes(s.domain));
    base = base.filter(s => s.confidence >= filters.minConfidence);
    if (filters.horizon) base = base.filter(s => s.horizon === filters.horizon);
    const counts = {};
    ALL_STATUSES.forEach(st => { counts[st] = base.filter(s => s.status === st).length; });
    return counts;
  }, [signals, filters.domains, filters.minConfidence, filters.horizon]);

  // Domain toggle
  function toggleDomain(domain) {
    const current = filters.domains;
    let next;
    if (domain === null) {
      next = [];
    } else {
      if (current.includes(domain)) {
        next = current.filter(d => d !== domain);
      } else {
        next = [...current, domain];
      }
    }
    onFiltersChange({ ...filters, domains: next });
  }

  // Status toggle
  function toggleStatus(status) {
    const current = filters.statuses;
    let next;
    if (status === null) {
      next = [];
    } else {
      if (current.includes(status)) {
        next = current.filter(s => s !== status);
      } else {
        next = [...current, status];
      }
    }
    onFiltersChange({ ...filters, statuses: next });
  }

  return (
    <aside style={{
      width: '280px',
      position: 'sticky',
      top: '56px',
      height: 'calc(100vh - 56px)',
      overflowY: 'auto',
      borderRight: '1px solid var(--color-divider)',
      padding: '24px 20px 48px',
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--color-border) transparent',
    }}>

      {/* ── SORT ── */}
      <SectionLabel>Sort By</SectionLabel>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {SORT_OPTIONS.map(opt => {
          const active = sortBy === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              style={{
                height: '30px',
                padding: '0 12px',
                borderRadius: 'var(--radius-full)',
                border: active ? 'none' : '1px solid var(--color-border)',
                backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface-offset)',
                color: active ? '#fff' : 'var(--color-text-muted)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 140ms',
                fontFamily: "'Inter', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── DOMAIN ── */}
      <SectionLabel>Domain</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* All chip */}
        <DomainChip
          label="All"
          count={null}
          active={filters.domains.length === 0}
          onClick={() => toggleDomain(null)}
        />
        {ALL_DOMAINS.map(domain => (
          <DomainChip
            key={domain}
            label={domain}
            count={domainCounts[domain] || 0}
            active={filters.domains.includes(domain)}
            onClick={() => toggleDomain(domain)}
          />
        ))}
      </div>

      {/* ── STATUS ── */}
      <SectionLabel>Status</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <StatusChip
          label="All"
          statusKey={null}
          count={null}
          active={filters.statuses.length === 0}
          onClick={() => toggleStatus(null)}
        />
        {ALL_STATUSES.map(st => (
          <StatusChip
            key={st}
            label={STATUS_LABELS[st]}
            statusKey={st}
            count={statusCounts[st] || 0}
            active={filters.statuses.includes(st)}
            onClick={() => toggleStatus(st)}
          />
        ))}
      </div>

      {/* ── CONFIDENCE ── */}
      <SectionLabel>Min. Confidence</SectionLabel>
      <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
        {[1, 2, 3, 4, 5].map(n => {
          const disabled = n < 3;
          const active = !disabled && filters.minConfidence === n;
          return (
            <div key={n} style={{ position: 'relative' }}>
              <button
                onClick={() => !disabled && onFiltersChange({ ...filters, minConfidence: n })}
                title={disabled ? 'Signals below 3 are not published per editorial standards.' : CONFIDENCE_TOOLTIP[n]}
                style={{
                  width: '40px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  border: active
                    ? '1.5px solid var(--color-primary)'
                    : '1px solid var(--color-border)',
                  backgroundColor: active
                    ? 'var(--color-primary)'
                    : disabled
                    ? 'transparent'
                    : 'var(--color-surface-offset)',
                  color: active ? '#fff' : disabled ? 'var(--color-text-faint)' : 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.45 : 1,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 140ms',
                }}
              >
                {n}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '6px', lineHeight: 1.5 }}>
        Scores 1–2 not published (editorial standard)
      </div>

      {/* ── HORIZON ── */}
      <SectionLabel>Forecast Horizon</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {HORIZON_OPTIONS.map(opt => {
          const active = filters.horizon === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onFiltersChange({ ...filters, horizon: opt.value })}
              style={{
                height: '36px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: active
                  ? '1.5px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                backgroundColor: active ? 'var(--color-accent-highlight)' : 'var(--color-surface)',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                fontWeight: active ? 500 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 140ms',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── RESET ── */}
      {hasActiveFilters && (
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-divider)' }}>
          <button
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'Inter', sans-serif",
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
          >
            Reset filters
          </button>
        </div>
      )}
    </aside>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function DomainChip({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '36px',
        padding: '0 12px',
        borderRadius: 'var(--radius-md)',
        border: active ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
        backgroundColor: active ? 'var(--color-accent-highlight)' : 'var(--color-surface)',
        color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 140ms',
        width: '100%',
      }}
    >
      <span>{label}</span>
      {count !== null && (
        <span style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          color: active ? 'var(--color-primary)' : 'var(--color-text-faint)',
          backgroundColor: active ? 'transparent' : 'var(--color-surface-offset)',
          padding: '1px 6px',
          borderRadius: 'var(--radius-full)',
          minWidth: '20px',
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

function StatusChip({ label, statusKey, count, active, onClick }) {
  const dotColors = {
    active: 'var(--status-active)',
    developing: 'var(--status-developing)',
    resolved: 'var(--status-resolved)',
    invalidated: 'var(--status-invalidated)',
  };

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '36px',
        padding: '0 12px',
        borderRadius: 'var(--radius-md)',
        border: active ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
        backgroundColor: active ? 'var(--color-accent-highlight)' : 'var(--color-surface)',
        color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 140ms',
        width: '100%',
        gap: '8px',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {statusKey && (
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColors[statusKey],
            flexShrink: 0,
          }} />
        )}
        {label}
      </span>
      {count !== null && (
        <span style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          color: active ? 'var(--color-primary)' : 'var(--color-text-faint)',
          backgroundColor: active ? 'transparent' : 'var(--color-surface-offset)',
          padding: '1px 6px',
          borderRadius: 'var(--radius-full)',
          minWidth: '20px',
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Exports ────────────────────────────────────────────────────────────────

Object.assign(window, { FilterSidebar });
