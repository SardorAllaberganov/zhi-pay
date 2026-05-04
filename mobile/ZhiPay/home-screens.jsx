// ZhiPay — Home variants + tab bar
// Safe (CTA hero) + Bold (inline amount + recipient-first)

const { T: HT, type: Htype } = window;

// ─── Strings ────────────────────────────────────────────────
const HOME_STRINGS = {
  uz: {
    greeting: (n) => `Salom, ${n}`,
    sendCta: 'Pul yuborish',
    sendSub: 'Xitoyga · Alipay',
    rateLabel: 'Bugungi kurs',
    sendQuick: 'Tezkor yuborish',
    savedRecipients: 'Saqlangan oluvchilar',
    addRecipient: 'Qo‘shish',
    recentActivity: 'Oxirgi to‘lovlar',
    myCards: 'Kartalarim',
    addCard: 'Karta qo‘shish',
    defaultCard: 'Asosiy',
    profileTitle: 'Profil',
    cardsManage: 'Kartalarni boshqarish',
    setDefault: 'Asosiy qilish',
    seeAll: 'Hammasi',
    kycTitle: 'Hisobni tasdiqlang',
    kycBody: 'Birinchi to‘lov uchun pasportingizni yuklang.',
    kycCta: 'Tasdiqlash',
    limitLabel: 'Oylik limit',
    of: 'dan',
    emptyRecipients: 'Hali oluvchi yo‘q',
    emptyRecipientsBody: 'Birinchi pulingizni yuborgach, oluvchilar bu yerda saqlanadi.',
    emptyActivity: 'To‘lovlar tarixi bo‘sh',
    youSendLabel: 'Siz yuborasiz',
    theyGetLabel: 'Ular oladi',
    home: 'Asosiy', transfer: 'O‘tkazma', history: 'Tarix', profile: 'Profil',
    statusDone: 'Bajarildi', statusPending: 'Kutilmoqda', statusFailed: 'Bekor qilindi',
  },
  ru: {
    greeting: (n) => `Здравствуйте, ${n}`,
    sendCta: 'Отправить деньги',
    sendSub: 'В Китай · Alipay',
    rateLabel: 'Курс сегодня',
    sendQuick: 'Быстрая отправка',
    savedRecipients: 'Сохранённые получатели',
    addRecipient: 'Добавить',
    recentActivity: 'Последние переводы',
    myCards: 'Мои карты',
    addCard: 'Добавить карту',
    defaultCard: 'Основная',
    profileTitle: 'Профиль',
    cardsManage: 'Управление картами',
    setDefault: 'Сделать основной',
    seeAll: 'Все',
    kycTitle: 'Подтвердите аккаунт',
    kycBody: 'Загрузите паспорт, чтобы отправить первый перевод.',
    kycCta: 'Подтвердить',
    limitLabel: 'Лимит на месяц',
    of: 'из',
    emptyRecipients: 'Получателей пока нет',
    emptyRecipientsBody: 'После первого перевода получатели появятся здесь.',
    emptyActivity: 'Тут пока пусто',
    youSendLabel: 'Вы отправляете',
    theyGetLabel: 'Получатель получит',
    home: 'Главная', transfer: 'Перевод', history: 'История', profile: 'Профиль',
    statusDone: 'Выполнено', statusPending: 'В обработке', statusFailed: 'Отменено',
  },
  en: {
    greeting: (n) => `Hi, ${n}`,
    sendCta: 'Send money',
    sendSub: 'To China · Alipay',
    rateLabel: "Today's rate",
    sendQuick: 'Quick send',
    savedRecipients: 'Saved recipients',
    addRecipient: 'Add',
    recentActivity: 'Recent transfers',
    myCards: 'My cards',
    addCard: 'Add card',
    defaultCard: 'Default',
    profileTitle: 'Profile',
    cardsManage: 'Manage cards',
    setDefault: 'Set as default',
    seeAll: 'See all',
    kycTitle: 'Verify your account',
    kycBody: 'Upload your passport to send your first transfer.',
    kycCta: 'Verify',
    limitLabel: 'Monthly limit',
    of: 'of',
    emptyRecipients: 'No recipients yet',
    emptyRecipientsBody: 'Recipients will be saved here after your first transfer.',
    emptyActivity: 'No transfers yet',
    youSendLabel: 'You send',
    theyGetLabel: 'They get',
    home: 'Home', transfer: 'Transfer', history: 'History', profile: 'Profile',
    statusDone: 'Completed', statusPending: 'Pending', statusFailed: 'Failed',
  },
};

// ─── Mock data ──────────────────────────────────────────────
const MOCK_RECIPIENTS = [
  { id: 'r1', name: 'Wang Lei', alipay: '138****6721', initials: 'WL', color: '#3B82F6' },
  { id: 'r2', name: 'Liu Mei', alipay: '139****4422', initials: 'LM', color: '#EC4899' },
  { id: 'r3', name: 'Chen Hao', alipay: '186****9810', initials: 'CH', color: '#10B981' },
  { id: 'r4', name: 'Zhang Wei', alipay: '152****1199', initials: 'ZW', color: '#F59E0B' },
];
const MOCK_ACTIVITY = [
  { id: 't1', name: 'Wang Lei',  cny: 3600, uzs: 5055000, when: '2 soat oldin / 2 ч назад / 2h ago', status: 'done' },
  { id: 't2', name: 'Liu Mei',   cny: 1200, uzs: 1685000, when: 'Kecha / Вчера / Yesterday',         status: 'done' },
  { id: 't3', name: 'Chen Hao',  cny: 800,  uzs: 1124000, when: '3 kun / 3 дн / 3d',                  status: 'pending' },
];

function fmtMoney(n, ccy, locale) {
  const groupSep = locale === 'en' ? ',' : '\u202F';
  const decSep = locale === 'en' ? '.' : ',';
  const fixed = (n).toFixed(ccy === 'CNY' ? 2 : 0);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
  return dec ? `${grouped}${decSep}${dec}\u00A0${ccy}` : `${grouped}\u00A0${ccy}`;
}

// ─── Avatar ─────────────────────────────────────────────────
function Avatar({ initials, color, size = 48 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...Htype.bodySemi, fontSize: size * 0.36, letterSpacing: '-0.02em',
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── Rate ticker chip ───────────────────────────────────────
function RateChip({ dark, locale, prominent = false }) {
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.6)' : HT.slate500;
  const groupSep = locale === 'en' ? ',' : '\u202F';
  const decSep = locale === 'en' ? '.' : ',';
  const rate = `1\u00A0CNY = 1${groupSep}404${decSep}17\u00A0UZS`;
  if (prominent) {
    return (
      <div style={{
        background: dark ? 'rgba(22,119,255,0.12)' : HT.brand50,
        border: `1px solid ${dark ? 'rgba(22,119,255,0.32)' : HT.brand100}`,
        borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ ...Htype.label, fontSize: 10, color: muted }}>{HOME_STRINGS[locale].rateLabel}</div>
          <div style={{ ...Htype.monoBodySm, color: fg, fontWeight: 600, whiteSpace: 'nowrap' }}>{rate}</div>
        </div>
        <div style={{
          ...Htype.label, fontSize: 10, color: HT.success900, background: HT.success50,
          padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          0.4%
        </div>
      </div>
    );
  }
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px',
      borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : HT.slate100,
      ...Htype.monoBodySm, fontSize: 12, color: fg, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: HT.success500 }}/>
      {rate}
    </div>
  );
}

// ─── KYC banner ─────────────────────────────────────────────
function KycBanner({ dark, locale, onCta }) {
  const s = HOME_STRINGS[locale];
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.7)' : HT.slate500;
  return (
    <div style={{
      background: dark ? 'rgba(220,138,5,0.14)' : HT.warning50,
      border: `1px solid ${dark ? 'rgba(220,138,5,0.32)' : '#FCE7B0'}`,
      borderRadius: 14, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: HT.warning500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ ...Htype.bodySmSemi, color: fg }}>{s.kycTitle}</div>
        <div style={{ ...Htype.bodySm, color: muted, lineHeight: '18px' }}>{s.kycBody}</div>
      </div>
      <button onClick={onCta} style={{
        background: HT.warning900, color: '#fff', border: 'none', cursor: 'pointer',
        height: 32, padding: '0 12px', borderRadius: 8, ...Htype.bodySmSemi, fontSize: 13,
      }}>{s.kycCta}</button>
    </div>
  );
}

// ─── Activity row ───────────────────────────────────────────
function ActivityRow({ tx, dark, locale, last }) {
  const s = HOME_STRINGS[locale];
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : HT.slate500;
  const divider = dark ? 'rgba(255,255,255,0.06)' : HT.slate100;
  const statusColor = tx.status === 'done' ? HT.success900 : tx.status === 'pending' ? HT.warning900 : HT.danger900;
  const statusLabel = tx.status === 'done' ? s.statusDone : tx.status === 'pending' ? s.statusPending : s.statusFailed;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
      borderBottom: last ? 'none' : `1px solid ${divider}`,
    }}>
      <Avatar initials={tx.name.split(' ').map(p => p[0]).join('')} color={'#3B82F6'} size={40}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...Htype.bodySmSemi, color: fg }}>{tx.name}</div>
        <div style={{ ...Htype.bodySm, color: muted, fontSize: 12 }}>{tx.when.split(' / ')[locale === 'uz' ? 0 : locale === 'ru' ? 1 : 2]}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <div style={{ ...Htype.monoBodySm, color: fg, fontWeight: 600, whiteSpace: 'nowrap' }}>−{fmtMoney(tx.uzs, 'UZS', locale)}</div>
        <div style={{ ...Htype.label, fontSize: 9, color: statusColor }}>{statusLabel}</div>
      </div>
    </div>
  );
}

// ─── Recipient pill (carousel item) ─────────────────────────
function RecipientPill({ r, dark, onClick, big }) {
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : HT.slate500;
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: 4, background: 'transparent', border: 'none', cursor: 'pointer',
      flexShrink: 0, width: big ? 88 : 72,
    }}>
      <Avatar initials={r.initials} color={r.color} size={big ? 60 : 52}/>
      <div style={{ ...Htype.bodySm, fontSize: 12, color: fg, fontWeight: 500, textAlign: 'center', lineHeight: '14px' }}>{r.name.split(' ')[0]}</div>
    </button>
  );
}

function AddRecipientPill({ dark, label }) {
  const fg = dark ? '#fff' : HT.slate900;
  const ring = dark ? 'rgba(255,255,255,0.14)' : HT.slate200;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      flexShrink: 0, width: 72, cursor: 'pointer',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        border: `1.5px dashed ${ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: fg,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <div style={{ ...Htype.bodySm, fontSize: 12, color: fg, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ─── Home: SAFE variant ─────────────────────────────────────
function HomeSafe({ dark, locale, hasRecipients, hasActivity, kycTier, onSend }) {
  const s = HOME_STRINGS[locale];
  const bg = dark ? HT.slate50 : '#fff';
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : HT.slate500;
  const sectionBg = dark ? 'rgba(255,255,255,0.04)' : HT.slate50;
  return (
    <div style={{ width: '100%', height: '100%', background: bg, overflowY: 'auto', paddingBottom: 96 }}>
      {/* greeting */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ ...Htype.bodySm, color: muted }}>{s.greeting('Aziz')}</div>
          <div style={{ ...Htype.heading, color: fg, marginTop: 2 }}>ZhiPay</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: dark ? 'rgba(255,255,255,0.08)' : HT.slate100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
          </svg>
        </div>
      </div>

      {/* Send hero card */}
      <div style={{ padding: '0 20px' }}>
        <div onClick={onSend} style={{
          background: `linear-gradient(135deg, ${HT.brand500} 0%, ${HT.brand700} 100%)`,
          borderRadius: 20, padding: '20px 20px 22px',
          color: '#fff', display: 'flex', flexDirection: 'column', gap: 16,
          boxShadow: '0 14px 32px rgba(12,86,155,0.32)', cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -32, top: -32, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ position: 'absolute', right: 32, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ ...Htype.label, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{s.sendSub}</div>
              <div style={{ ...Htype.heading, color: '#fff' }}>{s.sendCta}</div>
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...Htype.label, fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>{s.rateLabel}</div>
                <div style={{ ...Htype.monoBodySm, color: '#fff', fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap' }}>1 CNY = 1{locale==='en'?',':'\u202F'}404{locale==='en'?'.':','}17 UZS</div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={HT.brand700} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC banner */}
      {kycTier === 'none' && (
        <div style={{ padding: '16px 20px 0' }}>
          <KycBanner dark={dark} locale={locale}/>
        </div>
      )}

      {/* Saved recipients */}
      <div style={{ padding: '24px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
          <div style={{ ...Htype.bodySemi, color: fg }}>{s.savedRecipients}</div>
          <span style={{ ...Htype.bodySmSemi, color: HT.brand600, fontSize: 13 }}>{s.seeAll}</span>
        </div>
        {hasRecipients ? (
          <div style={{ display: 'flex', gap: 16, padding: '0 20px', overflowX: 'auto' }}>
            <AddRecipientPill dark={dark} label={s.addRecipient}/>
            {MOCK_RECIPIENTS.map(r => <RecipientPill key={r.id} r={r} dark={dark}/>)}
          </div>
        ) : (
          <div style={{ padding: '16px 20px' }}>
            <EmptyState dark={dark} title={s.emptyRecipients} body={s.emptyRecipientsBody} icon="users"/>
          </div>
        )}
      </div>

      {/* My cards */}
      <CardsSection dark={dark} locale={locale}/>

      {/* Recent activity */}
      <div style={{ padding: '24px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 4px' }}>
          <div style={{ ...Htype.bodySemi, color: fg }}>{s.recentActivity}</div>
          {hasActivity && <span style={{ ...Htype.bodySmSemi, color: HT.brand600, fontSize: 13 }}>{s.seeAll}</span>}
        </div>
        {hasActivity ? (
          <div style={{ padding: '0 20px' }}>
            {MOCK_ACTIVITY.map((tx, i) => <ActivityRow key={tx.id} tx={tx} dark={dark} locale={locale} last={i === MOCK_ACTIVITY.length - 1}/>)}
          </div>
        ) : (
          <div style={{ padding: '16px 20px' }}>
            <EmptyState dark={dark} title={s.emptyActivity} body="" icon="receipt"/>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Home: BOLD variant ─────────────────────────────────────
function HomeBold({ dark, locale, hasRecipients, hasActivity, kycTier, onSend }) {
  const s = HOME_STRINGS[locale];
  const bg = dark ? HT.slate50 : '#fff';
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : HT.slate500;
  const groupSep = locale === 'en' ? ',' : '\u202F';
  const decSep = locale === 'en' ? '.' : ',';
  const [amountStr, setAmountStr] = React.useState('3 600');
  const amount = parseFloat(amountStr.replace(/\s/g, '')) || 0;
  const uzs = Math.round(amount * 1404.17);
  const maskBold = (raw) => {
    const clean = raw.replace(/[^\d]/g, '');
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  return (
    <div style={{ width: '100%', height: '100%', background: bg, overflowY: 'auto', paddingBottom: 96 }}>
      {/* greeting */}
      <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ ...Htype.bodySm, color: muted }}>{s.greeting('Aziz')}</div>
          <div style={{ ...Htype.heading, color: fg, marginTop: 2 }}>ZhiPay</div>
        </div>
        <RateChip dark={dark} locale={locale}/>
      </div>

      {/* Inline amount entry hero */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          background: dark ? HT.slate100 : '#fff',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : HT.slate200}`,
          borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
          boxShadow: dark ? 'none' : '0 14px 32px rgba(15,23,42,0.06)',
        }}>
          <div>
            <div style={{ ...Htype.label, fontSize: 10, color: muted, marginBottom: 6 }}>{s.youSendLabel}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <input
                value={amountStr}
                onChange={(e) => setAmountStr(maskBold(e.target.value))}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  ...Htype.monoBody, fontSize: 36, fontWeight: 700, color: fg, padding: 0,
                  letterSpacing: '-0.02em',
                }}
              />
              <span style={{ ...Htype.heading, color: muted }}>CNY</span>
            </div>
          </div>
          <div style={{ height: 1, background: dark ? 'rgba(255,255,255,0.08)' : HT.slate100 }}/>
          <div>
            <div style={{ ...Htype.label, fontSize: 10, color: muted, marginBottom: 6 }}>{s.theyGetLabel}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ ...Htype.monoBody, fontSize: 28, fontWeight: 600, color: HT.brand600, whiteSpace: 'nowrap' }}>
                {uzs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              </span>
              <span style={{ ...Htype.bodyMed, color: muted, flexShrink: 0 }}>UZS</span>
            </div>
          </div>
          <button onClick={onSend} style={{
            height: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: `linear-gradient(180deg, ${HT.brand500}, ${HT.brand700})`, color: '#fff',
            ...Htype.bodySemi, fontSize: 17, marginTop: 4,
            boxShadow: '0 10px 24px rgba(12,86,155,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {s.sendCta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* KYC banner */}
      {kycTier === 'none' && (
        <div style={{ padding: '0 20px 16px' }}>
          <KycBanner dark={dark} locale={locale}/>
        </div>
      )}

      {/* Recipient-first carousel */}
      <div style={{ padding: '0 0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
          <div style={{ ...Htype.bodySemi, color: fg }}>{s.sendQuick}</div>
          <span style={{ ...Htype.bodySmSemi, color: HT.brand600, fontSize: 13 }}>{s.seeAll}</span>
        </div>
        {hasRecipients ? (
          <div style={{ display: 'flex', gap: 12, padding: '0 20px 4px', overflowX: 'auto' }}>
            <AddRecipientPill dark={dark} label={s.addRecipient}/>
            {MOCK_RECIPIENTS.map(r => <RecipientPill key={r.id} r={r} dark={dark} big/>)}
          </div>
        ) : (
          <div style={{ padding: '0 20px' }}>
            <EmptyState dark={dark} title={s.emptyRecipients} body={s.emptyRecipientsBody} icon="users"/>
          </div>
        )}
      </div>

      {/* Recent activity (compact) */}
      <div style={{ padding: '20px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 4px' }}>
          <div style={{ ...Htype.bodySemi, color: fg }}>{s.recentActivity}</div>
          {hasActivity && <span style={{ ...Htype.bodySmSemi, color: HT.brand600, fontSize: 13 }}>{s.seeAll}</span>}
        </div>
        {hasActivity ? (
          <div style={{ padding: '0 20px' }}>
            {MOCK_ACTIVITY.slice(0, 2).map((tx, i, arr) => <ActivityRow key={tx.id} tx={tx} dark={dark} locale={locale} last={i === arr.length - 1}/>)}
          </div>
        ) : (
          <div style={{ padding: '16px 20px' }}>
            <EmptyState dark={dark} title={s.emptyActivity} body="" icon="receipt"/>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────
function EmptyState({ dark, title, body, icon }) {
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.5)' : HT.slate500;
  return (
    <div style={{
      padding: 20, borderRadius: 14,
      background: dark ? 'rgba(255,255,255,0.04)' : HT.slate50,
      border: `1px dashed ${dark ? 'rgba(255,255,255,0.1)' : HT.slate200}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: dark ? 'rgba(255,255,255,0.06)' : HT.slate100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted, marginBottom: 4,
      }}>
        {icon === 'users' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v17l-3-2-3 2-3-2-3 2-4-2z"/><path d="M8 9h8M8 13h8M8 17h5"/>
          </svg>
        )}
      </div>
      <div style={{ ...Htype.bodySmSemi, color: fg }}>{title}</div>
      {body && <div style={{ ...Htype.bodySm, color: muted, fontSize: 13, maxWidth: 240, lineHeight: '18px' }}>{body}</div>}
    </div>
  );
}

// ─── Tab bar ────────────────────────────────────────────────
function TabBar({ dark, locale, active, setActive }) {
  const s = HOME_STRINGS[locale];
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.5)' : HT.slate500;
  const bg = dark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)';
  const border = dark ? 'rgba(255,255,255,0.08)' : HT.slate200;
  const tabs = [
    { id: 'home',     label: s.home,     icon: 'home' },
    { id: 'transfer', label: s.transfer, icon: 'send' },
    { id: 'history',  label: s.history,  icon: 'list' },
    { id: 'profile',  label: s.profile,  icon: 'user' },
  ];
  const Icon = ({ name, color }) => {
    const props = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (name === 'home') return <svg {...props}><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>;
    if (name === 'send') return <svg {...props}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    if (name === 'list') return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>;
    return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 16 0v1"/></svg>;
  };
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 24,
      background: bg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: `0.5px solid ${border}`,
      display: 'flex', justifyContent: 'space-around', padding: '8px 8px 24px',
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{
          flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0',
        }}>
          <Icon name={t.icon} color={active === t.id ? HT.brand600 : muted}/>
          <span style={{ ...Htype.label, fontSize: 10, letterSpacing: '0.02em', textTransform: 'none', color: active === t.id ? HT.brand600 : muted, fontWeight: active === t.id ? 600 : 500 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Card data ──────────────────────────────────────────────
const MOCK_CARDS = [
  { id: 'c1', type: 'uzcard', last4: '4578', name: 'Uzcard', color: '#1A6DD4', isDefault: true },
  { id: 'c2', type: 'humo', last4: '8821', name: 'Humo', color: '#00A651', isDefault: false },
];

// ─── Compact card pill (for Home) ───────────────────────────
function CardPill({ card, dark }) {
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : HT.slate500;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      borderRadius: 14, flexShrink: 0, minWidth: 180,
      background: dark ? 'rgba(255,255,255,0.04)' : HT.slate50,
      border: `1px solid ${card.isDefault ? (dark ? 'rgba(22,119,255,0.3)' : HT.brand100) : (dark ? 'rgba(255,255,255,0.06)' : HT.slate100)}`,
    }}>
      <div style={{
        width: 36, height: 24, borderRadius: 6, background: card.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...Htype.label, fontSize: 8, color: '#fff', letterSpacing: 0,
      }}>{card.type === 'uzcard' ? 'UC' : 'HM'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ ...Htype.bodySmSemi, color: fg, fontSize: 13 }}>{card.name}</div>
        <div style={{ ...Htype.monoBodySm, color: muted, fontSize: 11 }}>•••• {card.last4}</div>
      </div>
      {card.isDefault && (
        <div style={{
          ...Htype.label, fontSize: 8, color: HT.brand600,
          background: dark ? 'rgba(22,119,255,0.12)' : HT.brand50,
          padding: '2px 6px', borderRadius: 4,
        }}>✓</div>
      )}
    </div>
  );
}

function AddCardPill({ dark, label }) {
  const fg = dark ? '#fff' : HT.slate900;
  const ring = dark ? 'rgba(255,255,255,0.14)' : HT.slate200;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      borderRadius: 14, flexShrink: 0, cursor: 'pointer', minWidth: 140,
      border: `1.5px dashed ${ring}`,
    }}>
      <div style={{
        width: 36, height: 24, borderRadius: 6,
        border: `1px dashed ${ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: fg,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <div style={{ ...Htype.bodySmSemi, color: HT.brand600, fontSize: 13 }}>{label}</div>
    </div>
  );
}

// ─── Cards section (compact, for Home) ──────────────────────
function CardsSection({ dark, locale }) {
  const s = HOME_STRINGS[locale];
  const fg = dark ? '#fff' : HT.slate900;
  return (
    <div style={{ padding: '24px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
        <div style={{ ...Htype.bodySemi, color: fg }}>{s.myCards}</div>
        <span style={{ ...Htype.bodySmSemi, color: HT.brand600, fontSize: 13 }}>{s.seeAll}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '0 20px', overflowX: 'auto' }}>
        {MOCK_CARDS.map(c => <CardPill key={c.id} card={c} dark={dark}/>)}
        <AddCardPill dark={dark} label={s.addCard}/>
      </div>
    </div>
  );
}

// ─── Profile tab with modules ───────────────────────────────
function ProfileTab({ dark, locale, onNavigate }) {
  const s = HOME_STRINGS[locale];
  const bg = dark ? HT.slate50 : '#fff';
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : HT.slate500;
  const border = dark ? 'rgba(255,255,255,0.06)' : HT.slate100;
  const rowBg = dark ? 'rgba(255,255,255,0.04)' : HT.slate50;

  const PROFILE_STRINGS = {
    uz: {
      personalInfo: 'Shaxsiy ma\u2018lumotlar',
      myCards: 'Kartalarim',
      security: 'Xavfsizlik',
      notifications: 'Bildirishnomalar',
      language: 'Til',
      helpCenter: 'Yordam markazi',
      about: 'Ilova haqida',
      logout: 'Chiqish',
      kycStatus: 'Hisob holati',
      verified: 'Tasdiqlangan',
      unverified: 'Tasdiqlanmagan',
      version: 'Versiya',
    },
    ru: {
      personalInfo: 'Личные данные',
      myCards: 'Мои карты',
      security: 'Безопасность',
      notifications: 'Уведомления',
      language: 'Язык',
      helpCenter: 'Центр помощи',
      about: 'О приложении',
      logout: 'Выйти',
      kycStatus: 'Статус аккаунта',
      verified: 'Подтверждён',
      unverified: 'Не подтверждён',
      version: 'Версия',
    },
    en: {
      personalInfo: 'Personal info',
      myCards: 'My cards',
      security: 'Security',
      notifications: 'Notifications',
      language: 'Language',
      helpCenter: 'Help center',
      about: 'About',
      logout: 'Log out',
      kycStatus: 'Account status',
      verified: 'Verified',
      unverified: 'Unverified',
      version: 'Version',
    },
  };
  const ps = PROFILE_STRINGS[locale];
  const langLabels = { uz: "O\u2018zbek", ru: 'Русский', en: 'English' };

  const ProfileRow = ({ icon, label, value, onClick, danger }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: danger ? HT.danger50 : (dark ? 'rgba(255,255,255,0.06)' : HT.slate100),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? HT.danger500 : muted,
      }}>{icon}</div>
      <div style={{ flex: 1, textAlign: 'left', ...Htype.bodyMed, color: danger ? HT.danger500 : fg }}>{label}</div>
      {value && <span style={{ ...Htype.bodySm, color: muted, fontSize: 13 }}>{value}</span>}
      {!danger && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      )}
    </button>
  );

  const Icon = ({ d }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );

  return (
    <div style={{ width: '100%', height: '100%', background: bg, overflowY: 'auto', paddingBottom: 96 }}>
      {/* Profile header */}
      <div style={{ padding: '16px 20px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: `linear-gradient(160deg, ${HT.brand500}, ${HT.brand700})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...Htype.bodySemi, fontSize: 24, color: '#fff',
          boxShadow: '0 8px 20px rgba(12,86,155,0.24)',
        }}>A</div>
        <div style={{ flex: 1 }}>
          <div style={{ ...Htype.heading, color: fg }}>Aziz Karimov</div>
          <div style={{ ...Htype.bodySm, color: muted }}>+998 90 123 45 67</div>
        </div>
        <div style={{
          ...Htype.label, fontSize: 9, padding: '4px 10px', borderRadius: 6,
          background: HT.success50, color: HT.success900,
        }}>{ps.verified}</div>
      </div>

      {/* Account section */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', background: rowBg, border: `1px solid ${border}` }}>
          <ProfileRow
            icon={<Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8"/>}
            label={ps.personalInfo}
          />
          <div style={{ height: 1, background: border, margin: '0 16px' }}/>
          <ProfileRow
            icon={<Icon d="M2 7h20v13H2zM2 7l10 7 10-7"/>}
            label={ps.myCards}
            value={`${MOCK_CARDS.length}`}
            onClick={() => onNavigate && onNavigate('cards')}
          />
          <div style={{ height: 1, background: border, margin: '0 16px' }}/>
          <ProfileRow
            icon={<Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
            label={ps.security}
          />
        </div>
      </div>

      {/* Preferences section */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', background: rowBg, border: `1px solid ${border}` }}>
          <ProfileRow
            icon={<Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/>}
            label={ps.notifications}
          />
          <div style={{ height: 1, background: border, margin: '0 16px' }}/>
          <ProfileRow
            icon={<Icon d="M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20"/>}
            label={ps.language}
            value={langLabels[locale]}
          />
        </div>
      </div>

      {/* Support section */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', background: rowBg, border: `1px solid ${border}` }}>
          <ProfileRow
            icon={<Icon d="M12 2a10 10 0 100 20 10 10 0 000-20zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>}
            label={ps.helpCenter}
          />
          <div style={{ height: 1, background: border, margin: '0 16px' }}/>
          <ProfileRow
            icon={<Icon d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 16v-4M12 8h.01"/>}
            label={ps.about}
            value="v1.0.0"
          />
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', background: rowBg, border: `1px solid ${border}` }}>
          <ProfileRow
            icon={<Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>}
            label={ps.logout}
            danger
          />
        </div>
      </div>
    </div>
  );
}

// ─── Cards management screen (separate page) ────────────────
function CardsScreen({ dark, locale, onBack }) {
  const s = HOME_STRINGS[locale];
  const bg = dark ? HT.slate50 : '#fff';
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.55)' : HT.slate500;
  const border = dark ? 'rgba(255,255,255,0.06)' : HT.slate100;
  const [cards, setCards] = React.useState(MOCK_CARDS);

  const setDefault = (id) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
  };
  const deleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 12px' }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(255,255,255,0.08)' : HT.slate100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ flex: 1, ...Htype.bodySemi, color: fg, textAlign: 'center' }}>{s.cardsManage}</div>
        <div style={{ width: 36 }}/>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map(c => (
            <div key={c.id} style={{
              borderRadius: 16, padding: 16,
              background: dark ? 'rgba(255,255,255,0.04)' : HT.slate50,
              border: `1px solid ${c.isDefault ? (dark ? 'rgba(22,119,255,0.3)' : HT.brand100) : border}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 48, height: 32, borderRadius: 8, background: c.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...Htype.label, fontSize: 10, color: '#fff', letterSpacing: 0,
              }}>{c.type === 'uzcard' ? 'UC' : 'HM'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ ...Htype.bodyMed, color: fg }}>{c.name}</span>
                  {c.isDefault && (
                    <span style={{
                      ...Htype.label, fontSize: 8, color: HT.brand600,
                      background: dark ? 'rgba(22,119,255,0.12)' : HT.brand50,
                      padding: '2px 8px', borderRadius: 4,
                    }}>{s.defaultCard}</span>
                  )}
                </div>
                <div style={{ ...Htype.monoBodySm, color: muted, fontSize: 13 }}>•••• {c.last4}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {!c.isDefault && (
                  <button onClick={() => setDefault(c.id)} title={s.setDefault} style={{
                    background: 'transparent', border: `1px solid ${border}`, borderRadius: 8,
                    padding: '6px 10px', cursor: 'pointer', color: HT.brand600,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                )}
                <button onClick={() => deleteCard(c.id)} style={{
                  background: 'transparent', border: `1px solid ${border}`, borderRadius: 8,
                  padding: '6px 10px', cursor: 'pointer', color: HT.danger500,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <button style={{
            borderRadius: 16, padding: 16, cursor: 'pointer',
            border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.14)' : HT.slate200}`,
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            ...Htype.bodySmSemi, color: HT.brand600,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {s.addCard}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder tab screens (minimal) ──────────────────────
function PlaceholderTab({ dark, label, icon }) {
  const fg = dark ? '#fff' : HT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.5)' : HT.slate500;
  const bg = dark ? HT.slate50 : '#fff';
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, background: dark ? 'rgba(255,255,255,0.06)' : HT.slate100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted,
      }}>{icon}</div>
      <div style={{ ...Htype.heading, color: fg }}>{label}</div>
      <div style={{ ...Htype.bodySm, color: muted, maxWidth: 240 }}>Out of scope for this exploration — wireframe only.</div>
    </div>
  );
}

Object.assign(window, {
  HomeSafe, HomeBold, TabBar, PlaceholderTab, ProfileTab, CardsScreen, HOME_STRINGS,
  RateChip, KycBanner, ActivityRow, RecipientPill, AddRecipientPill, Avatar, EmptyState, CardsSection,
});
