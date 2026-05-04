// ZhiPay design tokens — sourced from Figma (page ❖ Components, Variables)
// Values verified against /METADATA.md + /Components/Card/index.jsx in the .fig.

const T = {
  // brand
  brand50:  'rgb(232,241,252)',
  brand100: 'rgb(201,222,248)',
  brand500: 'rgb(22,119,255)',
  brand600: 'rgb(10,100,188)',  // color/primary
  brand700: 'rgb(12,86,155)',
  brand900: 'rgb(14,49,85)',

  // slate
  slate50:  'rgb(248,250,252)',  // color/background (light)
  slate100: 'rgb(241,245,249)',
  slate200: 'rgb(226,232,240)',  // color/border
  slate300: 'rgb(203,213,225)',
  slate400: 'rgb(148,163,184)',
  slate500: 'rgb(100,116,139)',  // color/muted-foreground
  slate700: 'rgb(51,65,85)',
  slate900: 'rgb(15,23,42)',     // color/foreground (light)
  slate950: 'rgb(2,6,23)',

  // status
  success50:  'rgb(240,253,244)',
  success500: 'rgb(34,197,94)',
  success900: 'rgb(21,128,61)',

  warning50:  'rgb(254,252,232)',
  warning500: 'rgb(220,138,5)',
  warning900: 'rgb(180,83,9)',

  danger50:  'rgb(254,242,242)',
  danger500: 'rgb(220,38,38)',
  danger900: 'rgb(185,28,28)',

  white: 'rgb(255,255,255)',
  black: 'rgb(0,0,0)',
};

// dark-mode counterparts (light → dark via Variables modes)
const Tdark = {
  ...T,
  slate50:  'rgb(2,6,23)',       // background-dark
  slate100: 'rgb(15,23,42)',     // card-dark
  slate200: 'rgb(30,41,59)',     // border-dark
  slate500: 'rgb(148,163,184)',  // muted-fg-dark
  slate900: 'rgb(248,250,252)',  // foreground-dark
  brand50:  'rgba(10,100,188,0.18)',
  brand100: 'rgba(10,100,188,0.28)',
};

const radius = { sm: 8, md: 12, lg: 20, pill: 9999 };
const space  = { 1:4, 2:6, 3:8, 4:10, 5:12, 6:14, 7:16, 8:20, 9:24, 10:32, 11:40, 12:48, 13:64 };
const shadow = {
  sm:   '0 1px 2px rgba(0,0,0,0.04)',
  md:   '0 2px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  lg:   '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
  hero: '0 24px 48px rgba(12,86,155,0.28), 0 8px 16px rgba(12,86,155,0.18)',
};
const motion = { fast: 120, base: 200, slow: 320 };

// type styles — use semantic name from rules pack
const type = {
  display1:  { fontFamily: 'Inter', fontWeight: 700, fontSize: 44, lineHeight: '52px', letterSpacing: '-0.02em' },
  display2:  { fontFamily: 'Inter', fontWeight: 700, fontSize: 32, lineHeight: '40px', letterSpacing: '-0.015em' },
  heading:   { fontFamily: 'Inter', fontWeight: 600, fontSize: 22, lineHeight: '28px', letterSpacing: '-0.01em' },
  body:      { fontFamily: 'Inter', fontWeight: 400, fontSize: 16, lineHeight: '24px' },
  bodyMed:   { fontFamily: 'Inter', fontWeight: 500, fontSize: 16, lineHeight: '24px' },
  bodySemi:  { fontFamily: 'Inter', fontWeight: 600, fontSize: 16, lineHeight: '24px' },
  bodySm:    { fontFamily: 'Inter', fontWeight: 400, fontSize: 14, lineHeight: '20px' },
  bodySmMed: { fontFamily: 'Inter', fontWeight: 500, fontSize: 14, lineHeight: '20px' },
  bodySmSemi:{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, lineHeight: '20px' },
  label:     { fontFamily: 'Inter', fontWeight: 500, fontSize: 13, lineHeight: '16px', letterSpacing: '0.04em', textTransform: 'uppercase' },
  monoBody:  { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 400, fontSize: 16, lineHeight: '24px', fontVariantNumeric: 'tabular-nums' },
  monoBodySm:{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 400, fontSize: 14, lineHeight: '20px', fontVariantNumeric: 'tabular-nums' },
  monoLabel: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 500, fontSize: 13, lineHeight: '16px', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' },
};

Object.assign(window, { T, Tdark, radius, space, shadow, motion, type });
