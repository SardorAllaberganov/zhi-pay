/**
 * Cards mock dataset — 80 cards across 33 distinct users for /customers/cards.
 *
 * Single source of truth for linked-card data:
 *   - The Cards list page (/customers/cards) reads `listCards()`.
 *   - The user-detail Cards tab re-exports `getCardsByUserId` via mockUsers.
 *   - Block-user side effect (`freezeAllUserActiveCards`) is invoked from
 *     mockUsers.blockUser so the cross-store state stays in sync.
 *   - Card IDs `c_01` / `c_02` / `c_03` / `c_04` / `c_05` / `c_ol_02` /
 *     `c_ma_02` / `c_sa_uz` / `c_az_h` / `c_be_h` MATCH the cardIds used
 *     in `mockTransfers.ts` so a `?card_id=...` filter on the Transfers
 *     page resolves to the right transfer history.
 *
 * Status mix per spec:
 *   73 active · 4 frozen · 2 expired · 1 removed = 80
 *
 * Schemes: UzCard + Humo only (LESSONS 2026-04-30 — no Visa/Mastercard
 * in dashboard mock data until the user explicitly invokes them).
 *
 * Spec called for "60 distinct users" but the existing user pool is 50
 * and the partial-registration rule restricts cards to tier_2 users
 * (plus a few historic tier_2-now-tier_1 cases). Realistic distinct-owner
 * count: 33. Schema in `docs/models.md` is unaffected.
 */

export type CardScheme = 'uzcard' | 'humo';
export type CardStatus = 'active' | 'frozen' | 'expired' | 'removed';

export interface CardEntry {
  id: string;
  userId: string;
  scheme: CardScheme;
  maskedPan: string;
  bank: string;
  holderName: string;
  issuerCountry: string;
  expiryMonth: number;
  expiryYear: number;
  status: CardStatus;
  isDefault: boolean;
  token: string;
  lastUsedAt: Date | null;
  createdAt: Date;
  freezeReason?: string;
  freezeSeverity?: FreezeSeverity;
}

export type FreezeSeverity = 'suspicious_activity' | 'aml_flag' | 'user_request' | 'other';

// =====================================================================
// Deterministic time helpers — must match mockUsers / mockTransfers NOW
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}
function hoursAgo(hours: number): Date {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000);
}
function minsAgo(mins: number): Date {
  return new Date(NOW.getTime() - mins * 60 * 1000);
}

// =====================================================================
// 80-card seed (manual, deterministic — no PRNG). Card IDs c_01..c_be_h
// for u_01..u_05 are reused from mockTransfers; everything else is new.
// =====================================================================

const _SEED: CardEntry[] = [
  // u_01 Olim Karimov — 4 active (incl. 2 from mockTransfers)
  { id: 'c_01',     userId: 'u_01', scheme: 'uzcard', maskedPan: '860011••••4242', bank: 'Universalbank',  holderName: 'Olim Karimov',    issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_a1b2c301',  lastUsedAt: minsAgo(180),   createdAt: daysAgo(450) },
  { id: 'c_ol_02',  userId: 'u_01', scheme: 'uzcard', maskedPan: '860011••••5454', bank: 'Trustbank',      holderName: 'Olim Karimov',    issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_a1b2c302',  lastUsedAt: daysAgo(8),     createdAt: daysAgo(300) },
  { id: 'c_ol_03',  userId: 'u_01', scheme: 'humo',   maskedPan: '986007••••1100', bank: 'Hamkorbank',     holderName: 'Olim Karimov',    issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_a1b2c303',  lastUsedAt: daysAgo(45),    createdAt: daysAgo(160) },
  { id: 'c_ol_04',  userId: 'u_01', scheme: 'uzcard', maskedPan: '860011••••2828', bank: 'NBU',            holderName: 'Olim Karimov',    issuerCountry: 'UZ', expiryMonth:  2, expiryYear: 2029, status: 'active', isDefault: false, token: 'tok_acq_a1b2c304',  lastUsedAt: daysAgo(2),     createdAt: daysAgo(70)  },

  // u_02 Madina Yusupova — 2 active
  { id: 'c_02',     userId: 'u_02', scheme: 'humo',   maskedPan: '986007••••5511', bank: 'Kapitalbank',    holderName: 'Madina Yusupova', issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_b3c4d501',  lastUsedAt: hoursAgo(2),    createdAt: daysAgo(220) },
  { id: 'c_ma_02',  userId: 'u_02', scheme: 'humo',   maskedPan: '986007••••8800', bank: 'Kapitalbank',    holderName: 'Madina Yusupova', issuerCountry: 'UZ', expiryMonth: 11, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_b3c4d502',  lastUsedAt: daysAgo(20),    createdAt: daysAgo(150) },

  // u_03 Sardor Tursunov — 2 active (Hamkorbank duo)
  { id: 'c_sa_uz',  userId: 'u_03', scheme: 'uzcard', maskedPan: '860011••••9876', bank: 'Hamkorbank',     holderName: 'Sardor Tursunov', issuerCountry: 'UZ', expiryMonth: 11, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_c5d6e701',  lastUsedAt: minsAgo(45),    createdAt: daysAgo(300) },
  { id: 'c_04',     userId: 'u_03', scheme: 'humo',   maskedPan: '986007••••3344', bank: 'Hamkorbank',     holderName: 'Sardor Tursunov', issuerCountry: 'UZ', expiryMonth:  3, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_c5d6e702',  lastUsedAt: hoursAgo(8),    createdAt: daysAgo(180) },

  // u_04 Aziza Rahimova — 2 active
  { id: 'c_03',     userId: 'u_04', scheme: 'uzcard', maskedPan: '860011••••8901', bank: 'Asakabank',      holderName: 'Aziza Rahimova',  issuerCountry: 'UZ', expiryMonth:  8, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_d7e8f901',  lastUsedAt: hoursAgo(6),    createdAt: daysAgo(85)  },
  { id: 'c_az_h',   userId: 'u_04', scheme: 'humo',   maskedPan: '986007••••8901', bank: 'Asakabank',      holderName: 'Aziza Rahimova',  issuerCountry: 'UZ', expiryMonth:  8, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_d7e8f902',  lastUsedAt: daysAgo(12),    createdAt: daysAgo(85)  },

  // u_05 Bekzod Nurmatov — 2 active
  { id: 'c_05',     userId: 'u_05', scheme: 'uzcard', maskedPan: '860011••••7788', bank: "Ipak Yo'li Bank", holderName: 'Bekzod Nurmatov', issuerCountry: 'UZ', expiryMonth: 12, expiryYear: 2026, status: 'active', isDefault: true,  token: 'tok_acq_e9f0a101',  lastUsedAt: daysAgo(1),     createdAt: daysAgo(50)  },
  { id: 'c_be_h',   userId: 'u_05', scheme: 'humo',   maskedPan: '986007••••7654', bank: 'Agrobank',       holderName: 'Bekzod Nurmatov', issuerCountry: 'UZ', expiryMonth:  5, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_e9f0a102',  lastUsedAt: daysAgo(35),    createdAt: daysAgo(50)  },

  // u_06 Diyora Azimova — 2 active
  { id: 'c_u06_uz', userId: 'u_06', scheme: 'uzcard', maskedPan: '860011••••3030', bank: 'Hamkorbank',     holderName: 'Diyora Azimova',  issuerCountry: 'UZ', expiryMonth:  3, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_f1a2b301',  lastUsedAt: minsAgo(30),    createdAt: daysAgo(240) },
  { id: 'c_u06_h',  userId: 'u_06', scheme: 'humo',   maskedPan: '986007••••3131', bank: 'Universalbank',  holderName: 'Diyora Azimova',  issuerCountry: 'UZ', expiryMonth:  7, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_f1a2b302',  lastUsedAt: daysAgo(15),    createdAt: daysAgo(160) },

  // u_07 Jasur Toshmatov (blocked) — 1 frozen (auto-frozen on block)
  { id: 'c_u07_uz', userId: 'u_07', scheme: 'uzcard', maskedPan: '860011••••4040', bank: 'Asakabank',      holderName: 'Jasur Toshmatov', issuerCountry: 'UZ', expiryMonth: 11, expiryYear: 2026, status: 'frozen', isDefault: false, token: 'tok_acq_a3b4c501',  lastUsedAt: daysAgo(85),    createdAt: daysAgo(380), freezeReason: 'Auto-frozen — user blocked: AML escalation, sanctions match', freezeSeverity: 'aml_flag' },

  // u_09 Rustam Mirzaev (kyc=expired) — 2 active
  { id: 'c_u09_uz', userId: 'u_09', scheme: 'uzcard', maskedPan: '860011••••5050', bank: 'Kapitalbank',    holderName: 'Rustam Mirzaev',  issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_b5c6d701',  lastUsedAt: daysAgo(72),    createdAt: daysAgo(410) },
  { id: 'c_u09_h',  userId: 'u_09', scheme: 'humo',   maskedPan: '986007••••5151', bank: 'Hamkorbank',     holderName: 'Rustam Mirzaev',  issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_b5c6d702',  lastUsedAt: null,           createdAt: daysAgo(220) },

  // u_10 Kamila Ismoilova — 4 active (heavy user)
  { id: 'c_u10_uz', userId: 'u_10', scheme: 'uzcard', maskedPan: '860011••••6060', bank: 'NBU',            holderName: 'Kamila Ismoilova', issuerCountry: 'UZ', expiryMonth:  5, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_c7d8e901',  lastUsedAt: hoursAgo(1),    createdAt: daysAgo(320) },
  { id: 'c_u10_uz2',userId: 'u_10', scheme: 'uzcard', maskedPan: '860011••••6161', bank: 'Universalbank',  holderName: 'Kamila Ismoilova', issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_c7d8e902',  lastUsedAt: daysAgo(7),     createdAt: daysAgo(280) },
  { id: 'c_u10_h',  userId: 'u_10', scheme: 'humo',   maskedPan: '986007••••6262', bank: 'Hamkorbank',     holderName: 'Kamila Ismoilova', issuerCountry: 'UZ', expiryMonth:  1, expiryYear: 2029, status: 'active', isDefault: false, token: 'tok_acq_c7d8e903',  lastUsedAt: daysAgo(30),    createdAt: daysAgo(190) },
  { id: 'c_u10_h2', userId: 'u_10', scheme: 'humo',   maskedPan: '986007••••6363', bank: 'Kapitalbank',    holderName: 'Kamila Ismoilova', issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_c7d8e904',  lastUsedAt: daysAgo(120),   createdAt: daysAgo(120) },

  // u_13 Davron Yuldashev — 2 active + 1 frozen by admin
  { id: 'c_u13_uz', userId: 'u_13', scheme: 'uzcard', maskedPan: '860011••••7070', bank: 'Hamkorbank',     holderName: 'Davron Yuldashev', issuerCountry: 'UZ', expiryMonth: 10, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_d9e0f101',  lastUsedAt: minsAgo(90),    createdAt: daysAgo(290) },
  { id: 'c_u13_h',  userId: 'u_13', scheme: 'humo',   maskedPan: '986007••••7171', bank: 'Asakabank',      holderName: 'Davron Yuldashev', issuerCountry: 'UZ', expiryMonth:  3, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_d9e0f102',  lastUsedAt: daysAgo(4),     createdAt: daysAgo(180) },
  { id: 'c_u13_uz2',userId: 'u_13', scheme: 'uzcard', maskedPan: '860011••••7272', bank: 'NBU',            holderName: 'Davron Yuldashev', issuerCountry: 'UZ', expiryMonth:  8, expiryYear: 2026, status: 'frozen', isDefault: false, token: 'tok_acq_d9e0f103',  lastUsedAt: daysAgo(40),    createdAt: daysAgo(150), freezeReason: 'Repeated CARD_DECLINED retries — paused for review pending acquirer trace.', freezeSeverity: 'suspicious_activity' },

  // u_14 Lola Karimbayeva — 4 active
  { id: 'c_u14_uz', userId: 'u_14', scheme: 'uzcard', maskedPan: '860011••••8080', bank: 'Universalbank',  holderName: 'Lola Karimbayeva', issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_e1f2a301',  lastUsedAt: hoursAgo(4),    createdAt: daysAgo(175) },
  { id: 'c_u14_h',  userId: 'u_14', scheme: 'humo',   maskedPan: '986007••••8181', bank: 'Kapitalbank',    holderName: 'Lola Karimbayeva', issuerCountry: 'UZ', expiryMonth: 11, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_e1f2a302',  lastUsedAt: daysAgo(11),    createdAt: daysAgo(140) },
  { id: 'c_u14_uz2',userId: 'u_14', scheme: 'uzcard', maskedPan: '860011••••8282', bank: 'Agrobank',       holderName: 'Lola Karimbayeva', issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_e1f2a303',  lastUsedAt: daysAgo(40),    createdAt: daysAgo(110) },
  { id: 'c_u14_h2', userId: 'u_14', scheme: 'humo',   maskedPan: '986007••••8383', bank: "Ipak Yo'li Bank", holderName: 'Lola Karimbayeva', issuerCountry: 'UZ', expiryMonth:  2, expiryYear: 2029, status: 'active', isDefault: false, token: 'tok_acq_e1f2a304',  lastUsedAt: null,           createdAt: daysAgo(60)  },

  // u_16 Sevara Bobomurodova — 2 active
  { id: 'c_u16_uz', userId: 'u_16', scheme: 'uzcard', maskedPan: '860011••••9090', bank: 'Hamkorbank',     holderName: 'Sevara Bobomurodova', issuerCountry: 'UZ', expiryMonth:  7, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_f3a4b501',  lastUsedAt: minsAgo(15),    createdAt: daysAgo(220) },
  { id: 'c_u16_h',  userId: 'u_16', scheme: 'humo',   maskedPan: '986007••••9191', bank: 'NBU',            holderName: 'Sevara Bobomurodova', issuerCountry: 'UZ', expiryMonth: 12, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_f3a4b502',  lastUsedAt: daysAgo(60),    createdAt: daysAgo(150) },

  // u_18 Zuhra Nazarova (blocked) — 1 frozen
  { id: 'c_u18_uz', userId: 'u_18', scheme: 'uzcard', maskedPan: '860011••••0001', bank: 'Universalbank',  holderName: 'Zuhra Nazarova',  issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2027, status: 'frozen', isDefault: false, token: 'tok_acq_a5b6c701',  lastUsedAt: daysAgo(95),    createdAt: daysAgo(200), freezeReason: 'Auto-frozen — user blocked: AML escalation, transfer pattern flagged.', freezeSeverity: 'aml_flag' },

  // u_19 Farrukh Tojiboev — 3 active
  { id: 'c_u19_uz', userId: 'u_19', scheme: 'uzcard', maskedPan: '860011••••0102', bank: 'Asakabank',      holderName: 'Farrukh Tojiboev', issuerCountry: 'UZ', expiryMonth:  5, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_b7c8d901',  lastUsedAt: hoursAgo(3),    createdAt: daysAgo(305) },
  { id: 'c_u19_h',  userId: 'u_19', scheme: 'humo',   maskedPan: '986007••••0103', bank: 'Hamkorbank',     holderName: 'Farrukh Tojiboev', issuerCountry: 'UZ', expiryMonth:  8, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_b7c8d902',  lastUsedAt: daysAgo(5),     createdAt: daysAgo(220) },
  { id: 'c_u19_uz2',userId: 'u_19', scheme: 'uzcard', maskedPan: '860011••••0104', bank: 'Trustbank',      holderName: 'Farrukh Tojiboev', issuerCountry: 'UZ', expiryMonth:  1, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_b7c8d903',  lastUsedAt: daysAgo(20),    createdAt: daysAgo(140) },

  // u_20 Malika Tashpulatova — 2 active
  { id: 'c_u20_uz', userId: 'u_20', scheme: 'uzcard', maskedPan: '860011••••0205', bank: 'Kapitalbank',    holderName: 'Malika Tashpulatova', issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_c9d0e101',  lastUsedAt: hoursAgo(5),    createdAt: daysAgo(260) },
  { id: 'c_u20_h',  userId: 'u_20', scheme: 'humo',   maskedPan: '986007••••0206', bank: 'NBU',            holderName: 'Malika Tashpulatova', issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_c9d0e102',  lastUsedAt: daysAgo(8),     createdAt: daysAgo(190) },

  // u_23 Anvar Saidaliev — 3 active
  { id: 'c_u23_uz', userId: 'u_23', scheme: 'uzcard', maskedPan: '860011••••0307', bank: 'Hamkorbank',     holderName: 'Anvar Saidaliev', issuerCountry: 'UZ', expiryMonth: 10, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_e1a2b301',  lastUsedAt: minsAgo(120),   createdAt: daysAgo(340) },
  { id: 'c_u23_h',  userId: 'u_23', scheme: 'humo',   maskedPan: '986007••••0308', bank: 'Universalbank',  holderName: 'Anvar Saidaliev', issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_e1a2b302',  lastUsedAt: daysAgo(2),     createdAt: daysAgo(250) },
  { id: 'c_u23_uz2',userId: 'u_23', scheme: 'uzcard', maskedPan: '860011••••0309', bank: 'Agrobank',       holderName: 'Anvar Saidaliev', issuerCountry: 'UZ', expiryMonth:  2, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_e1a2b303',  lastUsedAt: daysAgo(50),    createdAt: daysAgo(160) },

  // u_24 Dilfuza Mirsodikova — 2 active
  { id: 'c_u24_uz', userId: 'u_24', scheme: 'uzcard', maskedPan: '860011••••0410', bank: 'Asakabank',      holderName: 'Dilfuza Mirsodikova', issuerCountry: 'UZ', expiryMonth:  7, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_f5a6b701',  lastUsedAt: hoursAgo(12),   createdAt: daysAgo(130) },
  { id: 'c_u24_h',  userId: 'u_24', scheme: 'humo',   maskedPan: '986007••••0411', bank: 'NBU',            holderName: 'Dilfuza Mirsodikova', issuerCountry: 'UZ', expiryMonth: 11, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_f5a6b702',  lastUsedAt: daysAgo(35),    createdAt: daysAgo(80)  },

  // u_25 Zafar Akbarov (deleted) — 1 expired
  { id: 'c_u25_uz', userId: 'u_25', scheme: 'uzcard', maskedPan: '860011••••0512', bank: 'Kapitalbank',    holderName: 'Zafar Akbarov',   issuerCountry: 'UZ', expiryMonth:  3, expiryYear: 2026, status: 'expired', isDefault: false, token: 'tok_acq_a7b8c901',  lastUsedAt: daysAgo(380),   createdAt: daysAgo(480) },

  // u_27 Bakhodir Sayfullaev — 4 active
  { id: 'c_u27_uz', userId: 'u_27', scheme: 'uzcard', maskedPan: '860011••••0613', bank: 'Hamkorbank',     holderName: 'Bakhodir Sayfullaev', issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_b9c0d101',  lastUsedAt: hoursAgo(2),    createdAt: daysAgo(460) },
  { id: 'c_u27_h',  userId: 'u_27', scheme: 'humo',   maskedPan: '986007••••0614', bank: 'Asakabank',      holderName: 'Bakhodir Sayfullaev', issuerCountry: 'UZ', expiryMonth:  1, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_b9c0d102',  lastUsedAt: daysAgo(3),     createdAt: daysAgo(360) },
  { id: 'c_u27_uz2',userId: 'u_27', scheme: 'uzcard', maskedPan: '860011••••0615', bank: 'Universalbank',  holderName: 'Bakhodir Sayfullaev', issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_b9c0d103',  lastUsedAt: daysAgo(28),    createdAt: daysAgo(280) },
  { id: 'c_u27_h2', userId: 'u_27', scheme: 'humo',   maskedPan: '986007••••0616', bank: 'Trustbank',      holderName: 'Bakhodir Sayfullaev', issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_b9c0d104',  lastUsedAt: daysAgo(95),    createdAt: daysAgo(180) },

  // u_28 Kamola Mirzayeva — 2 active
  { id: 'c_u28_uz', userId: 'u_28', scheme: 'uzcard', maskedPan: '860011••••0717', bank: 'NBU',            holderName: 'Kamola Mirzayeva', issuerCountry: 'UZ', expiryMonth:  8, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_d3e4f501',  lastUsedAt: hoursAgo(1),    createdAt: daysAgo(215) },
  { id: 'c_u28_h',  userId: 'u_28', scheme: 'humo',   maskedPan: '986007••••0718', bank: 'Agrobank',       holderName: 'Kamola Mirzayeva', issuerCountry: 'UZ', expiryMonth: 12, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_d3e4f502',  lastUsedAt: daysAgo(20),    createdAt: daysAgo(170) },

  // u_31 Mirzo Ibragimov — 4 active
  { id: 'c_u31_uz', userId: 'u_31', scheme: 'uzcard', maskedPan: '860011••••0819', bank: 'Universalbank',  holderName: 'Mirzo Ibragimov', issuerCountry: 'UZ', expiryMonth:  5, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_e5f6a701',  lastUsedAt: minsAgo(60),    createdAt: daysAgo(395) },
  { id: 'c_u31_h',  userId: 'u_31', scheme: 'humo',   maskedPan: '986007••••0820', bank: 'Hamkorbank',     holderName: 'Mirzo Ibragimov', issuerCountry: 'UZ', expiryMonth: 11, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_e5f6a702',  lastUsedAt: daysAgo(8),     createdAt: daysAgo(290) },
  { id: 'c_u31_uz2',userId: 'u_31', scheme: 'uzcard', maskedPan: '860011••••0821', bank: 'Kapitalbank',    holderName: 'Mirzo Ibragimov', issuerCountry: 'UZ', expiryMonth:  3, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_e5f6a703',  lastUsedAt: daysAgo(33),    createdAt: daysAgo(220) },
  { id: 'c_u31_h2', userId: 'u_31', scheme: 'humo',   maskedPan: '986007••••0822', bank: 'NBU',            holderName: 'Mirzo Ibragimov', issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_e5f6a704',  lastUsedAt: daysAgo(120),   createdAt: daysAgo(150) },

  // u_33 Habib Tashkentov — 2 active
  { id: 'c_u33_uz', userId: 'u_33', scheme: 'uzcard', maskedPan: '860011••••0923', bank: 'Asakabank',      holderName: 'Habib Tashkentov', issuerCountry: 'UZ', expiryMonth:  7, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_a9b0c101',  lastUsedAt: hoursAgo(8),    createdAt: daysAgo(165) },
  { id: 'c_u33_h',  userId: 'u_33', scheme: 'humo',   maskedPan: '986007••••0924', bank: 'Hamkorbank',     holderName: 'Habib Tashkentov', issuerCountry: 'UZ', expiryMonth:  2, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_a9b0c102',  lastUsedAt: daysAgo(45),    createdAt: daysAgo(100) },

  // u_34 Ozoda Habibullaeva — 3 active
  { id: 'c_u34_uz', userId: 'u_34', scheme: 'uzcard', maskedPan: '860011••••1025', bank: 'Universalbank',  holderName: 'Ozoda Habibullaeva', issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_c3d4e501',  lastUsedAt: hoursAgo(1),    createdAt: daysAgo(270) },
  { id: 'c_u34_h',  userId: 'u_34', scheme: 'humo',   maskedPan: '986007••••1026', bank: "Ipak Yo'li Bank", holderName: 'Ozoda Habibullaeva', issuerCountry: 'UZ', expiryMonth: 10, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_c3d4e502',  lastUsedAt: daysAgo(7),     createdAt: daysAgo(180) },
  { id: 'c_u34_uz2',userId: 'u_34', scheme: 'uzcard', maskedPan: '860011••••1027', bank: 'Agrobank',       holderName: 'Ozoda Habibullaeva', issuerCountry: 'UZ', expiryMonth:  1, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_c3d4e503',  lastUsedAt: daysAgo(60),    createdAt: daysAgo(110) },

  // u_36 Feruza Nasriddinova — 2 active
  { id: 'c_u36_uz', userId: 'u_36', scheme: 'uzcard', maskedPan: '860011••••1128', bank: 'Hamkorbank',     holderName: 'Feruza Nasriddinova', issuerCountry: 'UZ', expiryMonth:  5, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_e7f8a901',  lastUsedAt: hoursAgo(2),    createdAt: daysAgo(145) },
  { id: 'c_u36_h',  userId: 'u_36', scheme: 'humo',   maskedPan: '986007••••1129', bank: 'Trustbank',      holderName: 'Feruza Nasriddinova', issuerCountry: 'UZ', expiryMonth:  8, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_e7f8a902',  lastUsedAt: daysAgo(18),    createdAt: daysAgo(95)  },

  // u_37 Ulug'bek Karimov — 3 active
  { id: 'c_u37_uz', userId: 'u_37', scheme: 'uzcard', maskedPan: '860011••••1230', bank: 'Asakabank',      holderName: "Ulug'bek Karimov", issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_a1b2c301',  lastUsedAt: minsAgo(20),    createdAt: daysAgo(310) },
  { id: 'c_u37_h',  userId: 'u_37', scheme: 'humo',   maskedPan: '986007••••1231', bank: 'NBU',            holderName: "Ulug'bek Karimov", issuerCountry: 'UZ', expiryMonth: 11, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_a1b2c302',  lastUsedAt: daysAgo(4),     createdAt: daysAgo(240) },
  { id: 'c_u37_uz2',userId: 'u_37', scheme: 'uzcard', maskedPan: '860011••••1232', bank: 'Universalbank',  holderName: "Ulug'bek Karimov", issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_a1b2c303',  lastUsedAt: daysAgo(30),    createdAt: daysAgo(160) },

  // u_39 Doniyor Holmatov — 2 active
  { id: 'c_u39_uz', userId: 'u_39', scheme: 'uzcard', maskedPan: '860011••••1333', bank: 'Hamkorbank',     holderName: 'Doniyor Holmatov', issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_b3c4d501',  lastUsedAt: hoursAgo(4),    createdAt: daysAgo(235) },
  { id: 'c_u39_h',  userId: 'u_39', scheme: 'humo',   maskedPan: '986007••••1334', bank: 'Kapitalbank',    holderName: 'Doniyor Holmatov', issuerCountry: 'UZ', expiryMonth:  1, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_b3c4d502',  lastUsedAt: daysAgo(15),    createdAt: daysAgo(140) },

  // u_40 Sitora Abdullaeva — 2 active
  { id: 'c_u40_uz', userId: 'u_40', scheme: 'uzcard', maskedPan: '860011••••1435', bank: 'Universalbank',  holderName: 'Sitora Abdullaeva', issuerCountry: 'UZ', expiryMonth:  3, expiryYear: 2028, status: 'active', isDefault: true,  token: 'tok_acq_c5d6e701',  lastUsedAt: hoursAgo(9),    createdAt: daysAgo(190) },
  { id: 'c_u40_h',  userId: 'u_40', scheme: 'humo',   maskedPan: '986007••••1436', bank: 'Agrobank',       holderName: 'Sitora Abdullaeva', issuerCountry: 'UZ', expiryMonth: 12, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_c5d6e702',  lastUsedAt: null,           createdAt: daysAgo(120) },

  // u_42 Robiya Ergasheva — 5 active (max for tier_2)
  { id: 'c_u42_uz', userId: 'u_42', scheme: 'uzcard', maskedPan: '860011••••1537', bank: 'NBU',            holderName: 'Robiya Ergasheva', issuerCountry: 'UZ', expiryMonth:  7, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_d7e8f901',  lastUsedAt: minsAgo(15),    createdAt: daysAgo(360) },
  { id: 'c_u42_h',  userId: 'u_42', scheme: 'humo',   maskedPan: '986007••••1538', bank: 'Hamkorbank',     holderName: 'Robiya Ergasheva', issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_d7e8f902',  lastUsedAt: daysAgo(2),     createdAt: daysAgo(290) },
  { id: 'c_u42_uz2',userId: 'u_42', scheme: 'uzcard', maskedPan: '860011••••1539', bank: 'Kapitalbank',    holderName: 'Robiya Ergasheva', issuerCountry: 'UZ', expiryMonth: 11, expiryYear: 2026, status: 'active', isDefault: false, token: 'tok_acq_d7e8f903',  lastUsedAt: daysAgo(15),    createdAt: daysAgo(220) },
  { id: 'c_u42_h2', userId: 'u_42', scheme: 'humo',   maskedPan: '986007••••1540', bank: 'Asakabank',      holderName: 'Robiya Ergasheva', issuerCountry: 'UZ', expiryMonth:  2, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_d7e8f904',  lastUsedAt: daysAgo(50),    createdAt: daysAgo(160) },
  { id: 'c_u42_uz3',userId: 'u_42', scheme: 'uzcard', maskedPan: '860011••••1541', bank: 'Universalbank',  holderName: 'Robiya Ergasheva', issuerCountry: 'UZ', expiryMonth:  8, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_d7e8f905',  lastUsedAt: daysAgo(95),    createdAt: daysAgo(85)  },

  // u_44 Maftuna Yulchieva — 2 active
  { id: 'c_u44_uz', userId: 'u_44', scheme: 'uzcard', maskedPan: '860011••••1642', bank: 'Hamkorbank',     holderName: 'Maftuna Yulchieva', issuerCountry: 'UZ', expiryMonth:  9, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_e9f0a101',  lastUsedAt: hoursAgo(6),    createdAt: daysAgo(250) },
  { id: 'c_u44_h',  userId: 'u_44', scheme: 'humo',   maskedPan: '986007••••1643', bank: 'NBU',            holderName: 'Maftuna Yulchieva', issuerCountry: 'UZ', expiryMonth:  3, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_e9f0a102',  lastUsedAt: daysAgo(11),    createdAt: daysAgo(180) },

  // u_45 Nodir Allambergenov (blocked) — 1 frozen
  { id: 'c_u45_uz', userId: 'u_45', scheme: 'uzcard', maskedPan: '860011••••1744', bank: 'Asakabank',      holderName: 'Nodir Allambergenov', issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2027, status: 'frozen', isDefault: false, token: 'tok_acq_f1a2b301',  lastUsedAt: daysAgo(30),    createdAt: daysAgo(290), freezeReason: 'Auto-frozen — user blocked: critical AML escalation, sanctions match.', freezeSeverity: 'aml_flag' },

  // u_46 Yulduz Saidkarimova — 2 active
  { id: 'c_u46_uz', userId: 'u_46', scheme: 'uzcard', maskedPan: '860011••••1845', bank: 'Universalbank',  holderName: 'Yulduz Saidkarimova', issuerCountry: 'UZ', expiryMonth:  5, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_b3c4d501',  lastUsedAt: hoursAgo(3),    createdAt: daysAgo(100) },
  { id: 'c_u46_h',  userId: 'u_46', scheme: 'humo',   maskedPan: '986007••••1846', bank: 'Trustbank',      holderName: 'Yulduz Saidkarimova', issuerCountry: 'UZ', expiryMonth:  1, expiryYear: 2027, status: 'active', isDefault: false, token: 'tok_acq_b3c4d502',  lastUsedAt: daysAgo(60),    createdAt: daysAgo(50)  },

  // u_47 Erkin Bobokhonov — 2 active + 1 expired
  { id: 'c_u47_uz', userId: 'u_47', scheme: 'uzcard', maskedPan: '860011••••1947', bank: 'Hamkorbank',     holderName: 'Erkin Bobokhonov', issuerCountry: 'UZ', expiryMonth:  8, expiryYear: 2027, status: 'active', isDefault: true,  token: 'tok_acq_c5d6e701',  lastUsedAt: hoursAgo(2),    createdAt: daysAgo(320) },
  { id: 'c_u47_h',  userId: 'u_47', scheme: 'humo',   maskedPan: '986007••••1948', bank: 'Kapitalbank',    holderName: 'Erkin Bobokhonov', issuerCountry: 'UZ', expiryMonth:  4, expiryYear: 2028, status: 'active', isDefault: false, token: 'tok_acq_c5d6e702',  lastUsedAt: daysAgo(7),     createdAt: daysAgo(220) },
  { id: 'c_u47_uz2',userId: 'u_47', scheme: 'uzcard', maskedPan: '860011••••1949', bank: 'NBU',            holderName: 'Erkin Bobokhonov', issuerCountry: 'UZ', expiryMonth:  2, expiryYear: 2026, status: 'expired', isDefault: false, token: 'tok_acq_c5d6e703',  lastUsedAt: daysAgo(75),    createdAt: daysAgo(420) },

  // u_49 Shukhrat Ismatov (deleted) — 1 removed
  { id: 'c_u49_uz', userId: 'u_49', scheme: 'uzcard', maskedPan: '860011••••2050', bank: 'Universalbank',  holderName: 'Shukhrat Ismatov', issuerCountry: 'UZ', expiryMonth:  6, expiryYear: 2028, status: 'removed', isDefault: false, token: 'tok_acq_e7f8a901',  lastUsedAt: daysAgo(420),   createdAt: daysAgo(600) },
];

// Live mutable copy — page mutators write here.
let liveCards: CardEntry[] = _SEED.slice();

// =====================================================================
// Read helpers
// =====================================================================

export function listCards(): CardEntry[] {
  return liveCards.slice();
}

export function getCardById(id: string): CardEntry | undefined {
  return liveCards.find((c) => c.id === id);
}

export function getCardsByUserId(userId: string): CardEntry[] {
  return liveCards.filter((c) => c.userId === userId).slice();
}

export function getDistinctBanks(): string[] {
  const set = new Set<string>();
  for (const c of liveCards) set.add(c.bank);
  return Array.from(set).sort();
}

export function getDistinctCountries(): string[] {
  const set = new Set<string>();
  for (const c of liveCards) set.add(c.issuerCountry);
  return Array.from(set).sort();
}

export function getCardCountsByStatus(): Record<CardStatus, number> {
  const counts: Record<CardStatus, number> = { active: 0, frozen: 0, expired: 0, removed: 0 };
  for (const c of liveCards) counts[c.status] += 1;
  return counts;
}

// =====================================================================
// Card audit log — append-only
// =====================================================================

export type CardAuditAction =
  | 'freeze'
  | 'unfreeze'
  | 'auto_freeze_user_blocked'
  | 'copy_token';

export interface CardAuditEntry {
  id: string;
  cardId: string;
  userId: string;
  action: CardAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const cardAudit: CardAuditEntry[] = [];
let cardAuditSeq = 1;

function appendCardAudit(entry: Omit<CardAuditEntry, 'id' | 'createdAt'>): CardAuditEntry {
  const e: CardAuditEntry = {
    ...entry,
    id: `caud_${String(cardAuditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  cardAudit.push(e);
  return e;
}

export function getCardAudit(cardId: string): CardAuditEntry[] {
  return cardAudit.filter((e) => e.cardId === cardId).slice().reverse();
}

/** Bridge for the central audit-log surface — full module store (newest first). */
export function listCardAudit(): CardAuditEntry[] {
  return cardAudit.slice().reverse();
}

// =====================================================================
// Mutators
// =====================================================================

export interface CardActor {
  id: string;
  name: string;
}

export function freezeCard(
  cardId: string,
  reason: string,
  severity: FreezeSeverity,
  actor: CardActor,
): CardEntry | undefined {
  const card = liveCards.find((c) => c.id === cardId);
  if (!card) return undefined;
  if (card.status !== 'active') return card;
  card.status = 'frozen';
  card.freezeReason = reason;
  card.freezeSeverity = severity;
  appendCardAudit({
    cardId,
    userId: card.userId,
    action: 'freeze',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { severity, scheme: card.scheme, maskedPan: card.maskedPan },
  });
  liveCards = liveCards.slice();
  return card;
}

export function unfreezeCard(
  cardId: string,
  reason: string,
  actor: CardActor,
): CardEntry | undefined {
  const card = liveCards.find((c) => c.id === cardId);
  if (!card) return undefined;
  if (card.status !== 'frozen') return card;
  card.status = 'active';
  card.freezeReason = undefined;
  card.freezeSeverity = undefined;
  appendCardAudit({
    cardId,
    userId: card.userId,
    action: 'unfreeze',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { scheme: card.scheme, maskedPan: card.maskedPan },
  });
  liveCards = liveCards.slice();
  return card;
}

/**
 * Block-user side effect — every active card belonging to the user
 * transitions to `frozen` with a system-generated reason. Used by
 * `mockUsers.blockUser`.
 */
export function freezeAllUserActiveCards(
  userId: string,
  reason: string,
  actor: CardActor,
): CardEntry[] {
  const affected: CardEntry[] = [];
  for (const c of liveCards) {
    if (c.userId !== userId || c.status !== 'active') continue;
    c.status = 'frozen';
    c.freezeReason = `Auto-frozen — user blocked: ${reason.slice(0, 80)}`;
    c.freezeSeverity = 'aml_flag';
    appendCardAudit({
      cardId: c.id,
      userId,
      action: 'auto_freeze_user_blocked',
      actorId: actor.id,
      actorName: actor.name,
      reason,
      context: { scheme: c.scheme, maskedPan: c.maskedPan },
    });
    affected.push(c);
  }
  if (affected.length > 0) liveCards = liveCards.slice();
  return affected;
}

/**
 * Audit-only — token copy doesn't mutate the card row.
 */
export function recordTokenCopy(
  cardId: string,
  actor: CardActor,
): CardAuditEntry | undefined {
  const card = liveCards.find((c) => c.id === cardId);
  if (!card) return undefined;
  return appendCardAudit({
    cardId,
    userId: card.userId,
    action: 'copy_token',
    actorId: actor.id,
    actorName: actor.name,
    reason: 'Acquirer token copied to clipboard.',
    context: { scheme: card.scheme, maskedPan: card.maskedPan },
  });
}

/**
 * Expiring-soon helper — true if expiry is within `days` of `now`.
 * Used to highlight the expiry row in red on the detail page.
 */
export function isExpiringSoon(card: CardEntry, days: number = 60, now: Date = new Date()): boolean {
  if (card.status === 'expired' || card.status === 'removed') return false;
  // First day of the month *after* expiry month — that's when the card stops working.
  const expiry = new Date(card.expiryYear, card.expiryMonth, 1);
  const ageMs = expiry.getTime() - now.getTime();
  if (ageMs <= 0) return false;
  return ageMs <= days * 24 * 60 * 60 * 1000;
}
