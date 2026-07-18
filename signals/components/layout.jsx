// layout.jsx — Header, TrustAnchorStrip, Footer

const { useMemo } = React;

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Icons ─────────────────────────────────────────────────────────────────

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

function Header({ theme, onThemeToggle }) {
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
        <a href="../index.html" style={{ display: 'flex', alignItems: 'baseline', gap: '5px', textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '17px',
            color: 'var(--color-text)',
          }}>Frontier</span>
          <span style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: '19px',
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
          color: 'var(--color-text-faint)',
          fontVariantNumeric: 'tabular-nums',
          marginRight: '16px',
          letterSpacing: '0.01em',
        }}>
          Updated Jul 17, 2026
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

function TrustAnchorStrip({ signals }) {
  const stats = useMemo(() => {
    const activeCount = signals.filter(s => s.status === 'active' || s.status === 'developing').length;
    const domains = [...new Set(signals.map(s => s.domain))];
    const domainsShort = domains.map(d => DOMAIN_ABBREV[d] || d);
    return { activeCount, totalCount: signals.length, domains, domainsShort };
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
        gap: '0',
      }} className="trust-strip-inner">
        {/* Stats group — flex:1 so it fills space, leaving room for editorial */}
        <div className="trust-stats-group" style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '0', minWidth: 0 }}>
          {/* Stat 1 */}
          <div className="trust-stat" style={{ flex: '0 0 auto', paddingRight: '32px' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {stats.activeCount} Active Signal{stats.activeCount !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '3px' }}>
              Tracking Frontier Tech
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '2px' }}>
              developments since April 2026
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--color-divider)', alignSelf: 'stretch', margin: '0 32px' }} className="trust-divider" />

          {/* Stat 2 */}
          <div className="trust-stat" style={{ flex: '0 0 auto', paddingRight: '32px' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
              {stats.domains.length} Domain{stats.domains.length !== 1 ? 's' : ''} Covered
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stats.domainsShort.join(' · ')}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '2px' }}>
              {stats.totalCount} signals total
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--color-divider)', alignSelf: 'stretch', margin: '0 32px' }} className="trust-divider" />

          {/* Stat 3 */}
          <div className="trust-stat" style={{ flex: '0 0 auto' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>
              Updated Weekly
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '3px' }}>
              Last update: Jul 17, 2026
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Track record: Live
              <span className="live-dot" />
            </div>
          </div>
        </div>

        {/* Editorial context — fixed width, never shrinks */}
        <div className="trust-editorial" style={{
          flex: '0 0 220px',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.65,
          textAlign: 'right',
          paddingLeft: '32px',
          borderLeft: '1px solid var(--color-divider)',
        }}>
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }}>Frontier</span>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '17px', color: 'var(--color-text)' }}>Watch</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', lineHeight: 1.6 }}>
            Frontier Watch is Technology intelligence for strategy professionals.<br />Not investment advice.
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
