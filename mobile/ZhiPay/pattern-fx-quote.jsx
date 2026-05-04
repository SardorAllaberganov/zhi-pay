/* global React */
const { useState, useEffect, useMemo } = React;

// ─────────────────────────────────────────────────────────────────────
// Helpers — money formatting, locale separators
// ─────────────────────────────────────────────────────────────────────

// Always work in minor units (tiyin / fen). Display with locale separator.
function fmt(minor, code, locale = 'uz') {
  const major = Number(minor) / 100;
  const decimals = code === 'CNY' ? 2 : 2;
  const fixed = major.toFixed(decimals);
  const [intPart, dec] = fixed.split('.');
  const groupSep = locale === 'en' ? ',' : '\u202F'; // narrow no-break space for uz/ru
  const decSep   = locale === 'en' ? '.' : ',';
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
  const num = decimals ? `${grouped}${decSep}${dec}` : grouped;
  return `${num}\u00A0${code}`;
}
function fmtRate(rate, locale = 'uz') {
  // rate is UZS/CNY at full precision
  const fixed = rate.toFixed(2);
  const [intPart, dec] = fixed.split('.');
  const groupSep = locale === 'en' ? ',' : '\u202F';
  const decSep   = locale === 'en' ? '.' : ',';
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
  return `${grouped}${decSep}${dec}`;
}

// ─────────────────────────────────────────────────────────────────────
// Icons — lucide stroke set, 2pt stroke, sized 16/20
// ─────────────────────────────────────────────────────────────────────
const Lucide = {
  Lock: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Info: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  ),
  AlertTriangle: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  AlertCircle: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Clock: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  WifiOff: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/><path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/><path d="M5 13a10 10 0 0 1 5.24-2.76"/><line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  ),
  ChevronDown: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────
// Card — composed primitive (Components/Card  Header-Body variant)
// ─────────────────────────────────────────────────────────────────────
function Card({ children, dark, style = {}, padded = true }) {
  const t = dark ? window.Tdark : window.T;
  return (
    <div style={{
      background: dark ? t.slate100 : window.T.white,
      borderRadius: window.radius.md,
      boxShadow: dark ? 'none' : window.shadow.sm,
      border: dark ? `1px solid ${t.slate200}` : 'none',
      padding: padded ? 20 : 0,
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Headline Number  Hero
// ─────────────────────────────────────────────────────────────────────
function HeadlineNumber({ amount, currency, locale = 'uz', size = 'hero', dark, accent = false }) {
  const t = dark ? window.Tdark : window.T;
  const sizes = {
    display: { num: 44, cur: 22, gap: 8, weight: 700, lh: '52px' },
    hero:    { num: 32, cur: 16, gap: 6, weight: 700, lh: '40px' },
    inline:  { num: 22, cur: 14, gap: 4, weight: 600, lh: '28px' },
  };
  const s = sizes[size];
  const formatted = fmt(amount, currency, locale);
  const idx = formatted.lastIndexOf('\u00A0');
  const num = formatted.slice(0, idx);
  const cur = formatted.slice(idx + 1);
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'baseline', gap: s.gap,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      color: accent ? window.T.brand600 : t.slate900,
    }}>
      <span style={{ fontSize: s.num, lineHeight: s.lh, fontWeight: s.weight, letterSpacing: '-0.01em' }}>{num}</span>
      <span style={{ fontSize: s.cur, fontWeight: 500, color: dark ? t.slate500 : window.T.slate500, letterSpacing: '0.04em' }}>{cur}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Banner — info / success / warning / danger
// ─────────────────────────────────────────────────────────────────────
function Banner({ tone = 'info', icon: Icon = Lucide.Info, title, body, dark }) {
  const palette = {
    info:    { bg: dark ? 'rgba(10,100,188,0.14)' : window.T.brand50,    fg: window.T.brand700,   border: dark ? 'rgba(10,100,188,0.32)' : 'transparent' },
    success: { bg: dark ? 'rgba(34,197,94,0.14)'  : window.T.success50,  fg: window.T.success900, border: 'transparent' },
    warning: { bg: dark ? 'rgba(220,138,5,0.14)'  : window.T.warning50,  fg: window.T.warning900, border: 'transparent' },
    danger:  { bg: dark ? 'rgba(220,38,38,0.16)'  : window.T.danger50,   fg: window.T.danger900,  border: 'transparent' },
  };
  const p = palette[tone];
  return (
    <div role="status" style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      background: p.bg, color: p.fg,
      border: `1px solid ${p.border}`,
      borderRadius: window.radius.md, padding: '12px 14px',
    }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}><Icon size={18} color={p.fg}/></div>
      <div style={{ minWidth: 0, flex: 1 }}>
        {title && <div style={{ ...window.type.bodySmSemi, color: p.fg }}>{title}</div>}
        {body && <div style={{ ...window.type.bodySm, color: p.fg, opacity: 0.86, marginTop: title ? 2 : 0 }}>{body}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Chip — Status (sm)
// ─────────────────────────────────────────────────────────────────────
function Chip({ tone = 'info', children, icon: Icon }) {
  const palette = {
    info:    { bg: window.T.brand50,    fg: window.T.brand700 },
    success: { bg: window.T.success50,  fg: window.T.success900 },
    warning: { bg: window.T.warning50,  fg: window.T.warning900 },
    danger:  { bg: window.T.danger50,   fg: window.T.danger900 },
    neutral: { bg: window.T.slate100,   fg: window.T.slate700 },
  };
  const p = palette[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: p.bg, color: p.fg,
      borderRadius: window.radius.pill,
      padding: '3px 8px',
      ...window.type.label,
      fontSize: 11, lineHeight: '14px',
    }}>
      {Icon && <Icon size={11} color={p.fg}/>}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Pattern 1: FX-quote breakdown
// composes Card + Headline Number + List Row + Banner + Chip
// props: amountUzs (tiyin), feeUzs (tiyin), feeRatePct, fxSpreadUzs (tiyin),
//        totalChargeUzs (tiyin), amountCny (fen), clientRate (UZS per CNY),
//        locale, dark, state ('default'|'loading'|'stale'|'error'|'offline'|'rateMoved')
//        ttlSeconds (number | null)
// ─────────────────────────────────────────────────────────────────────
function FxQuoteBreakdown({
  amountUzs, feeUzs, feeRatePct, fxSpreadUzs,
  totalChargeUzs, amountCny, clientRate,
  locale = 'uz', dark = false,
  state = 'default',
  ttlSeconds = 154,
  internationalCard = false,
  i18n,
}) {
  const t = dark ? window.Tdark : window.T;
  const T = window.T;
  const muted = dark ? T.slate400 : T.slate500;
  const fg    = dark ? T.white    : T.slate900;
  const divider = dark ? t.slate200 : T.slate200;

  // Rate-lock countdown — local timer
  const [secs, setSecs] = useState(ttlSeconds);
  useEffect(() => {
    if (state !== 'default' && state !== 'rateMoved') return;
    if (secs <= 0) return;
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [state, secs]);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const lowTime = secs <= 30;

  // ---- LOADING SKELETON ------------------------------------------------
  if (state === 'loading') {
    return (
      <Card dark={dark}>
        <SkeletonRows dark={dark}/>
      </Card>
    );
  }

  // ---- ERROR STATE -----------------------------------------------------
  if (state === 'error') {
    return (
      <Card dark={dark}>
        <Banner
          tone="danger"
          icon={Lucide.AlertCircle}
          title={i18n.errorTitle}
          body={i18n.errorBody}
          dark={dark}
        />
        <button style={{
          marginTop: 12, width: '100%', height: 44,
          borderRadius: window.radius.md, border: `1px solid ${divider}`,
          background: 'transparent', color: fg, ...window.type.bodySmSemi, cursor: 'pointer',
        }}>{i18n.retry}</button>
      </Card>
    );
  }

  // ---- OFFLINE ---------------------------------------------------------
  if (state === 'offline') {
    return (
      <Card dark={dark}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Banner
            tone="warning"
            icon={Lucide.WifiOff}
            title={i18n.offlineTitle}
            body={i18n.offlineBody}
            dark={dark}
          />
          <Row label={i18n.youSend} dark={dark}>
            <span style={{ ...window.type.monoBody, color: fg, whiteSpace: 'nowrap' }}>{fmt(amountUzs, 'UZS', locale)}</span>
          </Row>
          <div style={{ height: 1, background: divider, margin: '4px 0' }}/>
          <Row label={i18n.recipientGets} dark={dark}>
            <span style={{ ...window.type.monoBody, color: muted, whiteSpace: 'nowrap' }}>—</span>
          </Row>
        </div>
      </Card>
    );
  }

  // ---- DEFAULT + STALE + RATE-MOVED -----------------------------------
  return (
    <Card dark={dark} padded={false}>
      {/* Hero: recipient gets — focal point */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: `1px solid ${divider}`,
      }}>
        <div style={{ ...window.type.label, color: muted, marginBottom: 6 }}>
          {i18n.recipientGets}
        </div>
        <HeadlineNumber amount={amountCny} currency="CNY" locale={locale} size="hero" dark={dark} accent/>
        <div style={{ ...window.type.bodySm, color: muted, marginTop: 6 }}>
          {i18n.alipayLabel}
        </div>
      </div>

      {/* Breakdown rows */}
      <div style={{ padding: '16px 20px 4px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Row label={i18n.youSend} dark={dark}>
          <span style={{ ...window.type.monoBodySm, color: fg, fontWeight: 500, whiteSpace: 'nowrap' }}>{fmt(amountUzs, 'UZS', locale)}</span>
        </Row>
        <Row label={i18n.serviceFee} dark={dark} sublabel={internationalCard ? i18n.intlCardNote : `${feeRatePct.toFixed(1)}%`} sublabelTone={internationalCard ? 'warning' : 'muted'}>
          <span style={{ ...window.type.monoBodySm, color: fg, whiteSpace: 'nowrap' }}>{fmt(feeUzs, 'UZS', locale)}</span>
        </Row>
        <Row label={i18n.fxSpread} dark={dark} info>
          <span style={{ ...window.type.monoBodySm, color: fg, whiteSpace: 'nowrap' }}>{fmt(fxSpreadUzs, 'UZS', locale)}</span>
        </Row>
      </div>

      {/* Total charge — emphasized row */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${divider}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ ...window.type.bodySmSemi, color: fg }}>{i18n.totalCharge}</span>
        <span style={{ ...window.type.monoBody, color: fg, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {fmt(totalChargeUzs, 'UZS', locale)}
        </span>
      </div>

      {/* Rate row + lock chip */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${divider}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...window.type.bodySm, color: muted }}>{i18n.rate}</span>
          <span style={{ ...window.type.monoBodySm, color: fg, whiteSpace: 'nowrap' }}>
            1 CNY = {fmtRate(clientRate, locale)} UZS
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip tone={state === 'stale' ? 'warning' : 'info'} icon={state === 'stale' ? Lucide.AlertTriangle : Lucide.Lock}>
            {state === 'stale' ? i18n.stale : i18n.locked}
          </Chip>
          {(state === 'default' || state === 'rateMoved') && (
            <span style={{
              ...window.type.monoLabel,
              color: lowTime ? T.warning900 : muted,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <PulseDot color={lowTime ? T.warning500 : T.brand600} active={lowTime}/>
              {i18n.lockedFor} {mm}:{ss}
            </span>
          )}
        </div>
      </div>

      {/* Conditional banners below the breakdown */}
      {state === 'rateMoved' && (
        <div style={{ padding: '0 20px 20px' }}>
          <Banner
            tone="info"
            icon={Lucide.Info}
            title={i18n.rateMovedTitle}
            body={i18n.rateMovedBody}
            dark={dark}
          />
        </div>
      )}
      {state === 'stale' && (
        <div style={{ padding: '0 20px 20px' }}>
          <Banner
            tone="warning"
            icon={Lucide.AlertTriangle}
            title={i18n.staleTitle}
            body={i18n.staleBody}
            dark={dark}
          />
        </div>
      )}
      {(state === 'default' && !state === 'rateMoved') && (
        <div style={{ padding: '0 20px 20px' }}/>
      )}
      {state === 'default' && (
        <div style={{ padding: '0 20px 20px', ...window.type.bodySm, color: muted }}>
          {i18n.disclosure}
        </div>
      )}
    </Card>
  );
}

// inline row
function Row({ label, sublabel, sublabelTone, children, dark, info }) {
  const t = dark ? window.Tdark : window.T;
  const muted = dark ? window.T.slate400 : window.T.slate500;
  const subColor = sublabelTone === 'warning' ? window.T.warning900 : muted;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', minHeight: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{ ...window.type.bodySm, color: dark ? t.slate900 : window.T.slate700 }}>{label}</span>
        {info && <Lucide.Info size={13} color={muted}/>}
        {sublabel && <span style={{ ...window.type.bodySm, color: subColor }}>· {sublabel}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

// pulse dot — honors prefers-reduced-motion
function PulseDot({ color, active }) {
  return (
    <span style={{ position: 'relative', width: 8, height: 8 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color,
      }}/>
      {active && (
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: color, opacity: 0.4,
          animation: 'zhipayPulse 1200ms ease-out infinite',
        }}/>
      )}
    </span>
  );
}

// loading skeleton
function SkeletonRows({ dark }) {
  const bg = dark ? 'rgba(255,255,255,0.06)' : window.T.slate100;
  const Sk = ({ w, h = 16 }) => (
    <span style={{ display: 'inline-block', width: w, height: h, background: bg, borderRadius: 6, animation: 'zhipayShimmer 1400ms linear infinite' }}/>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><Sk w={80} h={11}/></div>
      <div><Sk w={180} h={36}/></div>
      <div style={{ height: 1, background: dark ? 'rgba(255,255,255,0.06)' : window.T.slate200, margin: '4px 0' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><Sk w={80}/><Sk w={120}/></div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><Sk w={100}/><Sk w={90}/></div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><Sk w={70}/><Sk w={80}/></div>
      <div style={{ height: 1, background: dark ? 'rgba(255,255,255,0.06)' : window.T.slate200, margin: '4px 0' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><Sk w={90} h={18}/><Sk w={130} h={18}/></div>
    </div>
  );
}

Object.assign(window, { FxQuoteBreakdown, Card, HeadlineNumber, Banner, Chip, Lucide, fmt, fmtRate });
