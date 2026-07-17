// signal-card.jsx — SignalCard component

const { useState: useCardState, useEffect: useCardEffect, useRef: useCardRef } = React;

// ─── Domain badge config ────────────────────────────────────────────────────

const DOMAIN_BADGE_CLASS = {
  'Artificial Intelligence': 'badge-domain-ai',
  'Semiconductors': 'badge-domain-semi',
  'Quantum Computing': 'badge-domain-quantum',
};

const DOMAIN_SHORT = {
  'Artificial Intelligence': 'AI',
  'Semiconductors': 'Semiconductors',
  'Quantum Computing': 'Quantum',
};

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active: { label: 'Active', dotVar: 'var(--status-active)' },
  developing: { label: 'Developing', dotVar: 'var(--status-developing)' },
  resolved: { label: 'Resolved', dotVar: 'var(--status-resolved)' },
  invalidated: { label: 'Invalidated', dotVar: 'var(--status-invalidated)' },
};

// ─── Confidence tooltips ────────────────────────────────────────────────────

const CONFIDENCE_TIPS = [
  '',
  'Confidence 1/5 — Weak signal, preliminary observation only',
  'Confidence 2/5 — Limited evidence, significant gaps remain',
  'Confidence 3/5 — Moderate evidence with notable uncertainties',
  'Confidence 4/5 — Strong evidence, minor gaps in supporting data',
  'Confidence 5/5 — High confidence across multiple independent sources',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function horizonLabel(h) {
  const map = { '6-12': '6–12 mo', '12-18': '12–18 mo', '18-24': '18–24 mo' };
  return map[h] || h;
}

function truncate(str, max) {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function MicroLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--color-text-faint)',
      marginBottom: '8px',
      ...style,
    }}>
      {children}
    </div>
  );
}

function ConfidenceDots({ score }) {
  return (
    <div
      title={CONFIDENCE_TIPS[score]}
      style={{ display: 'flex', gap: '4px', alignItems: 'center', cursor: 'default' }}
    >
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: i <= score
              ? 'var(--color-primary)'
              : 'var(--color-surface-offset)',
            border: i <= score ? 'none' : '1.5px solid var(--color-border)',
            display: 'inline-block',
            flexShrink: 0,
            transition: 'background-color 200ms',
          }}
        />
      ))}
    </div>
  );
}

function DomainBadge({ domain }) {
  return (
    <span className={`domain-badge ${DOMAIN_BADGE_CLASS[domain] || ''}`}>
      {DOMAIN_SHORT[domain] || domain}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      height: '26px',
      padding: '0 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      color: 'var(--color-text-muted)',
      border: '1px solid var(--color-border)',
      backgroundColor: 'transparent',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: cfg.dotVar,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}

function HorizonChip({ horizon }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      height: '24px',
      padding: '0 8px',
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-xs)',
      backgroundColor: 'var(--color-surface-offset)',
      border: '1px solid var(--color-border)',
      letterSpacing: '0.01em',
    }}>
      <span style={{
        fontWeight: 500,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontSize: '10px',
      }}>Time Horizon</span>
      <span style={{
        fontWeight: 600,
        color: 'var(--color-text)',
        fontVariantNumeric: 'tabular-nums',
      }}>{horizonLabel(horizon)}</span>
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
      <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" />
      <path d="M8 1h3v3" />
      <line x1="11" y1="1" x2="5" y2="7" />
    </svg>
  );
}

// ─── Main SignalCard ─────────────────────────────────────────────────────────

function SignalCard({ signal, isExpanded, onToggle }) {
  const cardRef = useCardRef(null);

  // Scroll card into view on expand
  useCardEffect(() => {
    if (isExpanded && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      if (rect.top < 72) {
        const target = window.scrollY + rect.top - 72;
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
  }, [isExpanded]);

  const isInvalidated = signal.status === 'invalidated';
  const isResolved = signal.status === 'resolved';

  const cardStyle = {
    position: 'relative',
    backgroundColor: isInvalidated ? 'var(--color-surface-offset)' : 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '12px',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'box-shadow 180ms ease, border-color 180ms ease',
  };

  // Resolved: left accent border
  const resolvedAccent = isResolved ? {
    borderLeft: '3px solid var(--status-resolved)',
  } : {};

  return (
    <article
      ref={cardRef}
      style={{ ...cardStyle, ...resolvedAccent }}
      className="signal-card"
      onClick={onToggle}
    >
      {/* ── Collapsed header (sticky when expanded) ── */}
      <div
        style={{
          position: isExpanded ? 'sticky' : 'relative',
          top: isExpanded ? '57px' : 'auto',
          backgroundColor: isInvalidated ? 'var(--color-surface-offset)' : 'var(--color-surface)',
          zIndex: isExpanded ? 5 : 'auto',
          padding: '20px 24px',
        }}
      >
        {/* Row 1: badges + confidence */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}>
          <DomainBadge domain={signal.domain} />
          <StatusBadge status={signal.status} />
          <div style={{ flex: 1 }} />
          <ConfidenceDots score={signal.confidence} />
        </div>

        {/* Row 2: title */}
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 500,
          color: isInvalidated ? 'var(--color-text-muted)' : 'var(--color-text)',
          lineHeight: 1.35,
          marginBottom: '8px',
          letterSpacing: '-0.015em',
          textWrap: 'pretty',
        }}>
          {signal.title}
        </h2>

        {/* Row 3: thesis preview */}
        {!isExpanded && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            marginBottom: '14px',
          }}>
            {truncate(signal.thesis, 140)}
          </p>
        )}

        {/* Row 4: horizon + date + expand toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}>
          <HorizonChip horizon={signal.horizon} />
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            Added {fmt(signal.date_added)}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            userSelect: 'none',
          }}>
            <span style={{
              display: 'inline-block',
              transform: isExpanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              lineHeight: 1,
            }}>↓</span>
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          </span>
        </div>
      </div>

      {/* ── Expanded content ── */}
      <div
        style={{
          maxHeight: isExpanded ? '4000px' : '0',
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '0 24px 24px' }}>
          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--color-divider)', marginBottom: '20px' }} />

          {/* Thesis */}
          <div style={{ marginBottom: '20px' }}>
            <MicroLabel>Thesis</MicroLabel>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text)',
              lineHeight: 1.65,
              maxWidth: '680px',
              textWrap: 'pretty',
            }}>
              {signal.thesis}
            </p>
          </div>

          {/* Strategic Implication */}
          <div style={{ marginBottom: '20px' }}>
            <MicroLabel>Strategic Implication</MicroLabel>
            <div style={{
              backgroundColor: 'var(--color-accent-highlight)',
              borderLeft: '3px solid var(--color-primary)',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              padding: '14px 18px',
            }}>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text)',
                lineHeight: 1.65,
                textWrap: 'pretty',
              }}>
                {signal.strategic_implication}
              </p>
            </div>
          </div>

          {/* What to Watch */}
          {signal.what_to_watch && signal.what_to_watch.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <MicroLabel>What to Watch</MicroLabel>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {signal.what_to_watch.map((item, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    gap: '10px',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.6,
                  }}>
                    <span style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      flexShrink: 0,
                      marginTop: '7px',
                    }} />
                    <span style={{ textWrap: 'pretty' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Outcome — resolved/invalidated only */}
          {signal.outcome && (
            <div style={{ marginBottom: '20px' }}>
              <MicroLabel>Outcome</MicroLabel>
              <div style={{
                backgroundColor: isInvalidated
                  ? 'var(--color-surface-offset)'
                  : 'var(--color-accent-highlight)',
                border: '1px solid var(--color-divider)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '16px',
                alignItems: 'start',
              }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: '4px', letterSpacing: '0.03em' }}>Original thesis</div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.55, textWrap: 'pretty' }}>
                    {signal.outcome.original_thesis}
                  </p>
                </div>
                <div style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)', paddingTop: '22px' }}>→</div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: '4px', letterSpacing: '0.03em' }}>What happened</div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', lineHeight: 1.55, textWrap: 'pretty' }}>
                    {signal.outcome.what_happened}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Related Briefs */}
          {signal.related_briefs && signal.related_briefs.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <MicroLabel>Related Briefs</MicroLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {signal.related_briefs.map((brief, i) => (
                  <a
                    key={i}
                    href={brief.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      textDecoration: 'none',
                      color: 'var(--color-primary)',
                    }}
                    onClick={e => e.stopPropagation()}
                    onMouseEnter={e => { e.currentTarget.querySelector('.brief-title').style.textDecoration = 'underline'; }}
                    onMouseLeave={e => { e.currentTarget.querySelector('.brief-title').style.textDecoration = 'none'; }}
                  >
                    <ExternalLinkIcon />
                    <span className="brief-title" style={{
                      flex: 1,
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}>
                      {brief.title}
                    </span>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-faint)',
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                      paddingTop: '1px',
                    }}>
                      {fmt(brief.date)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Card footer */}
          <div style={{
            borderTop: '1px solid var(--color-divider)',
            marginTop: '12px',
            paddingTop: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.02em',
            }}>
              Signal ID: {signal.id}
            </span>
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              Last updated {fmt(signal.date_updated)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Exports ────────────────────────────────────────────────────────────────

Object.assign(window, { SignalCard });
