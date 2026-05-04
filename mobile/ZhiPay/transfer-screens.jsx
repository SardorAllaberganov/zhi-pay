// ZhiPay — Transfer flow screens
// Recipient select → Amount entry → Review → Processing → Success

const { T: TT, type: Ttype, radius: Tradius, shadow: Tshadow } = window;
const { PrimaryBtn, GhostBtn, ZhiMark } = window;
const { Avatar } = window;

// ─── Strings ────────────────────────────────────────────────
const XFER_STRINGS = {
  uz: {
    selectRecipient: 'Oluvchini tanlang',
    sendTo: 'Kimga yubormoqchisiz?',
    searchPlaceholder: 'Ism yoki Alipay ID',
    addNew: "Yangi oluvchi qo\u2018shish",
    newName: 'Oluvchi ismi',
    newNamePlaceholder: 'Masalan: Wang Lei',
    newAlipay: 'Hisob ID yoki telefon',
    paymentMethod: 'To\'lov usuli',
    recentRecipients: 'Oxirgi oluvchilar',
    newAlipayPlaceholder: '138XXXX6721',
    newSave: 'Davom etish',
    savedRecipients: 'Saqlangan oluvchilar',
    recent: 'Oxirgi',
    alipayId: 'Alipay ID',
    amountTitle: 'Qancha yuborasiz?',
    youSend: 'Siz yuborasiz',
    theyGet: 'Ular oladi',
    rate: 'Kurs',
    fee: 'Komissiya',
    total: 'Jami yechiladi',
    continueBtn: 'Davom etish',
    confirmBtn: "O\u2018tkazishni tasdiqlash",
    reviewTitle: "To\u2018lovni ko\u2018rib chiqish",
    to: 'Kimga',
    from: 'Kimdan',
    myUzcardLabel: 'Uzcard •••• 4578',
    processingTitle: "To\u2018lov amalga oshirilmoqda\u2026",
    processingSub: 'Bu 10–30 soniya davom etadi.',
    successTitle: 'Muvaffaqiyatli yuborildi!',
    successSub: (name) => `${name} ga pul yetib boradi\ntaxminan 30 soniyada.`,
    successCta: 'Asosiy sahifaga',
    sendAnother: 'Yana yuborish',
    backToHome: 'Asosiy sahifaga',
  },
  ru: {
    selectRecipient: 'Выберите получателя',
    sendTo: 'Кому отправить?',
    searchPlaceholder: 'Имя или Alipay ID',
    addNew: 'Добавить получателя',
    newName: 'Имя получателя',
    newNamePlaceholder: 'Например: Wang Lei',
    newAlipay: 'ID аккаунта или телефон',
    paymentMethod: 'Способ оплаты',
    recentRecipients: 'Недавние получатели',
    newAlipayPlaceholder: '138XXXX6721',
    newSave: 'Продолжить',
    savedRecipients: 'Сохранённые',
    recent: 'Недавние',
    alipayId: 'Alipay ID',
    amountTitle: 'Сколько отправить?',
    youSend: 'Вы отправляете',
    theyGet: 'Получатель получит',
    rate: 'Курс',
    fee: 'Комиссия',
    total: 'Всего к списанию',
    continueBtn: 'Продолжить',
    confirmBtn: 'Подтвердить перевод',
    reviewTitle: 'Проверьте перевод',
    to: 'Кому',
    from: 'Откуда',
    myUzcardLabel: 'Uzcard •••• 4578',
    processingTitle: 'Выполняется перевод…',
    processingSub: 'Это займёт 10–30 секунд.',
    successTitle: 'Успешно отправлено!',
    successSub: (name) => `Деньги поступят ${name}\nпримерно через 30 секунд.`,
    successCta: 'На главную',
    sendAnother: 'Ещё один перевод',
    backToHome: 'На главную',
  },
  en: {
    selectRecipient: 'Select recipient',
    sendTo: 'Who are you sending to?',
    searchPlaceholder: 'Name or Alipay ID',
    addNew: 'Add new recipient',
    newName: 'Recipient name',
    newNamePlaceholder: 'e.g. Wang Lei',
    newAlipay: 'Account ID or phone',
    paymentMethod: 'Payment method',
    recentRecipients: 'Recent recipients',
    newAlipayPlaceholder: '138XXXX6721',
    newSave: 'Continue',
    savedRecipients: 'Saved',
    recent: 'Recent',
    alipayId: 'Alipay ID',
    amountTitle: 'How much to send?',
    youSend: 'You send',
    theyGet: 'They get',
    rate: 'Rate',
    fee: 'Fee',
    total: 'Total charged',
    continueBtn: 'Continue',
    confirmBtn: 'Confirm transfer',
    reviewTitle: 'Review transfer',
    to: 'To',
    from: 'From',
    myUzcardLabel: 'Uzcard •••• 4578',
    processingTitle: 'Processing transfer…',
    processingSub: 'This takes 10–30 seconds.',
    successTitle: 'Sent successfully!',
    successSub: (name) => `Money will arrive in ${name}'s\nAlipay in ~30 seconds.`,
    successCta: 'Back to home',
    sendAnother: 'Send another',
    backToHome: 'Back to home',
  },
};

const MOCK_RECIPIENTS = [
  { id: 'r1', name: 'Wang Lei', alipay: '138****6721', initials: 'WL', color: '#3B82F6' },
  { id: 'r2', name: 'Liu Mei', alipay: '139****4422', initials: 'LM', color: '#EC4899' },
  { id: 'r3', name: 'Chen Hao', alipay: '186****9810', initials: 'CH', color: '#10B981' },
  { id: 'r4', name: 'Zhang Wei', alipay: '152****1199', initials: 'ZW', color: '#F59E0B' },
];

function fmtXfer(n, ccy, locale, useRegularSpace) {
  const groupSep = locale === 'en' ? ',' : (useRegularSpace ? ' ' : '\u202F');
  const decSep = locale === 'en' ? '.' : ',';
  const decimals = ccy === 'CNY' ? 2 : 0;
  const fixed = n.toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
  return dec ? `${grouped}${decSep}${dec}\u00A0${ccy}` : `${grouped}\u00A0${ccy}`;
}

// ─── Screen top bar ─────────────────────────────────────────
function XferTopBar({ dark, title, onBack }) {
  const fg = dark ? '#fff' : TT.slate900;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 12px' }}>
      <button onClick={onBack} style={{
        width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: dark ? 'rgba(255,255,255,0.08)' : TT.slate100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div style={{ flex: 1, ...Ttype.bodySemi, color: fg, textAlign: 'center' }}>{title}</div>
      <div style={{ width: 36 }}/>
    </div>
  );
}

// ─── 1. Recipient select ────────────────────────────────────
function RecipientSelectScreen({ dark, locale, onSelect, onAddNew, onBack }) {
  const s = XFER_STRINGS[locale];
  const bg = dark ? TT.slate50 : '#fff';
  const fg = dark ? '#fff' : TT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : TT.slate500;
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : TT.slate50;
  const border = dark ? 'rgba(255,255,255,0.12)' : TT.slate200;
  const [query, setQuery] = React.useState('');
  const filtered = MOCK_RECIPIENTS.filter(r =>
    !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.alipay.includes(query)
  );
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <XferTopBar dark={dark} title={s.selectRecipient} onBack={onBack}/>
      {/* Search */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, height: 48, borderRadius: 14,
          background: fieldBg, border: `1px solid ${border}`, padding: '0 14px',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={s.searchPlaceholder}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: fg, ...Ttype.body, fontSize: 15 }}
          />
        </div>
      </div>
      {/* Add new */}
      <button onClick={onAddNew} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
        background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : TT.slate100}`,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.2)' : TT.slate300}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: TT.brand600,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <div style={{ ...Ttype.bodyMed, color: TT.brand600 }}>{s.addNew}</div>
      </button>
      {/* List */}
      <div style={{ padding: '12px 20px 4px' }}>
        <div style={{ ...Ttype.label, fontSize: 11, color: muted, marginBottom: 8 }}>{s.savedRecipients}</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map(r => (
          <button key={r.id} onClick={() => onSelect(r)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
            background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : TT.slate50}`,
          }}>
            <Avatar initials={r.initials} color={r.color} size={48}/>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ ...Ttype.bodyMed, color: fg }}>{r.name}</div>
              <div style={{ ...Ttype.bodySm, color: muted, fontSize: 13 }}>{s.alipayId}: {r.alipay}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 2. Amount entry ────────────────────────────────────────
// Masking helper: format number with space separators as you type
function maskAmount(raw) {
  // strip non-digit/non-dot
  let clean = raw.replace(/[^\d.]/g, '');
  // only one decimal point
  const parts = clean.split('.');
  if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join('');
  const [int, dec] = clean.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return dec !== undefined ? `${grouped}.${dec}` : grouped;
}
function unmaskAmount(masked) {
  return parseFloat(masked.replace(/\s/g, '').replace(',', '.')) || 0;
}

function AmountEntryScreen({ dark, locale, recipient, onContinue, onBack }) {
  const s = XFER_STRINGS[locale];
  const bg = dark ? TT.slate50 : '#fff';
  const fg = dark ? '#fff' : TT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : TT.slate500;
  const border = dark ? 'rgba(255,255,255,0.08)' : TT.slate100;
  const RATE = 1404.17;

  // primary = which currency the user is typing in
  const [primary, setPrimary] = React.useState('CNY'); // 'CNY' | 'UZS'
  const [inputVal, setInputVal] = React.useState('3 600');

  const rawNum = unmaskAmount(inputVal);
  const cny = primary === 'CNY' ? rawNum : (RATE > 0 ? rawNum / RATE : 0);
  const uzs = primary === 'UZS' ? rawNum : Math.round(rawNum * RATE);
  const secondaryVal = primary === 'CNY'
    ? maskAmount(Math.round(rawNum * RATE).toString())
    : maskAmount(cny.toFixed(2));

  const handleSwap = () => {
    const newPrimary = primary === 'CNY' ? 'UZS' : 'CNY';
    setPrimary(newPrimary);
    // set input to the current secondary value
    setInputVal(secondaryVal);
  };

  const topLabel = primary === 'CNY' ? s.theyGet : s.youSend;
  const topCcy = primary === 'CNY' ? 'CNY' : 'UZS';
  const botLabel = primary === 'CNY' ? s.youSend : s.theyGet;
  const botCcy = primary === 'CNY' ? 'UZS' : 'CNY';

  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <XferTopBar dark={dark} title={s.amountTitle} onBack={onBack}/>
      {/* Recipient chip */}
      <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials={recipient.initials} color={recipient.color} size={36}/>
        <div>
          <div style={{ ...Ttype.bodySmSemi, color: fg }}>{recipient.name}</div>
          <div style={{ ...Ttype.bodySm, color: muted, fontSize: 12 }}>{recipient.alipay}</div>
        </div>
      </div>
      {/* Amount fields */}
      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Primary input */}
        <div style={{
          borderRadius: 18, padding: 20,
          background: dark ? 'rgba(22,119,255,0.08)' : TT.brand50,
          border: `1.5px solid ${dark ? 'rgba(22,119,255,0.24)' : TT.brand100}`,
        }}>
          <div style={{ ...Ttype.label, fontSize: 10, color: muted, marginBottom: 8 }}>{topLabel}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(maskAmount(e.target.value))}
              inputMode="decimal"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                ...Ttype.monoBody, fontSize: 36, fontWeight: 700, color: TT.brand600,
                padding: 0, letterSpacing: '-0.02em', width: '100%', minWidth: 0,
              }}
            />
            <span style={{ ...Ttype.heading, color: muted, flexShrink: 0 }}>{topCcy}</span>
          </div>
        </div>
        {/* Swap button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleSwap} style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: dark ? 'rgba(255,255,255,0.08)' : TT.slate100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 120ms',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 12l-3-3m3 3l3-3"/><path d="M17 8v12m0-12l3 3m-3-3l-3 3"/>
            </svg>
          </button>
        </div>
        {/* Secondary output */}
        <div style={{
          borderRadius: 18, padding: 20,
          background: dark ? 'rgba(255,255,255,0.04)' : TT.slate50,
          border: `1px solid ${border}`,
        }}>
          <div style={{ ...Ttype.label, fontSize: 10, color: muted, marginBottom: 8 }}>{botLabel}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...Ttype.monoBody, fontSize: 28, fontWeight: 600, color: fg, whiteSpace: 'nowrap' }}>
              {secondaryVal}
            </span>
            <span style={{ ...Ttype.bodyMed, color: muted, flexShrink: 0 }}>{botCcy}</span>
          </div>
        </div>
        {/* Rate info row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: TT.success500 }}/>
          <span style={{ ...Ttype.monoBodySm, fontSize: 13, color: muted, whiteSpace: 'nowrap' }}>
            1{'\u00A0'}CNY = 1{'\u00A0'}404.17{'\u00A0'}UZS
          </span>
        </div>
      </div>
      <div style={{ padding: '12px 20px 24px' }}>
        <PrimaryBtn dark={dark} disabled={rawNum <= 0} onClick={() => onContinue(cny)}>{s.continueBtn}</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── 3. Review ──────────────────────────────────────────────
function ReviewScreen({ dark, locale, recipient, cny, onConfirm, onBack }) {
  const s = XFER_STRINGS[locale];
  const bg = dark ? TT.slate50 : '#fff';
  const fg = dark ? '#fff' : TT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : TT.slate500;
  const border = dark ? 'rgba(255,255,255,0.06)' : TT.slate100;
  const RATE = 1404.17;
  const uzs = Math.round(cny * RATE);
  const feePct = 0.5;
  const feeUzs = Math.round(uzs * feePct / 100);
  const spreadUzs = Math.round(cny * 3.2);
  const totalUzs = uzs + feeUzs + spreadUzs;
  const groupSep = locale === 'en' ? ',' : '\u202F';
  const decSep = locale === 'en' ? '.' : ',';

  function fmtR(n, ccy) { return fmtXfer(n, ccy, locale); }

  const [secs, setSecs] = React.useState(60);
  React.useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(1, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <XferTopBar dark={dark} title={s.reviewTitle} onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hero amount */}
        <div style={{
          padding: '24px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <div style={{ ...Ttype.label, fontSize: 10, color: muted, marginBottom: 16, whiteSpace: 'nowrap' }}>{s.theyGet}</div>
          <div style={{ ...Ttype.monoBody, fontSize: 36, fontWeight: 700, color: TT.brand600, whiteSpace: 'nowrap' }}>
            {fmtR(cny, 'CNY')}
          </div>
          <div style={{ ...Ttype.bodySm, color: muted, whiteSpace: 'nowrap' }}>
            ≈ {fmtXfer(uzs, 'UZS', locale, true)}
          </div>
        </div>

        {/* Recipient card */}
        <div style={{
          borderRadius: 16, padding: 16,
          background: dark ? 'rgba(255,255,255,0.04)' : TT.slate50,
          border: `1px solid ${border}`,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <ReviewRow label={s.to} dark={dark}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar initials={recipient.initials} color={recipient.color} size={28}/>
              <div>
                <div style={{ ...Ttype.bodySmSemi, color: fg }}>{recipient.name}</div>
                <div style={{ ...Ttype.bodySm, color: muted, fontSize: 11 }}>Alipay · {recipient.alipay}</div>
              </div>
            </div>
          </ReviewRow>
          <div style={{ height: 1, background: border }}/>
          <ReviewRow label={s.from} dark={dark}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: '#1A6DD4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...Ttype.label, fontSize: 9, color: '#fff', letterSpacing: 0,
              }}>UC</div>
              <div style={{ ...Ttype.bodySmSemi, color: fg }}>{s.myUzcardLabel}</div>
            </div>
          </ReviewRow>
        </div>

        {/* Breakdown card */}
        <div style={{
          borderRadius: 16, padding: 16,
          background: dark ? 'rgba(255,255,255,0.04)' : TT.slate50,
          border: `1px solid ${border}`,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <ReviewRow label={s.youSend} dark={dark}>
            <span style={{ ...Ttype.monoBodySm, color: fg, fontWeight: 500, whiteSpace: 'nowrap' }}>{fmtR(uzs, 'UZS')}</span>
          </ReviewRow>
          <ReviewRow label={`${s.fee} (${feePct}%)`} dark={dark}>
            <span style={{ ...Ttype.monoBodySm, color: fg, whiteSpace: 'nowrap' }}>{fmtR(feeUzs, 'UZS')}</span>
          </ReviewRow>
          <div style={{ height: 1, background: border }}/>
          <ReviewRow label={s.total} dark={dark} bold>
            <span style={{ ...Ttype.monoBodySm, color: fg, fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtR(totalUzs, 'UZS')}</span>
          </ReviewRow>
          <div style={{ height: 1, background: border }}/>
          <ReviewRow label={s.rate} dark={dark}>
            <span style={{ ...Ttype.monoBodySm, color: fg, whiteSpace: 'nowrap' }}>
              1{'\u00A0'}CNY = {`1${groupSep}404${decSep}17`}{'\u00A0'}UZS
            </span>
          </ReviewRow>
          {/* Lock chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
              borderRadius: 8, background: dark ? 'rgba(22,119,255,0.12)' : TT.brand50,
              ...Ttype.monoLabel, fontSize: 11, color: TT.brand600,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {mm}:{ss}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 20px 24px' }}>
        <PrimaryBtn dark={dark} onClick={onConfirm}>{s.confirmBtn}</PrimaryBtn>
      </div>
    </div>
  );
}

function ReviewRow({ label, children, dark, bold }) {
  const fg = dark ? '#fff' : TT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : TT.slate500;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ ...Ttype.bodySm, color: muted, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <div style={{ textAlign: 'right' }}>{children}</div>
    </div>
  );
}

// ─── 4. Processing ──────────────────────────────────────────
function ProcessingScreen({ dark, locale, onDone }) {
  const s = XFER_STRINGS[locale];
  const bg = dark ? TT.slate50 : '#fff';
  const fg = dark ? '#fff' : TT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : TT.slate500;
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(id); setTimeout(onDone, 400); return 100; }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 28, padding: 40, textAlign: 'center',
    }}>
      {/* Spinner */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke={dark ? 'rgba(255,255,255,0.08)' : TT.slate100} strokeWidth="4"/>
          <circle cx="40" cy="40" r="34" fill="none" stroke={TT.brand600} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 120ms' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TT.brand600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </div>
      </div>
      <div>
        <div style={{ ...Ttype.heading, color: fg, marginBottom: 8 }}>{s.processingTitle}</div>
        <div style={{ ...Ttype.body, color: muted }}>{s.processingSub}</div>
      </div>
    </div>
  );
}

// ─── 5. Success ─────────────────────────────────────────────
function SuccessScreen({ dark, locale, recipient, cny, onHome, onSendAnother }) {
  const s = XFER_STRINGS[locale];
  const bg = dark ? TT.slate50 : '#fff';
  const fg = dark ? '#fff' : TT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : TT.slate500;
  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: '40px 24px', textAlign: 'center',
    }}>
      {/* Checkmark */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        background: TT.success50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 32px rgba(34,197,94,0.24)',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={TT.success900} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div>
        <div style={{ ...Ttype.display2, color: fg, fontSize: 26, marginBottom: 8 }}>{s.successTitle}</div>
        <div style={{ ...Ttype.body, color: muted, whiteSpace: 'pre-line', lineHeight: '24px' }}>{s.successSub(recipient.name)}</div>
      </div>
      {/* Amount summary */}
      <div style={{
        borderRadius: 16, padding: 16,
        background: dark ? 'rgba(255,255,255,0.04)' : TT.slate50,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : TT.slate100}`,
        display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'stretch',
      }}>
        <Avatar initials={recipient.initials} color={recipient.color} size={44}/>
        <div style={{ flex: 1 }}>
          <div style={{ ...Ttype.bodySmSemi, color: fg }}>{recipient.name}</div>
          <div style={{ ...Ttype.bodySm, color: muted, fontSize: 12 }}>Alipay · {recipient.alipay}</div>
        </div>
        <div style={{ ...Ttype.monoBody, fontWeight: 600, color: TT.brand600, whiteSpace: 'nowrap' }}>
          {fmtXfer(cny, 'CNY', locale)}
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <PrimaryBtn dark={dark} onClick={onSendAnother}>{s.sendAnother}</PrimaryBtn>
        <GhostBtn dark={dark} onClick={onHome}>{s.backToHome}</GhostBtn>
      </div>
    </div>
  );
}

// ─── 1b. Send to recipient ──────────────────────────────────
function AddRecipientScreen({ dark, locale, onDone, onBack }) {
  const s = XFER_STRINGS[locale];
  const bg = dark ? TT.slate50 : '#fff';
  const fg = dark ? '#fff' : TT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : TT.slate500;
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : TT.slate50;
  const border = dark ? 'rgba(255,255,255,0.12)' : TT.slate200;
  const divider = dark ? 'rgba(255,255,255,0.06)' : TT.slate100;
  const [name, setName] = React.useState('');
  const [accountId, setAccountId] = React.useState('');
  const [method, setMethod] = React.useState('alipay'); // 'alipay' | 'wechat'
  const valid = name.trim().length >= 2 && accountId.trim().length >= 6;
  const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
  const methodLabel = method === 'alipay' ? 'Alipay' : 'WeChat';

  const SAVED = [
    { id: 'r1', name: 'Wang Lei', alipay: '138****6721', initials: 'WL', color: '#3B82F6', method: 'alipay' },
    { id: 'r2', name: 'Liu Mei', alipay: '139****4422', initials: 'LM', color: '#EC4899', method: 'alipay' },
    { id: 'r3', name: 'Chen Hao', alipay: '186****9810', initials: 'CH', color: '#10B981', method: 'wechat' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <XferTopBar dark={dark} title={s.sendTo} onBack={onBack}/>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Payment method selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...Ttype.bodySmSemi, color: fg }}>{s.paymentMethod}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'alipay', label: 'Alipay', color: '#1677FF' },
                { id: 'wechat', label: 'WeChat', color: '#07C160' },
              ].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{
                  flex: 1, height: 48, borderRadius: 12, cursor: 'pointer',
                  background: method === m.id ? (dark ? `${m.color}18` : `${m.color}12`) : 'transparent',
                  border: `1.5px solid ${method === m.id ? m.color : border}`,
                  color: method === m.id ? m.color : fg,
                  ...Ttype.bodySmSemi, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 120ms',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: method === m.id ? m.color : (dark ? 'rgba(255,255,255,0.2)' : TT.slate300),
                  }}/>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          {/* Name field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...Ttype.bodySmSemi, color: fg }}>{s.newName}</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder={s.newNamePlaceholder}
              style={{
                height: 52, borderRadius: 14, border: `1px solid ${name ? TT.brand500 : border}`,
                background: fieldBg, padding: '0 16px', color: fg, ...Ttype.body, fontSize: 16,
                outline: 'none', transition: 'border-color 120ms',
              }}
            />
          </div>
          {/* Account ID field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...Ttype.bodySmSemi, color: fg }}>{s.newAlipay}</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, height: 52, borderRadius: 14,
              border: `1px solid ${accountId ? TT.brand500 : border}`, background: fieldBg, padding: '0 16px',
              transition: 'border-color 120ms',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: method === 'alipay' ? '#1677FF' : '#07C160',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...Ttype.label, fontSize: 9, color: '#fff', letterSpacing: 0, flexShrink: 0,
              }}>{method === 'alipay' ? 'A' : 'W'}</div>
              <input
                value={accountId} onChange={(e) => setAccountId(e.target.value)}
                placeholder={s.newAlipayPlaceholder}
                inputMode="tel"
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  color: fg, ...Ttype.monoBody, fontSize: 16, letterSpacing: '0.01em',
                }}
              />
            </div>
          </div>
        </div>

        {/* Saved / recent recipients */}
        <div style={{ padding: '24px 20px 8px' }}>
          <div style={{ ...Ttype.bodySmSemi, color: fg, marginBottom: 12 }}>{s.recentRecipients}</div>
          {SAVED.map((r, i) => (
            <button key={r.id} onClick={() => onDone(r)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
              background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
              borderBottom: i < SAVED.length - 1 ? `1px solid ${divider}` : 'none',
            }}>
              <Avatar initials={r.initials} color={r.color} size={44}/>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ ...Ttype.bodyMed, color: fg }}>{r.name}</div>
                <div style={{ ...Ttype.bodySm, color: muted, fontSize: 12 }}>
                  {r.method === 'wechat' ? 'WeChat' : 'Alipay'} · {r.alipay}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      </div>
      {/* Continue button — always visible */}
      <div style={{ padding: '12px 20px 24px', flexShrink: 0 }}>
        <PrimaryBtn dark={dark} disabled={!valid} onClick={() => {
          const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
          const color = COLORS[name.length % COLORS.length];
          const masked = accountId.length > 4 ? accountId.slice(0, 3) + '****' + accountId.slice(-4) : accountId;
          onDone({ id: 'new-' + Date.now(), name: name.trim(), alipay: masked, initials, color, method });
        }}>{s.newSave}</PrimaryBtn>
      </div>
    </div>
  );
}

Object.assign(window, {
  RecipientSelectScreen, AddRecipientScreen, AmountEntryScreen, ReviewScreen, ProcessingScreen, SuccessScreen,
  XFER_STRINGS, XferTopBar,
});
