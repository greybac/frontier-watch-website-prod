// layout.jsx — Header, TrustAnchorStrip, Footer

const { useMemo } = React;

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Icons ─────────────────────────────────────────────────────────────────

// Brand mark — the ping. Full six-arc mark for the header (28px+),
// simplified one-ring variant for small sizes (footer, ≤20px).
function PingMark({ size = 19, variant = 'simple' }) {
  const common = {
    width: size, height: size, viewBox: '0 0 64 64', fill: 'none',
    'aria-hidden': true, style: { color: 'var(--color-primary)', flexShrink: 0 },
  };
  if (variant === 'full') {
    return (
      <svg {...common}>
        <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <path d="M27.35 41.97 A11 11 0 0 1 27.35 22.03" />
          <path d="M23 47.59 A18 18 0 0 1 23 16.41" />
          <path d="M17.66 52.48 A25 25 0 0 1 17.66 11.52" />
          <path d="M39.78 24.22 A11 11 0 0 1 39.78 39.78" />
          <path d="M43.57 18.21 A18 18 0 0 1 43.57 45.79" />
          <path d="M51.15 15.93 A25 25 0 0 1 51.15 48.07" />
        </g>
        <circle cx="32" cy="32" r="4.5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <g stroke="currentColor" strokeWidth="7" strokeLinecap="round">
        <path d="M23.9 47.6 A17.5 17.5 0 0 1 23.9 16.4" />
        <path d="M42.5 18.7 A17.5 17.5 0 0 1 42.5 45.3" />
      </g>
      <circle cx="32" cy="32" r="8" fill="currentColor" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3.5" />
      <line x1="10" y1="1.5" x2="10" y2="3.5" />
      <line x1="10" y1="16.5" x2="10" y2="18.5" />
      <line x1="1.5" y1="10" x2="3.5" y2="10" />
      <line x1="16.5" y1="10" x2="18.5" y2="10" />
      <line x1="3.93" y1="3.93" x2="5.34" y2="5.34" />
      <line x1="14.66" y1="14.66" x2="16.07" y2="16.07" />
      <line x1="3.93" y1="16.07" x2="5.34" y2="14.66" />
      <line x1="14.66" y1="5.34" x2="16.07" y2="3.93" />
    </svg>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ theme, onThemeToggle, lastUpdated }) {
  const headerBg = theme === 'dark'
    ? 'rgba(19, 22, 32, 0.92)'
    : 'rgba(255, 255, 255, 0.92)';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '56px',
      backgroundColor: headerBg,
      borderBottom: '1px solid var(--color-divider)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 48px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0',
      }} className="header-inner">
        {/* Wordmark — matches home page */}
        <a href="../index.html" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
          <PingMark size={28} variant="full" />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '19px',
            color: 'var(--color-text)',
            marginLeft: '2px',
          }}>Frontier</span>
          <span style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'normal',
            fontSize: '21px',
            color: 'var(--color-text)',
          }}>Watch</span>
        </a>

        {/* Breadcrumb */}
        <span style={{ color: 'var(--color-text-faint)', fontSize: '14px', margin: '0 8px 0 10px' }}>/</span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}>Signals</span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Last updated */}
        <span className="hide-mobile" style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          fontVariantNumeric: 'tabular-nums',
          marginRight: '16px',
          letterSpacing: '0.01em',
        }}>
          {lastUpdated ? `Updated ${formatDate(lastUpdated)}` : ''}
        </span>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '7px',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-md)',
            marginRight: '6px',
            transition: 'color 120ms, background 120ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-surface-offset)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Subscribe CTA */}
        <a
          href="https://frontierwatch.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="subscribe-btn"
        >
          Subscribe
        </a>
      </div>
    </header>
  );
}

// ─── Trust Anchor Strip ─────────────────────────────────────────────────────

const DOMAIN_ABBREV = {
  'Artificial Intelligence': 'AI',
  'Semiconductors': 'Semiconductors',
  'Quantum Computing': 'Quantum',
};

function TrustAnchorStrip({ signals, lastUpdated }) {
  const stats = useMemo(() => {
    const activeCount = signals.filter(s => s.status === 'active' || s.status === 'developing').length;
    const closedCount = signals.filter(s => s.status === 'resolved' || s.status === 'invalidated').length;
    const domains = [...new Set(signals.map(s => s.domain))];
    const domainsShort = domains.map(d => DOMAIN_ABBREV[d] || d);
    return { activeCount, closedCount, totalCount: signals.length, domains, domainsShort };
  }, [signals]);

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-offset)',
      borderBottom: '1px solid var(--color-divider)',
      padding: '0',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '24px 48px',
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        rowGap: '16px',
        gap: '0',
      }} className="trust-strip-inner">
        {/* Stats group — fills available space; wraps instead of overflowing */}
        <div className="trust-stats-group" style={{ flex: '1 1 auto', display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', rowGap: '16px', gap: '0', minWidth: 0 }}>
          {/* Stat 1 */}
          <div className="trust-stat" style={{ flex: '0 1 auto', minWidth: 0, paddingRight: '20px' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {stats.activeCount} Active Signal{stats.activeCount !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '3px' }}>
              Tracking frontier tech
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {stats.totalCount} signals since April 2026
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--color-divider)', alignSelf: 'stretch', margin: '0 20px' }} className="trust-divider" />

          {/* Stat 2 */}
          <div className="trust-stat" style={{ flex: '0 1 auto', minWidth: 0, paddingRight: '20px' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {stats.domains.length} Domain{stats.domains.length !== 1 ? 's' : ''} Covered
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stats.domainsShort.join(' · ')}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Confidence-scored, source-cited
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--color-divider)', alignSelf: 'stretch', margin: '0 20px' }} className="trust-divider" />

          {/* Stat 3 — the proof stat */}
          <div className="trust-stat" style={{ flex: '0 1 auto', minWidth: 0 }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {stats.closedCount} Outcome{stats.closedCount !== 1 ? 's' : ''} Recorded
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '3px' }}>
              Wrong calls stay public too
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {lastUpdated ? `Last update: ${formatDate(lastUpdated)}` : 'Last update: —'}
            </div>
          </div>
        </div>

        {/* Editorial context — visual styling lives in the page stylesheet so
            media queries can restyle it when it wraps below the stats */}
        <div className="trust-editorial" style={{ flex: '0 1 240px', minWidth: '200px' }}>
          A signal is a specific, forward-looking observation with a material strategic implication for technology strategy professionals. Confidence-scored. Source-cited. Outcomes tracked publicly.
        </div>
      </div>
    </div>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-surface-offset)',
      borderTop: '1px solid var(--color-divider)',
      padding: '0',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '24px 48px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '24px',
      }} className="footer-inner">
        {/* Left: logo + disclaimer */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <PingMark size={16} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }}>Frontier</span>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'normal', fontSize: '17px', color: 'var(--color-text)' }}>Watch</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            &copy; 2026 Frontier Watch — technology intelligence for strategy professionals.<br />Nothing published here constitutes investment, financial, legal, or professional advice.
          </div>
        </div>

        {/* Right: nav links */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', paddingTop: '2px' }}>
          {[
            { label: 'Newsletter', href: 'https://frontierwatch.substack.com' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7248378826097901568' },
            { label: 'About', href: 'https://frontierwatch.substack.com/about' },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                transition: 'color 120ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Exports ───────────────────────────────────────────────────────────────

Object.assign(window, { Header, TrustAnchorStrip, Footer, formatDate });
