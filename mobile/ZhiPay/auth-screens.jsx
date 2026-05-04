// ZhiPay — auth flow screens
// Splash · Phone · OTP · PIN · Onboarding · Lock
// All sit inside an iOS-sized 393×852 frame; the harness wraps with IOSDevice.

const { T: AT, type: Atype, radius: Aradius } = window;

// ─── Logo mark ──────────────────────────────────────────────
function ZhiMark({ size = 56, dark = false }) {
  const fg = '#fff';
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: `linear-gradient(160deg, ${AT.brand500} 0%, ${AT.brand700} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 12px 32px rgba(12,86,155,0.32)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%)',
      }}/>
      <span style={{
        fontFamily: 'Inter', fontWeight: 800, color: fg,
        fontSize: size * 0.46, letterSpacing: '-0.04em',
        textShadow: '0 1px 2px rgba(0,0,0,0.12)',
      }}>Z</span>
      <div style={{
        position: 'absolute', right: size * 0.16, bottom: size * 0.18,
        width: size * 0.14, height: size * 0.14, borderRadius: '50%',
        background: '#fff', opacity: 0.92,
      }}/>
    </div>
  );
}

// ─── Locale strings (auth) ──────────────────────────────────
const AUTH_STRINGS = {
  uz: {
    splashTagline: "O‘zbekiston'dan Xitoyga\npul o‘tkazmasi",
    splashChooseLang: 'Tilni tanlang',
    splashContinue: 'Davom etish',
    phoneTitle: 'Telefon raqamingiz',
    phoneSub: 'Tasdiqlash kodini SMS orqali yuboramiz.',
    phoneCta: 'Davom etish',
    phoneTerms: 'Davom etish bilan siz Foydalanish shartlari va Maxfiylik siyosatiga rozilik bildirasiz.',
    otpTitle: 'Kodni kiriting',
    otpSub: (n) => `${n} raqamiga yuborildi`,
    otpResend: 'Kodni qayta yuborish',
    otpResendIn: (s) => `Qayta yuborish ${s} sek`,
    otpError: 'Kod noto‘g‘ri. Qaytadan urinib ko‘ring.',
    pinTitle: 'PIN kod yarating',
    pinSub: 'Ilovaga kirish va to‘lovlarni tasdiqlash uchun.',
    pinConfirmTitle: 'PIN kodni qayta kiriting',
    onbSkip: 'O‘tkazib yuborish',
    onbNext: 'Keyingisi',
    onbStart: 'Boshlash',
    lockTitle: 'PIN kodingizni kiriting',
    lockHi: (n) => `Salom, ${n}`,
    lockFaceId: 'Face ID bilan kirish',
    lockForgot: 'PIN kodni unutdingizmi?',
  },
  ru: {
    splashTagline: 'Денежные переводы\nиз Узбекистана в Китай',
    splashChooseLang: 'Выберите язык',
    splashContinue: 'Продолжить',
    phoneTitle: 'Ваш номер телефона',
    phoneSub: 'Отправим код подтверждения по SMS.',
    phoneCta: 'Продолжить',
    phoneTerms: 'Продолжая, вы соглашаетесь с Условиями использования и Политикой конфиденциальности.',
    otpTitle: 'Введите код',
    otpSub: (n) => `Отправлен на ${n}`,
    otpResend: 'Отправить код повторно',
    otpResendIn: (s) => `Повторно через ${s} сек`,
    otpError: 'Неверный код. Попробуйте ещё раз.',
    pinTitle: 'Создайте PIN-код',
    pinSub: 'Для входа и подтверждения переводов.',
    pinConfirmTitle: 'Повторите PIN-код',
    onbSkip: 'Пропустить',
    onbNext: 'Далее',
    onbStart: 'Начать',
    lockTitle: 'Введите PIN-код',
    lockHi: (n) => `Здравствуйте, ${n}`,
    lockFaceId: 'Войти с Face ID',
    lockForgot: 'Забыли PIN-код?',
  },
  en: {
    splashTagline: 'Send money\nfrom Uzbekistan to China',
    splashChooseLang: 'Choose your language',
    splashContinue: 'Continue',
    phoneTitle: 'Your phone number',
    phoneSub: "We'll send a verification code by SMS.",
    phoneCta: 'Continue',
    phoneTerms: 'By continuing you agree to the Terms of Service and Privacy Policy.',
    otpTitle: 'Enter the code',
    otpSub: (n) => `Sent to ${n}`,
    otpResend: 'Resend code',
    otpResendIn: (s) => `Resend in ${s}s`,
    otpError: 'Code is incorrect. Try again.',
    pinTitle: 'Create a PIN',
    pinSub: 'Used to sign in and confirm transfers.',
    pinConfirmTitle: 'Re-enter your PIN',
    onbSkip: 'Skip',
    onbNext: 'Next',
    onbStart: 'Get started',
    lockTitle: 'Enter your PIN',
    lockHi: (n) => `Hi, ${n}`,
    lockFaceId: 'Sign in with Face ID',
    lockForgot: 'Forgot PIN?',
  },
};

// ─── Primary button ─────────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled, dark, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', height: 52, borderRadius: 14, border: 'none', cursor: disabled ? 'default' : 'pointer',
      background: disabled
        ? (dark ? 'rgba(255,255,255,0.12)' : AT.slate200)
        : `linear-gradient(180deg, ${AT.brand500} 0%, ${AT.brand600} 100%)`,
      color: disabled ? (dark ? 'rgba(255,255,255,0.4)' : AT.slate400) : '#fff',
      ...Atype.bodySemi, fontSize: 17,
      boxShadow: disabled ? 'none' : '0 8px 20px rgba(10,100,188,0.28)',
      transition: 'all 120ms', ...style,
    }}>{children}</button>
  );
}

function GhostBtn({ children, onClick, dark, style = {} }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', height: 52, borderRadius: 14, cursor: 'pointer',
      background: 'transparent',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : AT.slate200}`,
      color: dark ? '#fff' : AT.slate900,
      ...Atype.bodySemi, fontSize: 17, ...style,
    }}>{children}</button>
  );
}

// ─── Splash + Language ──────────────────────────────────────
function SplashScreen({ dark, locale, setLocale, onContinue }) {
  const s = AUTH_STRINGS[locale];
  const bg = dark ? AT.slate50 : '#fff';
  const fg = dark ? '#fff' : AT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.6)' : AT.slate500;
  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      display: 'flex', flexDirection: 'column', padding: '0 24px 40px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient gradient */}
      <div style={{
        position: 'absolute', top: -120, left: -80, width: 380, height: 380,
        borderRadius: '50%', background: `radial-gradient(circle, ${AT.brand500} 0%, transparent 70%)`,
        opacity: dark ? 0.32 : 0.16, filter: 'blur(40px)', pointerEvents: 'none',
      }}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 20, zIndex: 1 }}>
        <ZhiMark size={64}/>
        <div>
          <div style={{ ...Atype.display2, color: fg, marginBottom: 4 }}>ZhiPay</div>
          <div style={{ ...Atype.body, color: muted, whiteSpace: 'pre-line', maxWidth: 280 }}>{s.splashTagline}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, zIndex: 1 }}>
        <div style={{ ...Atype.label, color: muted, fontSize: 11 }}>{s.splashChooseLang}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { code: 'uz', label: 'O‘zbek' },
            { code: 'ru', label: 'Русский' },
            { code: 'en', label: 'English' },
          ].map(({ code, label }) => (
            <button key={code} onClick={() => setLocale(code)} style={{
              flex: 1, height: 44, borderRadius: 12, cursor: 'pointer',
              background: locale === code ? (dark ? 'rgba(22,119,255,0.18)' : AT.brand50) : 'transparent',
              border: `1px solid ${locale === code ? AT.brand500 : (dark ? 'rgba(255,255,255,0.14)' : AT.slate200)}`,
              color: locale === code ? AT.brand600 : fg,
              ...Atype.bodySmSemi, fontSize: 14,
            }}>{label}</button>
          ))}
        </div>
        <PrimaryBtn dark={dark} onClick={onContinue} style={{ marginTop: 8 }}>{s.splashContinue}</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── Phone entry ────────────────────────────────────────────
function PhoneScreen({ dark, locale, phone, setPhone, onContinue, onBack }) {
  const s = AUTH_STRINGS[locale];
  const bg = dark ? AT.slate50 : '#fff';
  const fg = dark ? '#fff' : AT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.6)' : AT.slate500;
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : AT.slate50;
  const border = dark ? 'rgba(255,255,255,0.12)' : AT.slate200;
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <AuthTopBar dark={dark} onBack={onBack} step={1} total={4}/>
      <div style={{ padding: '8px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ ...Atype.display2, color: fg, fontSize: 28, lineHeight: '34px', marginBottom: 8 }}>{s.phoneTitle}</div>
          <div style={{ ...Atype.body, color: muted }}>{s.phoneSub}</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 60, borderRadius: 14, background: fieldBg, border: `1px solid ${border}`,
          padding: '0 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 10, borderRight: `1px solid ${border}`, height: 28 }}>
            <span style={{ fontSize: 22 }}>🇺🇿</span>
            <span style={{ ...Atype.bodyMed, color: fg }}>+998</span>
          </div>
          <input
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="90 123 45 67"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              color: fg, ...Atype.monoBody, fontSize: 20, letterSpacing: '0.01em',
            }}
          />
        </div>
        <div style={{ ...Atype.bodySm, color: muted, lineHeight: '20px' }}>
          {s.phoneTerms.split(/(Foydalanish shartlari|Maxfiylik siyosatiga|Условиями использования|Политикой конфиденциальности|Terms of Service|Privacy Policy)/).map((part, i) =>
            /Foydalanish|Maxfiylik|Условиями|Политикой|Terms|Privacy/.test(part)
              ? <span key={i} style={{ color: AT.brand600, textDecoration: 'underline' }}>{part}</span>
              : <span key={i}>{part}</span>
          )}
        </div>
      </div>
      <div style={{ padding: '12px 24px 24px' }}>
        <PrimaryBtn dark={dark} onClick={onContinue} disabled={phone.length < 9}>{s.phoneCta}</PrimaryBtn>
      </div>
    </div>
  );
}

// ─── OTP ────────────────────────────────────────────────────
function OtpScreen({ dark, locale, phone, code, setCode, error, resend, onContinue, onBack }) {
  const s = AUTH_STRINGS[locale];
  const bg = dark ? AT.slate50 : '#fff';
  const fg = dark ? '#fff' : AT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.6)' : AT.slate500;
  const fieldBg = dark ? 'rgba(255,255,255,0.06)' : AT.slate50;
  const border = dark ? 'rgba(255,255,255,0.12)' : AT.slate200;
  const errBorder = AT.danger500;
  const fmtPhone = `+998 ${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 7)} ${phone.slice(7)}`.trimEnd();

  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <AuthTopBar dark={dark} onBack={onBack} step={2} total={4}/>
      <div style={{ padding: '8px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ ...Atype.display2, color: fg, fontSize: 28, lineHeight: '34px', marginBottom: 8 }}>{s.otpTitle}</div>
          <div style={{ ...Atype.body, color: muted }}>{s.otpSub(fmtPhone)}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const v = code[i] || '';
            const focused = code.length === i;
            return (
              <div key={i} style={{
                width: 48, height: 60, borderRadius: 12,
                background: fieldBg,
                border: `1.5px solid ${error ? errBorder : focused ? AT.brand500 : border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...Atype.monoBody, fontSize: 24, fontWeight: 600, color: fg,
              }}>{v || (focused ? <span style={{ width: 1.5, height: 24, background: AT.brand500, animation: 'blink 1s infinite' }}/> : '')}</div>
            );
          })}
        </div>
        {error && (
          <div style={{ ...Atype.bodySm, color: AT.danger500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠</span>{s.otpError}
          </div>
        )}
        <div style={{ ...Atype.bodySm, color: muted }}>
          {resend.seconds > 0
            ? s.otpResendIn(resend.seconds)
            : <span style={{ color: AT.brand600, fontWeight: 600, cursor: 'pointer' }}>{s.otpResend}</span>}
        </div>
      </div>
      {/* Numpad */}
      <div style={{ padding: '12px 24px 24px' }}>
        <Numpad dark={dark} onPress={(d) => {
          if (d === 'del') setCode(code.slice(0, -1));
          else if (code.length < 6) {
            const next = code + d;
            setCode(next);
            if (next.length === 6) setTimeout(() => onContinue(next), 200);
          }
        }}/>
      </div>
    </div>
  );
}

// ─── PIN setup / confirm ────────────────────────────────────
function PinScreen({ dark, locale, pin, setPin, mode = 'create', onContinue, onBack }) {
  const s = AUTH_STRINGS[locale];
  const bg = dark ? AT.slate50 : '#fff';
  const fg = dark ? '#fff' : AT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.6)' : AT.slate500;
  const title = mode === 'confirm' ? s.pinConfirmTitle : s.pinTitle;
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <AuthTopBar dark={dark} onBack={onBack} step={3} total={4}/>
      <div style={{ padding: '8px 24px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', textAlign: 'center' }}>
        <div style={{ alignSelf: 'stretch' }}>
          <div style={{ ...Atype.display2, color: fg, fontSize: 26, lineHeight: '32px', marginBottom: 8 }}>{title}</div>
          <div style={{ ...Atype.body, color: muted }}>{s.pinSub}</div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%',
              background: i < pin.length ? AT.brand600 : 'transparent',
              border: `1.5px solid ${i < pin.length ? AT.brand600 : (dark ? 'rgba(255,255,255,0.24)' : AT.slate300)}`,
              transition: 'all 120ms',
            }}/>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 24px 24px' }}>
        <Numpad dark={dark} onPress={(d) => {
          if (d === 'del') setPin(pin.slice(0, -1));
          else if (pin.length < 4) {
            const next = pin + d;
            setPin(next);
            if (next.length === 4) setTimeout(onContinue, 200);
          }
        }} biometric={false}/>
      </div>
    </div>
  );
}

// ─── Onboarding carousel ────────────────────────────────────
function OnboardingScreen({ dark, locale, slide, setSlide, onDone }) {
  const s = AUTH_STRINGS[locale];
  const bg = dark ? AT.slate50 : '#fff';
  const fg = dark ? '#fff' : AT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.6)' : AT.slate500;
  const slides = ONBOARDING_SLIDES[locale];
  const isLast = slide === slides.length - 1;
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 24px' }}>
        {!isLast && (
          <button onClick={onDone} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: muted, ...Atype.bodySmSemi,
          }}>{s.onbSkip}</button>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center', gap: 28 }}>
        <OnboardingArt slide={slide} dark={dark}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...Atype.display2, color: fg, fontSize: 26, lineHeight: '32px' }}>{slides[slide].title}</div>
          <div style={{ ...Atype.body, color: muted, maxWidth: 320 }}>{slides[slide].body}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 16 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === slide ? 24 : 6, height: 6, borderRadius: 3,
            background: i === slide ? AT.brand600 : (dark ? 'rgba(255,255,255,0.2)' : AT.slate200),
            transition: 'all 200ms',
          }}/>
        ))}
      </div>
      <div style={{ padding: '8px 24px 24px' }}>
        <PrimaryBtn dark={dark} onClick={() => isLast ? onDone() : setSlide(slide + 1)}>
          {isLast ? s.onbStart : s.onbNext}
        </PrimaryBtn>
      </div>
    </div>
  );
}

const ONBOARDING_SLIDES = {
  uz: [
    { title: 'Tezkor o‘tkazmalar', body: 'Xitoydagi Alipay hamyoniga 30 soniyada pul yuboring.' },
    { title: 'Aniq kurs', body: 'Kursni 60 soniyaga blokirovka qilamiz. Hech qanday yashirin to‘lov yo‘q.' },
    { title: 'Xavfsiz va litsenziyalangan', body: 'O‘zbekiston Markaziy banki tomonidan tartibga solinadi.' },
  ],
  ru: [
    { title: 'Быстрые переводы', body: 'Отправляйте деньги на Alipay в Китае за 30 секунд.' },
    { title: 'Точный курс', body: 'Фиксируем курс на 60 секунд. Никаких скрытых комиссий.' },
    { title: 'Безопасно и легально', body: 'Регулируется Центральным банком Узбекистана.' },
  ],
  en: [
    { title: 'Send in seconds', body: 'Money lands in your recipient’s Alipay wallet in 30 seconds.' },
    { title: 'Lock the rate', body: 'We hold the FX rate for 60 seconds. No hidden fees.' },
    { title: 'Secure and licensed', body: 'Regulated by the Central Bank of Uzbekistan.' },
  ],
};

function OnboardingArt({ slide, dark }) {
  const ill = [
    // 0 — bolt
    <svg key="0" width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="74" fill={AT.brand50} opacity={dark ? 0.25 : 1}/>
      <circle cx="90" cy="90" r="50" fill={AT.brand100} opacity={dark ? 0.35 : 1}/>
      <path d="M96 50 L62 96 L88 96 L82 130 L120 80 L94 80 Z" fill={AT.brand600}/>
    </svg>,
    // 1 — lock + chart
    <svg key="1" width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="74" fill={AT.brand50} opacity={dark ? 0.25 : 1}/>
      <rect x="60" y="78" width="60" height="48" rx="8" fill={AT.brand600}/>
      <rect x="78" y="68" width="24" height="22" rx="12" fill="none" stroke={AT.brand700} strokeWidth="4"/>
      <circle cx="90" cy="100" r="5" fill="#fff"/>
      <rect x="88" y="103" width="4" height="12" rx="2" fill="#fff"/>
    </svg>,
    // 2 — shield + check
    <svg key="2" width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="74" fill={AT.brand50} opacity={dark ? 0.25 : 1}/>
      <path d="M90 50 L60 62 L60 92 C60 110 72 124 90 132 C108 124 120 110 120 92 L120 62 Z" fill={AT.brand600}/>
      <path d="M76 92 L86 102 L106 80" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
  ];
  return ill[slide] || ill[0];
}

// ─── Returning-user lock ────────────────────────────────────
function LockScreen({ dark, locale, pin, setPin, displayName, onContinue, useFaceId }) {
  const s = AUTH_STRINGS[locale];
  const bg = dark ? AT.slate50 : '#fff';
  const fg = dark ? '#fff' : AT.slate900;
  const muted = dark ? 'rgba(255,255,255,0.6)' : AT.slate500;
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: `linear-gradient(160deg, ${AT.brand500}, ${AT.brand700})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...Atype.bodySemi, fontSize: 24, color: '#fff',
          boxShadow: '0 12px 32px rgba(12,86,155,0.32)',
        }}>{displayName.slice(0, 1)}</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...Atype.bodyMed, color: muted, marginBottom: 4 }}>{s.lockHi(displayName)}</div>
          <div style={{ ...Atype.heading, color: fg }}>{s.lockTitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: i < pin.length ? AT.brand600 : 'transparent',
              border: `1.5px solid ${i < pin.length ? AT.brand600 : (dark ? 'rgba(255,255,255,0.24)' : AT.slate300)}`,
            }}/>
          ))}
        </div>
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: AT.brand600, ...Atype.bodySmSemi,
        }}>{s.lockForgot}</button>
      </div>
      <div style={{ padding: '12px 24px 24px' }}>
        <Numpad dark={dark} biometric={true} onBio={useFaceId} onPress={(d) => {
          if (d === 'del') setPin(pin.slice(0, -1));
          else if (pin.length < 4) {
            const next = pin + d;
            setPin(next);
            if (next.length === 4) setTimeout(onContinue, 200);
          }
        }}/>
      </div>
    </div>
  );
}

// ─── Numpad ─────────────────────────────────────────────────
function Numpad({ dark, onPress, onSubmit, canSubmit, biometric, onBio }) {
  const fg = dark ? '#fff' : AT.slate900;
  const keyBg = dark ? 'rgba(255,255,255,0.08)' : AT.slate100;
  const keyBgActive = dark ? 'rgba(255,255,255,0.14)' : AT.slate200;
  const Key = ({ d, sub, onClick, children }) => (
    <button onClick={onClick} style={{
      height: 56, borderRadius: 14, border: 'none', cursor: 'pointer',
      background: keyBg,
      color: fg, ...Atype.heading, fontSize: 24, fontWeight: 500,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'background 100ms',
    }}
      onMouseDown={(e) => e.currentTarget.style.background = keyBgActive}
      onMouseUp={(e) => e.currentTarget.style.background = keyBg}
      onMouseLeave={(e) => e.currentTarget.style.background = keyBg}
    >
      {children || (
        <>
          <span>{d}</span>
          {sub && <span style={{ ...Atype.label, fontSize: 9, color: dark ? 'rgba(255,255,255,0.5)' : AT.slate500, marginTop: -2 }}>{sub}</span>}
        </>
      )}
    </button>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      <Key d="1" onClick={() => onPress('1')}/>
      <Key d="2" sub="ABC" onClick={() => onPress('2')}/>
      <Key d="3" sub="DEF" onClick={() => onPress('3')}/>
      <Key d="4" sub="GHI" onClick={() => onPress('4')}/>
      <Key d="5" sub="JKL" onClick={() => onPress('5')}/>
      <Key d="6" sub="MNO" onClick={() => onPress('6')}/>
      <Key d="7" sub="PQRS" onClick={() => onPress('7')}/>
      <Key d="8" sub="TUV" onClick={() => onPress('8')}/>
      <Key d="9" sub="WXYZ" onClick={() => onPress('9')}/>
      {biometric ? (
        <Key onClick={onBio}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12c0-5 4-9 10-9s10 4 10 9"/>
            <path d="M5 16c0-4 3-7 7-7s7 3 7 7"/>
            <path d="M9 18c0-2 1-3 3-3s3 1 3 3"/>
            <circle cx="12" cy="12" r="0.8" fill={fg}/>
          </svg>
        </Key>
      ) : <div/>}
      <Key d="0" onClick={() => onPress('0')}/>
      <Key onClick={() => onPress('del')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 5h-13l-6 7 6 7h13a2 2 0 0 0 2 -2v-10a2 2 0 0 0 -2 -2z"/>
          <path d="M12 9l6 6m0 -6l-6 6"/>
        </svg>
      </Key>
    </div>
  );
}

// ─── Top bar (back + step indicator) ────────────────────────
function AuthTopBar({ dark, onBack, step, total }) {
  const fg = dark ? '#fff' : AT.slate900;
  const trackBg = dark ? 'rgba(255,255,255,0.1)' : AT.slate100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 4px' }}>
      <button onClick={onBack} aria-label="Back" style={{
        width: 36, height: 36, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div style={{ flex: 1, display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? AT.brand600 : trackBg,
            transition: 'background 200ms',
          }}/>
        ))}
      </div>
      <div style={{ width: 36 }}/>
    </div>
  );
}

Object.assign(window, {
  SplashScreen, PhoneScreen, OtpScreen, PinScreen, OnboardingScreen, LockScreen,
  AUTH_STRINGS, ZhiMark, PrimaryBtn, GhostBtn,
});
