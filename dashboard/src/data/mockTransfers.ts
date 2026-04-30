/**
 * Transfers Monitor mock dataset — 200 transfers spread across last 30 days.
 *
 * Status mix per spec: 65% completed / 12% processing / 8% failed / 4% reversed / 11% created.
 * Failure-code mix: CARD_DECLINED, RECIPIENT_INVALID, INSUFFICIENT_FUNDS,
 * PROVIDER_UNAVAILABLE, LIMIT_DAILY_EXCEEDED, SANCTIONS_HIT.
 *
 * Schemes: UzCard + Humo only. Visa / Mastercard are scoped out of all
 * dashboard mock data until the user explicitly invokes them — see
 * `ai_context/LESSONS.md` ("Visa / Mastercard rails are out of dashboard
 * mock data until user explicitly invokes them").
 *
 * Each transfer carries 3-6 transfer_events covering the full state path.
 * Builder is seeded so the dataset is identical across reloads.
 */

import { TRANSFERS as EXISTING_TRANSFERS } from './mock';
import type {
  AmlFlag,
  CardScheme,
  Destination,
  Transfer,
  TransferEvent,
  TransferStatus,
} from '@/types';

// =====================================================================
// Reference data — deterministic pools
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function ago(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60 * 1000);
}

const SENDERS: Array<{
  id: string;
  name: string;
  phone: string;
  pinflLast4: string;
  tier: 'tier_0' | 'tier_1' | 'tier_2';
}> = [
  { id: 'u_01', name: 'Olim Karimov',    phone: '+998 90 123 45 67', pinflLast4: '1234', tier: 'tier_2' },
  { id: 'u_02', name: 'Madina Yusupova', phone: '+998 91 234 56 78', pinflLast4: '7890', tier: 'tier_2' },
  { id: 'u_03', name: 'Sardor Tursunov', phone: '+998 93 345 67 89', pinflLast4: '2456', tier: 'tier_1' },
  { id: 'u_04', name: 'Aziza Rahimova',  phone: '+998 94 456 78 90', pinflLast4: '9012', tier: 'tier_2' },
  { id: 'u_05', name: 'Bekzod Nurmatov', phone: '+998 95 567 89 01', pinflLast4: '3456', tier: 'tier_1' },
];

interface MockCard {
  scheme: CardScheme;
  maskedPan: string;
  bank: string;
  cardId: string;
}
const CARDS_BY_USER: Record<string, MockCard[]> = {
  u_01: [
    { cardId: 'c_01',     scheme: 'uzcard', maskedPan: '860011••••4242', bank: 'Universalbank' },
    { cardId: 'c_ol_02',  scheme: 'uzcard', maskedPan: '860011••••5454', bank: 'Trustbank' },
  ],
  u_02: [
    { cardId: 'c_02',     scheme: 'humo',   maskedPan: '986007••••5511', bank: 'Kapitalbank' },
    { cardId: 'c_ma_02',  scheme: 'humo',   maskedPan: '986007••••8800', bank: 'Kapitalbank' },
  ],
  u_03: [
    { cardId: 'c_04',     scheme: 'humo',   maskedPan: '986007••••3344', bank: 'Hamkorbank' },
    { cardId: 'c_sa_uz',  scheme: 'uzcard', maskedPan: '860011••••9876', bank: 'Hamkorbank' },
  ],
  u_04: [
    { cardId: 'c_03',     scheme: 'uzcard', maskedPan: '860011••••8901', bank: 'Asakabank' },
    { cardId: 'c_az_h',   scheme: 'humo',   maskedPan: '986007••••8901', bank: 'Asakabank' },
  ],
  u_05: [
    { cardId: 'c_05',     scheme: 'uzcard', maskedPan: '860011••••7788', bank: "Ipak Yo'li Bank" },
    { cardId: 'c_be_h',   scheme: 'humo',   maskedPan: '986007••••7654', bank: 'Agrobank' },
  ],
};

const ALIPAY_HANDLES = [
  '13800138000', '13900139000', '13700137000', '13600136000', '13500135000',
  '13400134000', '13300133000', '13200132000', '13100131000', '13000130000',
  '15012345678', '15123456789', '15234567890', '15345678901', '15456789012',
  '18800188000', '18811881888', '18988889999', '18712345678', '18923456789',
];

const WECHAT_HANDLES = [
  'wxid_zhang_wei', 'wxid_li_ming',     'wxid_chen_yu',     'wxid_wang_lei',
  'wxid_liu_yang',  'wxid_zhao_lei',    'wxid_huang_min',   'wxid_sun_jian',
  'wxid_zhou_hai',  'wxid_xu_feng',     'wxid_ma_li',       'wxid_zhu_jun',
  'wxid_hu_bin',    'wxid_guo_qiang',   'wxid_lin_tao',     'wxid_he_jing',
  'wxid_gao_kai',   'wxid_song_ying',   'wxid_tang_yun',    'wxid_wu_dan',
];

// Historical client_rate per day (oldest → newest). Index 0 = 30 days ago.
const FX_RATES_HISTORICAL = [
  1395.50, 1396.20, 1397.80, 1399.10, 1400.45, 1401.75, 1402.30, 1403.05,
  1404.17, 1404.49, 1405.10, 1405.99, 1406.85, 1407.33, 1408.40, 1409.05,
  1410.20, 1411.20, 1412.10, 1413.50, 1413.00, 1410.80, 1408.40, 1406.10,
  1404.55, 1403.20, 1402.10, 1401.40, 1400.80, 1400.20,
];

// 16 failed transfers, distributed: 5/4/3/2/1/1
const FAILURE_CODE_LIST: string[] = [
  'CARD_DECLINED', 'CARD_DECLINED', 'CARD_DECLINED', 'CARD_DECLINED', 'CARD_DECLINED',
  'RECIPIENT_INVALID', 'RECIPIENT_INVALID', 'RECIPIENT_INVALID', 'RECIPIENT_INVALID',
  'INSUFFICIENT_FUNDS', 'INSUFFICIENT_FUNDS', 'INSUFFICIENT_FUNDS',
  'PROVIDER_UNAVAILABLE', 'PROVIDER_UNAVAILABLE',
  'LIMIT_DAILY_EXCEEDED',
  'SANCTIONS_HIT',
];

const REVERSAL_REASONS = [
  'Customer-requested refund — order cancelled by recipient',
  'Duplicate transfer — sender confirmed earlier transfer succeeded',
  'Recipient-side reversal — provider rejected after capture',
  'Suspected fraud — escalated from AML triage',
  'Compliance hold lifted — reversal per legal request',
  'Sender-requested refund — wrong recipient handle',
];

// =====================================================================
// Seeded PRNG (Mulberry32). Same seed → identical output across reloads.
// =====================================================================

function makeRandom(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// =====================================================================
// Build 180 additional transfers to complement the existing 20.
// =====================================================================

function buildAdditionalTransfers(): Transfer[] {
  const rand = makeRandom(42);
  const transfers: Transfer[] = [];

  // Status mix totals across the FULL 200 set:
  //   completed: 130, processing: 24, failed: 16, reversed: 8, created: 22
  // Existing 20 already has: completed 14, processing 3, failed 2, reversed 1, created 0
  // So additional 180 must contribute: 116 completed, 21 processing, 14 failed, 7 reversed, 22 created
  const statusList: TransferStatus[] = [];
  const remainder: Array<[TransferStatus, number]> = [
    ['completed', 116],
    ['processing', 21],
    ['failed', 14],
    ['reversed', 7],
    ['created', 22],
  ];
  for (const [status, count] of remainder) {
    for (let i = 0; i < count; i++) statusList.push(status);
  }
  // Fisher-Yates shuffle so statuses interleave naturally.
  for (let i = statusList.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [statusList[i], statusList[j]] = [statusList[j], statusList[i]];
  }

  let failureIdx = 0;
  const reversalReasonStarts = REVERSAL_REASONS.length;

  for (let i = 0; i < 180; i++) {
    const status = statusList[i];
    const id = `t_${String(i + 21).padStart(4, '0')}`;

    // Age distribution biased by status.
    let ageMinutes: number;
    if (status === 'created') ageMinutes = Math.floor(rand() * 20); // 0–20 min
    else if (status === 'processing') ageMinutes = Math.floor(rand() * 90); // 0–1.5h
    else if (status === 'reversed') ageMinutes = 60 + Math.floor(rand() * (24 * 60 * 14)); // 1h–14d
    else ageMinutes = Math.floor(rand() * (24 * 60 * 30)); // 0–30d
    const createdAt = new Date(NOW.getTime() - ageMinutes * 60 * 1000);

    const sender = pick(rand, SENDERS);
    const card = pick(rand, CARDS_BY_USER[sender.id]);

    const destination: Destination = rand() < 0.5 ? 'alipay' : 'wechat';
    const recipientIdentifier = pick(
      rand,
      destination === 'alipay' ? ALIPAY_HANDLES : WECHAT_HANDLES,
    );

    // Log-uniform amount: 100k–45M UZS (round to nearest 1 000 UZS).
    const logMin = Math.log(100_000);
    const logMax = Math.log(45_000_000);
    const amountUzsMajor =
      Math.round(Math.exp(logMin + rand() * (logMax - logMin)) / 1000) * 1000;

    // Day-aligned FX rate.
    const dayIdx = Math.min(
      Math.floor(ageMinutes / (60 * 24)),
      FX_RATES_HISTORICAL.length - 1,
    );
    const clientRate = FX_RATES_HISTORICAL[FX_RATES_HISTORICAL.length - 1 - dayIdx];

    const amountCnyFen = Math.floor((amountUzsMajor / clientRate) * 100);
    const feeUzsMajor = Math.round((amountUzsMajor * 0.01) / 1000) * 1000; // 1% domestic
    const fxSpreadMajor = Math.round((amountUzsMajor * 0.001) / 100) * 100; // ~0.1%
    const totalChargeMajor = amountUzsMajor + feeUzsMajor + fxSpreadMajor;

    const failureCode =
      status === 'failed'
        ? FAILURE_CODE_LIST[failureIdx++ % FAILURE_CODE_LIST.length]
        : undefined;

    const externalTxId =
      status === 'completed' || status === 'processing' || status === 'reversed'
        ? `${destination === 'alipay' ? 'AP' : 'WX'}-${String(createdAt.getTime()).slice(-8)}-${id.slice(-4).toUpperCase()}`
        : undefined;

    const completedAt =
      status === 'completed' || status === 'reversed'
        ? new Date(createdAt.getTime() + (60_000 + Math.floor(rand() * 600_000))) // 1–11 min later
        : undefined;

    transfers.push({
      id,
      userId: sender.id,
      userName: sender.name,
      userPhone: sender.phone,
      cardId: card.cardId,
      cardScheme: card.scheme,
      cardMaskedPan: card.maskedPan,
      cardBank: card.bank,
      recipientIdentifier,
      destination,
      amountUzs: BigInt(amountUzsMajor) * 100n,
      amountCny: BigInt(amountCnyFen),
      feeUzs: BigInt(feeUzsMajor) * 100n,
      fxSpreadUzs: BigInt(fxSpreadMajor) * 100n,
      totalChargeUzs: BigInt(totalChargeMajor) * 100n,
      clientRate,
      status,
      failureCode,
      externalTxId,
      createdAt,
      completedAt,
    });
  }

  // Suppress unused warning for reasonStarts (used below for AML diversity).
  void reversalReasonStarts;

  return transfers;
}

// =====================================================================
// Event chain per transfer (3-6 events, status-aware).
// =====================================================================

function failureContext(code: string, t: Transfer): Record<string, unknown> {
  switch (code) {
    case 'CARD_DECLINED':
      return { acquirer_response: 'DECLINED', reason_code: '05', card_scheme: t.cardScheme };
    case 'RECIPIENT_INVALID':
      return { provider_response: 'INVALID_HANDLE', destination: t.destination };
    case 'INSUFFICIENT_FUNDS':
      return { acquirer_response: 'NSF', balance_insufficient: true };
    case 'PROVIDER_UNAVAILABLE':
      return { provider_status: 'TIMEOUT', retried: 3 };
    case 'LIMIT_DAILY_EXCEEDED':
      return {
        current_daily_used_uzs: '4900000000',
        limit_uzs: '5000000000',
        tier: 'tier_1',
      };
    case 'SANCTIONS_HIT':
      return { aml_flag_id: 'aml_sanctions_xx', severity: 'critical', auto_blocked: true };
    default:
      return {};
  }
}

function buildEventsForTransfer(t: Transfer, rand: () => number): TransferEvent[] {
  const events: TransferEvent[] = [];
  const t0 = t.createdAt.getTime();
  let n = 1;

  events.push({
    id: `e_${t.id}_${n++}`,
    transferId: t.id,
    fromStatus: null,
    toStatus: 'created',
    actor: 'user',
    createdAt: t.createdAt,
  });
  events.push({
    id: `e_${t.id}_${n++}`,
    transferId: t.id,
    fromStatus: 'created',
    toStatus: 'created',
    actor: 'system',
    context: { action: 'card_3ds_challenge_sent' },
    createdAt: new Date(t0 + 2_000 + Math.floor(rand() * 5_000)),
  });
  events.push({
    id: `e_${t.id}_${n++}`,
    transferId: t.id,
    fromStatus: 'created',
    toStatus: 'created',
    actor: 'provider',
    context: { action: 'card_3ds_completed', auth_id: `auth_${t.id.slice(-4)}` },
    createdAt: new Date(t0 + 12_000 + Math.floor(rand() * 8_000)),
  });

  if (t.status === 'created') return events;

  events.push({
    id: `e_${t.id}_${n++}`,
    transferId: t.id,
    fromStatus: 'created',
    toStatus: 'processing',
    actor: 'system',
    createdAt: new Date(t0 + 25_000 + Math.floor(rand() * 15_000)),
  });

  if (t.status === 'processing') return events;

  if (t.status === 'failed') {
    events.push({
      id: `e_${t.id}_${n++}`,
      transferId: t.id,
      fromStatus: 'processing',
      toStatus: 'failed',
      actor:
        t.failureCode === 'SANCTIONS_HIT' || t.failureCode === 'LIMIT_DAILY_EXCEEDED'
          ? 'admin'
          : 'provider',
      failureCode: t.failureCode,
      context: failureContext(t.failureCode!, t),
      createdAt: new Date(t0 + 60_000 + Math.floor(rand() * 240_000)),
    });
    return events;
  }

  // completed or reversed
  const completedAt = t.completedAt ?? new Date(t0 + 120_000);
  events.push({
    id: `e_${t.id}_${n++}`,
    transferId: t.id,
    fromStatus: 'processing',
    toStatus: 'completed',
    actor: 'provider',
    context: {
      external_tx_id: t.externalTxId,
      provider_amount_received_cny: Number(t.amountCny) / 100,
      provider_response: 'SUCCESS',
    },
    createdAt: completedAt,
  });

  if (t.status === 'completed') return events;

  events.push({
    id: `e_${t.id}_${n++}`,
    transferId: t.id,
    fromStatus: 'completed',
    toStatus: 'reversed',
    actor: 'admin',
    context: {
      reason: pick(rand, REVERSAL_REASONS),
      admin_id: 'admin_super_01',
      ledger_credit_uzs: t.totalChargeUzs.toString(),
    },
    createdAt: new Date(
      completedAt.getTime() + (3_600_000 + Math.floor(rand() * 86_400_000 * 3)),
    ),
  });

  return events;
}

// =====================================================================
// AML flags — attached to a small subset of transfers.
// =====================================================================

function buildAmlFlags(transfers: Transfer[]): AmlFlag[] {
  // Pick deterministic candidates: a few high-amount completed/processing
  // transfers and one sanctions-failed transfer.
  const flags: AmlFlag[] = [];

  const highAmounts = [...transfers]
    .filter((t) => t.status === 'completed' || t.status === 'processing')
    .sort((a, b) => Number(b.amountUzs - a.amountUzs))
    .slice(0, 5);

  if (highAmounts[0]) {
    flags.push({
      id: 'aml_velocity_01',
      userId: highAmounts[0].userId,
      userName: highAmounts[0].userName,
      transferId: highAmounts[0].id,
      flagType: 'velocity',
      severity: 'warning',
      description: '5 transfers in 30 minutes — above velocity threshold',
      status: 'open',
      createdAt: new Date(highAmounts[0].createdAt.getTime() + 60_000),
    });
  }
  if (highAmounts[1]) {
    flags.push({
      id: 'aml_amount_01',
      userId: highAmounts[1].userId,
      userName: highAmounts[1].userName,
      transferId: highAmounts[1].id,
      flagType: 'amount',
      severity: 'info',
      description: 'Single transfer above 90% of monthly limit',
      status: 'cleared',
      resolvedAt: new Date(highAmounts[1].createdAt.getTime() + 600_000),
      createdAt: new Date(highAmounts[1].createdAt.getTime() + 30_000),
    });
  }
  if (highAmounts[2]) {
    flags.push({
      id: 'aml_pattern_01',
      userId: highAmounts[2].userId,
      userName: highAmounts[2].userName,
      transferId: highAmounts[2].id,
      flagType: 'pattern',
      severity: 'warning',
      description: 'Recipient seen receiving from multiple senders this week',
      status: 'reviewing',
      assignedTo: 'admin_super_01',
      createdAt: new Date(highAmounts[2].createdAt.getTime() + 120_000),
    });
  }

  // Attach a critical sanctions flag to every SANCTIONS_HIT failure.
  const sanctionsFailed = transfers.filter((t) => t.failureCode === 'SANCTIONS_HIT');
  for (const t of sanctionsFailed) {
    flags.push({
      id: `aml_sanctions_${t.id}`,
      userId: t.userId,
      userName: t.userName,
      transferId: t.id,
      flagType: 'sanctions',
      severity: 'critical',
      description: 'Recipient handle matches sanctions watchlist',
      status: 'reviewing',
      assignedTo: 'admin_super_01',
      createdAt: new Date(t.createdAt.getTime() + 30_000),
    });
  }

  return flags;
}

// =====================================================================
// Build, sort, index
// =====================================================================

const additional = buildAdditionalTransfers();

export const TRANSFERS_FULL: Transfer[] = [...EXISTING_TRANSFERS, ...additional].sort(
  (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
);

const eventRand = makeRandom(73);
export const TRANSFER_EVENTS_FULL: TransferEvent[] = [];
for (const t of TRANSFERS_FULL) {
  TRANSFER_EVENTS_FULL.push(...buildEventsForTransfer(t, eventRand));
}
TRANSFER_EVENTS_FULL.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

export const MOCK_AML_FLAGS: AmlFlag[] = buildAmlFlags(TRANSFERS_FULL);

// Indexed lookups
const transferById = new Map<string, Transfer>(TRANSFERS_FULL.map((t) => [t.id, t]));

const eventsByTransfer = new Map<string, TransferEvent[]>();
for (const ev of TRANSFER_EVENTS_FULL) {
  const list = eventsByTransfer.get(ev.transferId) ?? [];
  list.push(ev);
  eventsByTransfer.set(ev.transferId, list);
}
for (const list of eventsByTransfer.values()) {
  list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

const amlFlagsByTransfer = new Map<string, AmlFlag[]>();
for (const f of MOCK_AML_FLAGS) {
  if (!f.transferId) continue;
  const list = amlFlagsByTransfer.get(f.transferId) ?? [];
  list.push(f);
  amlFlagsByTransfer.set(f.transferId, list);
}

// =====================================================================
// Public helpers
// =====================================================================

export function getTransferById(id: string): Transfer | undefined {
  return transferById.get(id);
}

export function getEventsForTransfer(transferId: string): TransferEvent[] {
  return eventsByTransfer.get(transferId) ?? [];
}

export function getAmlFlagsForTransfer(transferId: string): AmlFlag[] {
  return amlFlagsByTransfer.get(transferId) ?? [];
}

// Status counts across all transfers — used by the filter chips.
export const STATUS_COUNTS: Record<TransferStatus, number> = {
  created: 0,
  processing: 0,
  completed: 0,
  failed: 0,
  reversed: 0,
};
for (const t of TRANSFERS_FULL) {
  STATUS_COUNTS[t.status]++;
}

// Quick-filter counts (computed eagerly, refreshed on rebuild only).
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
const TEN_MIN_MS = 10 * 60 * 1000;

export const QUICK_FILTERS = {
  failedToday: TRANSFERS_FULL.filter(
    (t) => t.status === 'failed' && NOW.getTime() - t.createdAt.getTime() < ONE_DAY_MS,
  ).length,
  reversedLast7d: TRANSFERS_FULL.filter(
    (t) => t.status === 'reversed' && NOW.getTime() - t.createdAt.getTime() < SEVEN_DAYS_MS,
  ).length,
  stuckProcessing: TRANSFERS_FULL.filter(
    (t) => t.status === 'processing' && NOW.getTime() - t.createdAt.getTime() > TEN_MIN_MS,
  ).length,
};
