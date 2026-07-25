// app.jsx — Main tracker application (moved out of index.html for precompilation)

const { useState, useEffect, useMemo, useCallback } = React;

// ─── Data loading ───────────────────────────────────────────────────────────
// Preferred: JSON embedded at build time (<script id="signals-data">) — instant render.
// Fallback: fetch signals/signals.json (dev, or if the build step was skipped).

function readEmbeddedData() {
  try {
    const el = document.getElementById('signals-data');
    if (!el) return null;
    const data = JSON.parse(el.textContent);
    if (data && Array.isArray(data.signals)) return data;
  } catch {}
  return null;
}

// ─── Mobile filter chip ─────────────────────────────────────────────────────

function MobileChip({ label, active, dot, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        height: '30px',
        padding: '0 12px',
        borderRadius: 'var(--radius-full)',
        border: active ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
        backgroundColor: active ? 'var(--color-accent-highlight)' : 'var(--color-surface)',
        color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontFamily: "'Inter', sans-serif",
        flexShrink: 0,
      }}
    >
      {dot && (
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          backgroundColor: dot,
          flexShrink: 0,
        }} />
      )}
      {label}
    </button>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onReset }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '80px 0',
      gap: '10px',
      textAlign: 'center',
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="11" stroke="var(--color-text-faint)" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="4" stroke="var(--color-text-faint)" strokeWidth="1.5" />
        <line x1="16" y1="3" x2="16" y2="9" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="23" x2="16" y2="29" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3" y1="16" x2="9" y2="16" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="16" x2="29" y2="16" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <h3 style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 500,
        color: 'var(--color-text-muted)',
        marginTop: '8px',
      }}>
        No signals match these filters.
      </h3>
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        maxWidth: '280px',
        lineHeight: 1.6,
      }}>
        Try removing a domain or status filter, or reset to see all signals.
      </p>
      <button
        onClick={onReset}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-primary)',
          fontSize: 'var(--text-sm)',
          cursor: 'pointer',
          padding: '4px 0',
          marginTop: '4px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Reset filters
      </button>
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div className="skeleton" style={{ width: '60px', height: '26px', borderRadius: 'var(--radius-full)' }} />
            <div className="skeleton" style={{ width: '80px', height: '26px', borderRadius: 'var(--radius-full)' }} />
          </div>
          <div className="skeleton" style={{ width: `${70 + i * 8}%`, height: '20px', marginBottom: '10px' }} />
          <div className="skeleton" style={{ width: '90%', height: '14px', marginBottom: '6px' }} />
          <div className="skeleton" style={{ width: '60%', height: '14px' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

function App() {
  const embedded = useMemo(readEmbeddedData, []);
  const [signals, setSignals] = useState(embedded ? embedded.signals : []);
  const [lastUpdated, setLastUpdated] = useState(
    embedded && embedded.meta ? embedded.meta.last_updated || '' : ''
  );
  const [loading, setLoading] = useState(!embedded);

  // Shared with the home page via localStorage; default is light
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('fw-theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });

  // Deep-link support: #sig-XXX opens the tracker with that card expanded
  const [expandedIds, setExpandedIds] = useState(() => {
    const id = (window.location.hash || '').replace('#', '');
    return id ? new Set([id]) : new Set();
  });

  const [filters, setFilters] = useState({
    domains: [],
    statuses: [],
    minConfidence: 3,
    horizon: null,
  });

  const [sortBy, setSortBy] = useState('recent');

  // Fetch fallback — only when no embedded data was found
  useEffect(() => {
    if (embedded) return;
    fetch('signals/signals.json')
      .then(r => r.json())
      .then(data => {
        setSignals(data.signals);
        setLastUpdated((data.meta && data.meta.last_updated) || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [embedded]);

  // Apply theme to html element + persist for the home page
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('fw-theme', theme); } catch {}
  }, [theme]);

  // Deep link: once signals load, make sure a hash-linked card is visible + scrolled to
  useEffect(() => {
    if (!signals.length) return;
    const id = (window.location.hash || '').replace('#', '');
    if (!id) return;
    const target = signals.find(s => s.id === id);
    if (!target) return;
    // Guarantee the linked signal survives the default filters
    setFilters(f => (target.confidence < f.minConfidence ? { ...f, minConfidence: target.confidence } : f));
    setExpandedIds(new Set([id]));
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        const y = window.scrollY + el.getBoundingClientRect().top - 72;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }, [signals]);

  // Respond to hash changes while the page is open (e.g. back/forward, pasted link)
  useEffect(() => {
    const onHashChange = () => {
      const id = (window.location.hash || '').replace('#', '');
      if (!id) return;
      setExpandedIds(new Set([id]));
      const el = document.getElementById(id);
      if (el) {
        const y = window.scrollY + el.getBoundingClientRect().top - 72;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Filter + sort
  const filteredSignals = useMemo(() => {
    let result = [...signals];
    if (filters.domains.length > 0) result = result.filter(s => filters.domains.includes(s.domain));
    if (filters.statuses.length > 0) result = result.filter(s => filters.statuses.includes(s.status));
    result = result.filter(s => s.confidence >= filters.minConfidence);
    if (filters.horizon) result = result.filter(s => s.horizon === filters.horizon);

    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.date_updated) - new Date(a.date_updated));
    } else if (sortBy === 'confidence') {
      result.sort((a, b) => b.confidence - a.confidence || new Date(b.date_updated) - new Date(a.date_updated));
    } else if (sortBy === 'horizon') {
      const order = { '6-12': 1, '12-18': 2, '18-24': 3 };
      result.sort((a, b) => order[a.horizon] - order[b.horizon]);
    }
    return result;
  }, [signals, filters, sortBy]);

  // Toggle expand — single at a time; shift-click for multi
  const toggleExpand = useCallback((id, shiftKey = false) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      let nowOpen;
      if (next.has(id)) {
        next.delete(id);
        nowOpen = false;
      } else {
        if (!shiftKey) next.clear();
        next.add(id);
        nowOpen = true;
      }
      // Keep the URL in sync so the current card is always shareable
      try {
        if (nowOpen) {
          history.replaceState(null, '', '#' + id);
        } else if (next.size === 0) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch {}
      return next;
    });
  }, []);

  const hasActiveFilters = filters.domains.length > 0 || filters.statuses.length > 0 ||
    filters.minConfidence !== 3 || filters.horizon !== null;

  const resetFilters = useCallback(() =>
    setFilters({ domains: [], statuses: [], minConfidence: 3, horizon: null }), []);

  const hasClosedSignals = signals.some(s => s.status === 'resolved' || s.status === 'invalidated');

  // Mobile domain/status chips
  const allDomains = [...new Set(signals.map(s => s.domain))];
  const allStatuses = [...new Set(signals.map(s => s.status))];
  const STATUS_DOTS = {
    active: 'var(--status-active)', developing: 'var(--status-developing)',
    resolved: 'var(--status-resolved)', invalidated: 'var(--status-invalidated)',
  };
  const STATUS_LABELS_MAP = { active: 'Active', developing: 'Developing', resolved: 'Resolved', invalidated: 'Invalidated' };

  return (
    <div className="page-wrapper">
      <Header
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        lastUpdated={lastUpdated}
      />

      <TrustAnchorStrip signals={signals} lastUpdated={lastUpdated} />

      {/* Mobile filter bar */}
      <div className="mobile-filter-bar">
        {allDomains.map(d => (
          <MobileChip
            key={d}
            label={d === 'Artificial Intelligence' ? 'AI' : d}
            active={filters.domains.includes(d)}
            onClick={() => {
              const next = filters.domains.includes(d)
                ? filters.domains.filter(x => x !== d)
                : [...filters.domains, d];
              setFilters({ ...filters, domains: next });
            }}
          />
        ))}
        {allStatuses.map(st => (
          <MobileChip
            key={st}
            label={STATUS_LABELS_MAP[st]}
            active={filters.statuses.includes(st)}
            dot={STATUS_DOTS[st]}
            onClick={() => {
              const next = filters.statuses.includes(st)
                ? filters.statuses.filter(x => x !== st)
                : [...filters.statuses, st];
              setFilters({ ...filters, statuses: next });
            }}
          />
        ))}
        {hasActiveFilters && (
          <MobileChip label="Reset" active={false} onClick={resetFilters} />
        )}
      </div>

      <div className="body-layout">
        <FilterSidebar
          signals={signals}
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />

        <main className="main-column">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredSignals.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <>
              {/* Signal count */}
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: '16px',
                letterSpacing: '0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''}
                {hasActiveFilters ? ' matching filters' : ''}
              </div>

              {filteredSignals.map(signal => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  isExpanded={expandedIds.has(signal.id)}
                  onToggle={(e) => toggleExpand(signal.id, e && e.shiftKey)}
                />
              ))}

              {/* Track record note — shown when no closed signals yet */}
              {!hasClosedSignals && (
                <p style={{
                  textAlign: 'center',
                  paddingTop: '32px',
                  paddingBottom: '16px',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.7,
                  maxWidth: '480px',
                  margin: '0 auto',
                }}>
                  Resolved and Invalidated signals will appear here as signals reach their forecast horizon. Outcomes are always recorded publicly.
                </p>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
