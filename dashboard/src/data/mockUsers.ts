/**
 * Users mock dataset — 50 deterministic users for /customers/users.
 *
 * IDs intentionally overlap with `mockTransfers.ts` SENDERS (u_01..u_05) so
 * the user-detail Transfers tab filters cleanly by `userId`. Cross-store
 * sync: blocking from here also calls `blockAmlUser` to keep the AML
 * UserCard's status chip in sync.
 *
 * The fully populated demo profile is `u_03 — Sardor Tursunov` (tier_2 /
 * 47 transfers / 91% success / 28.7M UZS lifetime / 2 trusted devices /
 * 2 saved Alipay recipients) per the Phase-6 spec.
 *
 * Schemes: UzCard + Humo only (LESSONS 2026-04-30).
 */

import { blockAmlUser, getInitialAmlList, ADMIN_POOL } from './mockAmlTriage';
import { TRANSFERS_FULL } from './mockTransfers';
import {
  freezeCard as cardsFreezeCard,
  unfreezeCard as cardsUnfreezeCard,
  freezeAllUserActiveCards,
  getCardsByUserId,
  type CardEntry,
  type CardScheme,
  type CardStatus,
  type FreezeSeverity,
} from './mockCards';
import type { Transfer } from '@/types';

// Re-export card types under the legacy `UserCard*` names so existing
// callers (UserCardsTab, CardActionDialog) keep compiling. mockCards is
// now the single source of truth for linked-card data.
export type UserCardScheme = CardScheme;
export type UserCardStatus = CardStatus;
export type UserCardEntry = CardEntry;
export type { FreezeSeverity };

// Per-user transfer index — built once, drives every "lifetime" / monthly /
// status-breakdown stat so the user-detail page stays consistent with the
// Transfers tab and the Recent activity feed.
const _transfersByUser = new Map<string, Transfer[]>();
for (const tx of TRANSFERS_FULL) {
  const list = _transfersByUser.get(tx.userId) ?? [];
  list.push(tx);
  _transfersByUser.set(tx.userId, list);
}

function _userTransfers(userId: string): Transfer[] {
  return _transfersByUser.get(userId) ?? [];
}

// =====================================================================
// Domain types
// =====================================================================

export type UserStatus = 'active' | 'blocked' | 'pending' | 'deleted';
export type UserTier = 'tier_0' | 'tier_1' | 'tier_2';
export type UserKycStatus = 'pending' | 'passed' | 'failed' | 'expired' | 'never';
export type UserLanguage = 'uz' | 'ru' | 'en';

export interface UserListRow {
  id: string;
  name: string;
  phone: string;
  pinfl: string | null; // 14 digits from MyID — null until KYC has passed at least once
  email?: string;
  tier: UserTier;
  status: UserStatus;
  kycStatus: UserKycStatus;
  preferredLanguage: UserLanguage;
  hasOpenAmlFlag: boolean;
  linkedCardsCount: number;
  lifetimeVolumeUzsTiyins: bigint;
  lifetimeTransferCount: number;
  lastLoginAt: Date | null;
  createdAt: Date;
}

// =====================================================================
// MyID response — canonical wire shape (snake_case to match the API).
// Populated only when the user has passed MyID at least once.
// =====================================================================

export interface MyIdResponse {
  comparison_value: number;
  pass_data: string;
  job_id: string;
  profile: {
    common_data: {
      first_name: string;
      middle_name: string;
      last_name: string;
      first_name_en: string;
      last_name_en: string;
      pinfl: string;
      gender: string;
      birth_place: string;
      birth_country: string;
      birth_country_id: string;
      birth_country_id_cbu: string;
      birth_date: string;
      nationality: string;
      nationality_id: string;
      nationality_id_cbu: string;
      citizenship: string;
      citizenship_id: string;
      citizenship_id_cbu: string;
      sdk_hash: string;
      last_update_pass_data: string;
      last_update_address: string;
    };
    doc_data: {
      pass_data: string;
      issued_by: string;
      issued_by_id: string;
      issued_date: string;
      expiry_date: string;
      doc_type: string;
      doc_type_id: string;
      doc_type_id_cbu: string;
    };
    contacts: {
      phone: string;
      email: string;
    };
    address: {
      permanent_address: string;
      temporary_address: string | null;
      permanent_registration: {
        mfy: string;
        mfy_id: string;
        region: string;
        address: string;
        country: string;
        cadastre: string;
        district: string;
        region_id: string;
        country_id: string;
        district_id: string;
        region_id_cbu: string;
        country_id_cbu: string;
        district_id_cbu: string;
        registration_date: string;
      };
      temporary_registration: {
        mfy: string;
        mfy_id: string;
        region: string;
        address: string;
        cadastre: string;
        district: string;
        date_from: string;
        date_till: string;
        region_id: string;
        district_id: string;
        region_id_cbu: string;
        district_id_cbu: string;
      } | null;
    };
  };
  reuid: {
    expires_at: number;
    value: string;
  };
}

export interface UserKycHistoryEntry {
  id: string;
  userId: string;
  status: 'pending' | 'passed' | 'failed' | 'expired';
  documentType: 'passport' | 'id_card';
  documentNumber: string;
  submittedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
  failureReason?: string;
  resultingTier?: UserTier;
}

export interface UserRecipientEntry {
  id: string;
  userId: string;
  destination: 'alipay' | 'wechat';
  identifier: string;
  displayName: string;
  nickname?: string;
  isFavorite: boolean;
  lastUsedAt: Date;
  transferCount: number;
  createdAt: Date;
  isDeleted?: boolean;
}

export interface UserDeviceEntry {
  id: string;
  userId: string;
  deviceId: string; // hardware fingerprint, masked at render (last 6 visible)
  platform: 'ios' | 'android';
  appVersion: string;
  isTrusted: boolean;
  lastSeenAt: Date;
  createdAt: Date;
}

export interface UserLimitUsage {
  userId: string;
  dailyUsedTiyins: bigint;
  dailyLimitTiyins: bigint;
  monthlyUsedTiyins: bigint;
  monthlyLimitTiyins: bigint;
}

export interface MonthlyVolumeBucket {
  monthKey: string;
  monthLabel: string;
  volumeUzsTiyins: bigint;
}

export interface StatusBreakdownEntry {
  status: 'created' | 'processing' | 'completed' | 'failed' | 'reversed';
  count: number;
}

// =====================================================================
// User audit-log — module-level append-only store
// =====================================================================

export type UserAuditAction =
  | 'block'
  | 'unblock'
  | 'soft_delete'
  | 'reverify_kyc'
  | 'blacklist_phone'
  | 'reset_devices'
  | 'untrust_device'
  | 'generate_audit_report'
  | 'freeze_card'
  | 'unfreeze_card'
  | 'hard_delete_recipient';

export interface UserAuditEntry {
  id: string;
  userId: string;
  action: UserAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const userAudit: UserAuditEntry[] = [];
let userAuditSeq = 1;

export function appendUserAudit(
  entry: Omit<UserAuditEntry, 'id' | 'createdAt'>,
): UserAuditEntry {
  const e: UserAuditEntry = {
    ...entry,
    id: `uaud_${String(userAuditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  userAudit.push(e);
  return e;
}

export function getUserAuditForUser(userId: string): UserAuditEntry[] {
  return userAudit.filter((e) => e.userId === userId).slice().reverse();
}

export const USER_ADMIN_POOL = ADMIN_POOL;
export const CURRENT_USER_ADMIN = ADMIN_POOL[0];

// =====================================================================
// Deterministic time helpers
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}
function minsAgo(mins: number): Date {
  return new Date(NOW.getTime() - mins * 60 * 1000);
}
function inDays(days: number): Date {
  return new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);
}

// =====================================================================
// 50-user seed (manual, deterministic — no PRNG)
// =====================================================================

interface UserSeedRow {
  id: string;
  name: string;
  phone: string;
  pinfl: string | null;
  email?: string;
  tier: UserTier;
  status: UserStatus;
  kycStatus: UserKycStatus;
  lang: UserLanguage;
  hasOpenAml: boolean;
  cards: number;
  lifetimeUzs: bigint;
  txCount: number;
  lastLoginMin: number | null;
  createdDays: number;
}

const _SEED: UserSeedRow[] = [
  // ── DETAILED DEMO USER ─────────────────────────────────────────────
  // u_03 = Sardor Tursunov — fully populated for the detail page.
  { id: 'u_03', name: 'Sardor Tursunov',    phone: '+998 93 345 67 89', pinfl: '32109876502456', email: 'sardor.t@example.com', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 2_870_000_000n, txCount: 47, lastLoginMin: 45,    createdDays: 420 },

  // ── Aligned with mockTransfers SENDERS (u_01, u_02, u_04, u_05) ────
  { id: 'u_01', name: 'Olim Karimov',       phone: '+998 90 123 45 67', pinfl: '11122233301234', email: 'olim.k@example.com',   tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 9_180_500_000n, txCount: 142, lastLoginMin: 120,   createdDays: 510 },
  { id: 'u_02', name: 'Madina Yusupova',    phone: '+998 91 234 56 78', pinfl: '22233344407890', email: 'madina.y@example.com', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'ru', hasOpenAml: true,  cards: 2, lifetimeUzs: 5_421_300_000n, txCount: 89,  lastLoginMin: 8,     createdDays: 280 },
  { id: 'u_04', name: 'Aziza Rahimova',     phone: '+998 94 456 78 90', pinfl: '33344455509012', email: 'aziza.r@example.com',  tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 1_230_000_000n, txCount: 28,  lastLoginMin: 360,   createdDays: 95  },
  { id: 'u_05', name: 'Bekzod Nurmatov',    phone: '+998 95 567 89 01', pinfl: '44455566603456', email: 'bekzod.n@example.com', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs:   480_000_000n, txCount: 12,  lastLoginMin: 1440,  createdDays: 60  },

  // ── 45 more users — mixed tier/status/kyc/lang for filter testing ──
  { id: 'u_06', name: 'Diyora Azimova',     phone: '+998 97 678 90 12', pinfl: '55566677704567', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'ru', hasOpenAml: false, cards: 1, lifetimeUzs:   780_000_000n, txCount: 19,  lastLoginMin: 30,    createdDays: 240 },
  { id: 'u_07', name: 'Jasur Toshmatov',    phone: '+998 99 789 01 23', pinfl: '66677788805678', tier: 'tier_2', status: 'blocked', kycStatus: 'passed',  lang: 'uz', hasOpenAml: true,  cards: 0, lifetimeUzs: 4_120_000_000n, txCount: 67,  lastLoginMin: null,  createdDays: 380 },
  { id: 'u_08', name: 'Nilufar Saidova',    phone: '+998 90 890 12 34', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 720,   createdDays: 45  },
  { id: 'u_09', name: 'Rustam Mirzaev',     phone: '+998 91 901 23 45', pinfl: '88899900007890', tier: 'tier_2', status: 'active',  kycStatus: 'expired', lang: 'ru', hasOpenAml: false, cards: 1, lifetimeUzs: 3_010_000_000n, txCount: 54,  lastLoginMin: 4320,  createdDays: 410 },
  { id: 'u_10', name: 'Kamila Ismoilova',   phone: '+998 93 012 34 56', pinfl: '99900011108901', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'en', hasOpenAml: false, cards: 3, lifetimeUzs: 6_540_000_000n, txCount: 102, lastLoginMin: 90,    createdDays: 320 },

  { id: 'u_11', name: 'Akmal Hamidov',      phone: '+998 94 123 45 67', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 180,   createdDays: 30  },
  { id: 'u_12', name: 'Shahnoza Olimova',   phone: '+998 95 234 56 78', pinfl: null,             tier: 'tier_0', status: 'pending', kycStatus: 'pending', lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 60,    createdDays: 2   },
  { id: 'u_13', name: 'Davron Yuldashev',   phone: '+998 97 345 67 89', pinfl: '22233344421234', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: true,  cards: 2, lifetimeUzs: 7_890_000_000n, txCount: 156, lastLoginMin: 12,    createdDays: 290 },
  { id: 'u_14', name: 'Lola Karimbayeva',   phone: '+998 99 456 78 90', pinfl: '33344455532345', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'ru', hasOpenAml: false, cards: 2, lifetimeUzs: 2_100_000_000n, txCount: 38,  lastLoginMin: 240,   createdDays: 175 },
  { id: 'u_15', name: 'Otabek Sodikov',     phone: '+998 90 567 89 01', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 1080,  createdDays: 110 },

  { id: 'u_16', name: 'Sevara Bobomurodova',phone: '+998 91 678 90 12', pinfl: '55566677754567', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'en', hasOpenAml: false, cards: 1, lifetimeUzs: 1_640_000_000n, txCount: 42,  lastLoginMin: 5,     createdDays: 220 },
  { id: 'u_17', name: 'Ibrohim Umarov',     phone: '+998 93 789 01 23', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 480,   createdDays: 70  },
  { id: 'u_18', name: 'Zuhra Nazarova',     phone: '+998 94 890 12 34', pinfl: '77788899976789', tier: 'tier_2', status: 'blocked', kycStatus: 'passed',  lang: 'ru', hasOpenAml: true,  cards: 0, lifetimeUzs: 1_980_000_000n, txCount: 31,  lastLoginMin: null,  createdDays: 200 },
  { id: 'u_19', name: 'Farrukh Tojiboev',   phone: '+998 95 901 23 45', pinfl: '88899900087890', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 4_870_000_000n, txCount: 78,  lastLoginMin: 60,    createdDays: 305 },
  { id: 'u_20', name: 'Malika Tashpulatova',phone: '+998 97 012 34 56', pinfl: '99900011198901', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'en', hasOpenAml: false, cards: 2, lifetimeUzs: 3_540_000_000n, txCount: 61,  lastLoginMin: 200,   createdDays: 260 },

  { id: 'u_21', name: 'Sherzod Pulatov',    phone: '+998 99 123 45 67', pinfl: null,             tier: 'tier_0', status: 'pending', kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 1,     createdDays: 0   },
  { id: 'u_22', name: 'Gulnora Karimova',   phone: '+998 90 234 56 78', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'never',   lang: 'ru', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 240,   createdDays: 150 },
  { id: 'u_23', name: 'Anvar Saidaliev',    phone: '+998 91 345 67 89', pinfl: '22233344429876', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 5_780_000_000n, txCount: 91,  lastLoginMin: 25,    createdDays: 340 },
  { id: 'u_24', name: 'Dilfuza Mirsodikova',phone: '+998 93 456 78 90', pinfl: '33344455539876', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 1, lifetimeUzs:   980_000_000n, txCount: 22,  lastLoginMin: 720,   createdDays: 130 },
  { id: 'u_25', name: 'Zafar Akbarov',      phone: '+998 94 567 89 01', pinfl: '44455566649876', tier: 'tier_2', status: 'deleted', kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs:   210_000_000n, txCount: 6,   lastLoginMin: null,  createdDays: 480 },

  { id: 'u_26', name: 'Munira Rahimova',    phone: '+998 95 678 90 12', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 1440,  createdDays: 85  },
  { id: 'u_27', name: 'Bakhodir Sayfullaev',phone: '+998 97 789 01 23', pinfl: '66677788869876', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'ru', hasOpenAml: false, cards: 2, lifetimeUzs: 8_120_000_000n, txCount: 134, lastLoginMin: 18,    createdDays: 460 },
  { id: 'u_28', name: 'Kamola Mirzayeva',   phone: '+998 99 890 12 34', pinfl: '77788899979876', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'en', hasOpenAml: false, cards: 2, lifetimeUzs: 2_650_000_000n, txCount: 49,  lastLoginMin: 90,    createdDays: 215 },
  { id: 'u_29', name: 'Sanjar Rakhmatov',   phone: '+998 90 901 23 45', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'failed',  lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 7200,  createdDays: 35  },
  { id: 'u_30', name: 'Zarina Tursunova',   phone: '+998 91 012 34 56', pinfl: null,             tier: 'tier_0', status: 'pending', kycStatus: 'pending', lang: 'ru', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 5,     createdDays: 1   },

  { id: 'u_31', name: 'Mirzo Ibragimov',    phone: '+998 93 123 45 67', pinfl: '00011122218765', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 6_780_000_000n, txCount: 108, lastLoginMin: 35,    createdDays: 395 },
  { id: 'u_32', name: 'Saodat Yusupova',    phone: '+998 94 234 56 78', pinfl: null,             tier: 'tier_1', status: 'blocked', kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: null,  createdDays: 75  },
  { id: 'u_33', name: 'Habib Tashkentov',   phone: '+998 95 345 67 89', pinfl: '22233344438765', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 1, lifetimeUzs: 1_320_000_000n, txCount: 26,  lastLoginMin: 480,   createdDays: 165 },
  { id: 'u_34', name: 'Ozoda Habibullaeva', phone: '+998 97 456 78 90', pinfl: '33344455548765', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'ru', hasOpenAml: false, cards: 2, lifetimeUzs: 3_870_000_000n, txCount: 67,  lastLoginMin: 60,    createdDays: 270 },
  { id: 'u_35', name: 'Rashid Ergashev',    phone: '+998 99 567 89 01', pinfl: '44455566658765', tier: 'tier_2', status: 'deleted', kycStatus: 'expired', lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs:   620_000_000n, txCount: 14,  lastLoginMin: null,  createdDays: 540 },

  { id: 'u_36', name: 'Feruza Nasriddinova',phone: '+998 90 678 90 12', pinfl: '55566677768765', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'en', hasOpenAml: false, cards: 1, lifetimeUzs:   870_000_000n, txCount: 17,  lastLoginMin: 90,    createdDays: 145 },
  { id: 'u_37', name: 'Ulugʻbek Karimov',  phone: '+998 91 789 01 23', pinfl: '66677788878765', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 4_560_000_000n, txCount: 82,  lastLoginMin: 12,    createdDays: 310 },
  { id: 'u_38', name: 'Munisa Bekturdieva', phone: '+998 93 890 12 34', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 360,   createdDays: 55  },
  { id: 'u_39', name: 'Doniyor Holmatov',   phone: '+998 94 901 23 45', pinfl: '88899900098765', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 2_340_000_000n, txCount: 44,  lastLoginMin: 200,   createdDays: 235 },
  { id: 'u_40', name: 'Sitora Abdullaeva',  phone: '+998 95 012 34 56', pinfl: '99900011108765', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'ru', hasOpenAml: false, cards: 1, lifetimeUzs: 1_120_000_000n, txCount: 24,  lastLoginMin: 540,   createdDays: 190 },

  { id: 'u_41', name: 'Aziz Nurmuhamedov',  phone: '+998 97 123 45 67', pinfl: null,             tier: 'tier_0', status: 'pending', kycStatus: 'failed',  lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 30,    createdDays: 5   },
  { id: 'u_42', name: 'Robiya Ergasheva',   phone: '+998 99 234 56 78', pinfl: '11122233337654', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 2, lifetimeUzs: 5_450_000_000n, txCount: 96,  lastLoginMin: 5,     createdDays: 360 },
  { id: 'u_43', name: 'Komil Toshpulatov',  phone: '+998 90 345 67 89', pinfl: '22233344447654', tier: 'tier_1', status: 'active',  kycStatus: 'expired', lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs:   730_000_000n, txCount: 16,  lastLoginMin: 10080, createdDays: 405 },
  { id: 'u_44', name: 'Maftuna Yulchieva',  phone: '+998 91 456 78 90', pinfl: '33344455557654', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'en', hasOpenAml: false, cards: 1, lifetimeUzs: 2_980_000_000n, txCount: 57,  lastLoginMin: 75,    createdDays: 250 },
  { id: 'u_45', name: 'Nodir Allambergenov',phone: '+998 93 567 89 01', pinfl: '44455566667654', tier: 'tier_2', status: 'blocked', kycStatus: 'passed',  lang: 'uz', hasOpenAml: true,  cards: 0, lifetimeUzs: 3_210_000_000n, txCount: 53,  lastLoginMin: null,  createdDays: 290 },

  { id: 'u_46', name: 'Yulduz Saidkarimova',phone: '+998 94 678 90 12', pinfl: '55566677777654', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 1, lifetimeUzs:   460_000_000n, txCount: 13,  lastLoginMin: 120,   createdDays: 100 },
  { id: 'u_47', name: 'Erkin Bobokhonov',   phone: '+998 95 789 01 23', pinfl: '66677788887654', tier: 'tier_2', status: 'active',  kycStatus: 'passed',  lang: 'ru', hasOpenAml: false, cards: 2, lifetimeUzs: 4_120_000_000n, txCount: 71,  lastLoginMin: 45,    createdDays: 320 },
  { id: 'u_48', name: 'Sabina Tojiboeva',   phone: '+998 97 890 12 34', pinfl: null,             tier: 'tier_1', status: 'active',  kycStatus: 'never',   lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 600,   createdDays: 125 },
  { id: 'u_49', name: 'Shukhrat Ismatov',   phone: '+998 99 901 23 45', pinfl: '88899900007654', tier: 'tier_2', status: 'deleted', kycStatus: 'passed',  lang: 'uz', hasOpenAml: false, cards: 0, lifetimeUzs:   180_000_000n, txCount: 4,   lastLoginMin: null,  createdDays: 600 },
  { id: 'u_50', name: 'Mohinur Akromova',   phone: '+998 90 012 34 56', pinfl: null,             tier: 'tier_0', status: 'pending', kycStatus: 'pending', lang: 'ru', hasOpenAml: false, cards: 0, lifetimeUzs: 0n,             txCount: 0,   lastLoginMin: 15,    createdDays: 3   },
];

function _seedToRow(seed: UserSeedRow): UserListRow {
  // Lifetime volume + count are derived from real transfer records so the
  // user-detail "Recent activity" + Transfers tab + the lifetime KPI tiles
  // stay in sync. linkedCardsCount is similarly derived from mockCards so
  // the count matches the Cards tab and the cross-user Cards page.
  const txs = _userTransfers(seed.id);
  const completed = txs.filter((t) => t.status === 'completed');
  const lifetimeVolume = completed.reduce<bigint>(
    (sum, t) => sum + t.amountUzs,
    0n,
  );
  return {
    id: seed.id,
    name: seed.name,
    phone: seed.phone,
    pinfl: seed.pinfl,
    email: seed.email,
    tier: seed.tier,
    status: seed.status,
    kycStatus: seed.kycStatus,
    preferredLanguage: seed.lang,
    hasOpenAmlFlag: seed.hasOpenAml,
    linkedCardsCount: getCardsByUserId(seed.id).length,
    lifetimeVolumeUzsTiyins: lifetimeVolume,
    lifetimeTransferCount: txs.length,
    lastLoginAt: seed.lastLoginMin === null ? null : minsAgo(seed.lastLoginMin),
    createdAt: daysAgo(seed.createdDays),
  };
}

let liveUsers: UserListRow[] = _SEED.map(_seedToRow);

export function listUsers(): UserListRow[] {
  return liveUsers.slice();
}

export function getUserById(userId: string): UserListRow | undefined {
  return liveUsers.find((u) => u.id === userId);
}

// =====================================================================
// Per-user supporting data — KYC history, cards, recipients, devices,
// limit usage, monthly volume, status breakdown.
// Detailed for u_03 (Sardor); minimal/computed for others.
// =====================================================================

// ── KYC history ────────────────────────────────────────────────────────

const kycHistory: UserKycHistoryEntry[] = [
  // Sardor — passed 8mo ago, expires in 4mo
  {
    id: 'kyc_u03_01',
    userId: 'u_03',
    status: 'passed',
    documentType: 'id_card',
    documentNumber: 'IC4456778',
    submittedAt: daysAgo(243),
    verifiedAt: daysAgo(243),
    expiresAt: inDays(122),
    resultingTier: 'tier_2',
  },
  // Sardor — earlier failed attempt 11mo ago
  {
    id: 'kyc_u03_00',
    userId: 'u_03',
    status: 'failed',
    documentType: 'id_card',
    documentNumber: 'IC4456778',
    submittedAt: daysAgo(335),
    failureReason: 'Document quality below threshold',
  },
];

export function getUserKycHistory(userId: string): UserKycHistoryEntry[] {
  const list = kycHistory.filter((k) => k.userId === userId);
  if (list.length > 0) return list.slice().sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  // Synthesize from list-row state for non-detailed users
  const u = getUserById(userId);
  if (!u) return [];
  if (u.kycStatus === 'never') return [];
  // Synthesize a deterministic doc-number from the user.id seed (kyc_verifications
  // records the submitted document regardless of whether MyID populates users.pinfl).
  const seedNum = parseInt(userId.replace('u_', ''), 10);
  const docNumber = `IC${String(1000000 + (seedNum * 1217) % 9000000)}`;
  if (u.kycStatus === 'pending') {
    return [
      { id: `kyc_${userId}_p1`, userId, status: 'pending', documentType: 'id_card', documentNumber: docNumber, submittedAt: minsAgo(180) },
    ];
  }
  if (u.kycStatus === 'passed') {
    return [
      {
        id: `kyc_${userId}_p1`,
        userId,
        status: 'passed',
        documentType: 'id_card',
        documentNumber: docNumber,
        submittedAt: daysAgo(60),
        verifiedAt: daysAgo(60),
        expiresAt: inDays(305),
        resultingTier: u.tier,
      },
    ];
  }
  if (u.kycStatus === 'failed') {
    return [
      { id: `kyc_${userId}_f1`, userId, status: 'failed', documentType: 'id_card', documentNumber: docNumber, submittedAt: daysAgo(8), failureReason: 'Identity could not be verified' },
    ];
  }
  if (u.kycStatus === 'expired') {
    return [
      {
        id: `kyc_${userId}_x1`,
        userId,
        status: 'expired',
        documentType: 'id_card',
        documentNumber: docNumber,
        submittedAt: daysAgo(400),
        verifiedAt: daysAgo(400),
        expiresAt: daysAgo(35),
        resultingTier: u.tier,
      },
    ];
  }
  return [];
}

// ── MyID response (verified-user profile data) ─────────────────────────

const myidResponses: Record<string, MyIdResponse> = {
  u_03: {
    comparison_value: 0.96,
    pass_data: 'AB1234567',
    job_id: '550e8400-e29b-41d4-a716-446655440003',
    profile: {
      common_data: {
        first_name: 'Sardor',
        middle_name: 'Akmalovich',
        last_name: 'Tursunov',
        first_name_en: 'SARDOR',
        last_name_en: 'TURSUNOV',
        pinfl: '32109876502456',
        gender: 'male',
        birth_place: "Toshkent shahri, Mirzo Ulug'bek tumani",
        birth_country: "O'zbekiston Respublikasi",
        birth_country_id: 'UZ',
        birth_country_id_cbu: '860',
        birth_date: '1992-03-15',
        nationality: 'Uzbek',
        nationality_id: 'UZB',
        nationality_id_cbu: '860',
        citizenship: 'Uzbek',
        citizenship_id: 'UZB',
        citizenship_id_cbu: '860',
        sdk_hash: '7a9f3e1b8c2d4a6e5f8b1c9d0e2f4a6b8c0d2e4f',
        last_update_pass_data: '2025-08-15T09:14:00Z',
        last_update_address: '2024-01-22T14:30:00Z',
      },
      doc_data: {
        pass_data: 'AB1234567',
        issued_by: "Mirzo Ulug'bek IIB",
        issued_by_id: 'ATC-MUL-104',
        issued_date: '2018-06-12',
        expiry_date: '2028-06-12',
        doc_type: 'passport',
        doc_type_id: 'PASSPORT',
        doc_type_id_cbu: '21',
      },
      contacts: {
        phone: '+998 93 345 67 89',
        email: 'sardor.t@example.com',
      },
      address: {
        permanent_address:
          "Toshkent shahri, Mirzo Ulug'bek tumani, Buz-2 mahallasi, Sayilgoh ko'chasi, 12-uy, 38-xonadon",
        temporary_address: null,
        permanent_registration: {
          mfy: 'Buz-2 MFY',
          mfy_id: 'MFY-1009-0042',
          region: 'Toshkent shahri',
          address: "Sayilgoh ko'chasi, 12-uy, 38-xonadon",
          country: "O'zbekiston Respublikasi",
          cadastre: '10:09:0123:0456',
          district: "Mirzo Ulug'bek tumani",
          region_id: 'UZ-TK',
          country_id: 'UZ',
          district_id: 'UZ-TK-MUL',
          region_id_cbu: '27',
          country_id_cbu: '860',
          district_id_cbu: '2709',
          registration_date: '2010-09-01',
        },
        temporary_registration: null,
      },
    },
    reuid: {
      expires_at: Math.floor(NOW.getTime() / 1000) + 122 * 24 * 60 * 60,
      value: '9b7e597e-893e-4e11-92cf-f4e7d4f923b1',
    },
  },
};

export function getUserMyIdResponse(userId: string): MyIdResponse | null {
  const u = getUserById(userId);
  if (!u) return null;
  // MyID payload is only meaningful when KYC has actually completed once.
  if (u.kycStatus !== 'passed' && u.kycStatus !== 'expired') return null;
  if (!u.pinfl) return null;
  if (myidResponses[userId]) return myidResponses[userId];
  return synthesizeMyIdResponse(u);
}

function synthesizeMyIdResponse(u: UserListRow): MyIdResponse {
  const seedNum = parseInt(u.id.replace('u_', ''), 10);
  const docSeq = String(1000000 + (seedNum * 1217) % 9000000);
  const docNumber = `AB${docSeq}`;
  const [first, ...rest] = u.name.split(' ');
  const last = rest.join(' ');
  const isFemaleName = /a$/i.test(first) || first.endsWith('a');
  const birthYear = 1980 + (seedNum % 25);
  const birthDate = `${birthYear}-${String(((seedNum * 7) % 12) + 1).padStart(2, '0')}-${String(((seedNum * 11) % 28) + 1).padStart(2, '0')}`;
  const issuedYear = 2014 + (seedNum % 6);
  return {
    comparison_value: 0.9 + (seedNum % 9) / 100,
    pass_data: docNumber,
    job_id: `550e8400-e29b-41d4-a716-44665544${String(seedNum).padStart(4, '0')}`,
    profile: {
      common_data: {
        first_name: first,
        middle_name: '',
        last_name: last,
        first_name_en: first.toUpperCase(),
        last_name_en: last.toUpperCase(),
        pinfl: u.pinfl ?? '',
        gender: isFemaleName ? 'female' : 'male',
        birth_place: 'Toshkent shahri',
        birth_country: "O'zbekiston Respublikasi",
        birth_country_id: 'UZ',
        birth_country_id_cbu: '860',
        birth_date: birthDate,
        nationality: 'Uzbek',
        nationality_id: 'UZB',
        nationality_id_cbu: '860',
        citizenship: 'Uzbek',
        citizenship_id: 'UZB',
        citizenship_id_cbu: '860',
        sdk_hash: 'abc' + String(seedNum * 7919).padStart(8, '0'),
        last_update_pass_data: `${issuedYear}-06-12T09:00:00Z`,
        last_update_address: `${issuedYear + 1}-03-15T12:00:00Z`,
      },
      doc_data: {
        pass_data: docNumber,
        issued_by: 'IIB',
        issued_by_id: `ATC-${String(seedNum).padStart(3, '0')}`,
        issued_date: `${issuedYear}-06-12`,
        expiry_date: `${issuedYear + 10}-06-12`,
        doc_type: 'passport',
        doc_type_id: 'PASSPORT',
        doc_type_id_cbu: '21',
      },
      contacts: {
        phone: u.phone,
        email: u.email ?? '',
      },
      address: {
        permanent_address: "Toshkent shahri, Mirzo Ulug'bek tumani, Sayilgoh ko'chasi",
        temporary_address: null,
        permanent_registration: {
          mfy: 'MFY',
          mfy_id: `MFY-${String(seedNum).padStart(4, '0')}`,
          region: 'Toshkent shahri',
          address: "Sayilgoh ko'chasi",
          country: "O'zbekiston Respublikasi",
          cadastre: `10:09:${String(seedNum * 31).padStart(4, '0')}:${String(seedNum * 17).padStart(4, '0')}`,
          district: "Mirzo Ulug'bek tumani",
          region_id: 'UZ-TK',
          country_id: 'UZ',
          district_id: 'UZ-TK-MUL',
          region_id_cbu: '27',
          country_id_cbu: '860',
          district_id_cbu: '2709',
          registration_date: `${issuedYear - 4}-09-01`,
        },
        temporary_registration: null,
      },
    },
    reuid: {
      expires_at: Math.floor(NOW.getTime() / 1000) + 90 * 24 * 60 * 60,
      value: `${u.id}-${String(seedNum * 4099).padStart(8, '0')}`,
    },
  };
}

// ── Cards ──────────────────────────────────────────────────────────────
// Card data lives in `mockCards.ts` — single source of truth. This
// thin wrapper preserves the legacy `getUserCards` signature so existing
// callers (UserCardsTab) don't need to change.

export function getUserCards(userId: string): UserCardEntry[] {
  return getCardsByUserId(userId);
}

// ── Recipients ─────────────────────────────────────────────────────────

const liveRecipients: UserRecipientEntry[] = [
  {
    id: 'r_u03_01',
    userId: 'u_03',
    destination: 'alipay',
    identifier: '13800138000',
    displayName: 'Wang Lei',
    nickname: 'Brother',
    isFavorite: true,
    lastUsedAt: minsAgo(120),
    transferCount: 31,
    createdAt: daysAgo(380),
  },
  {
    id: 'r_u03_02',
    userId: 'u_03',
    destination: 'alipay',
    identifier: 'wang.fei@example.com',
    displayName: 'Wang Fei',
    nickname: 'Supplier',
    isFavorite: false,
    lastUsedAt: daysAgo(8),
    transferCount: 16,
    createdAt: daysAgo(120),
  },
  {
    id: 'r_u01_01',
    userId: 'u_01',
    destination: 'alipay',
    identifier: '13900139000',
    displayName: 'Zhang Wei',
    isFavorite: true,
    lastUsedAt: minsAgo(180),
    transferCount: 67,
    createdAt: daysAgo(420),
  },
  {
    id: 'r_u02_01',
    userId: 'u_02',
    destination: 'wechat',
    identifier: 'liu_yang_88',
    displayName: 'Liu Yang',
    isFavorite: true,
    lastUsedAt: daysAgo(2),
    transferCount: 24,
    createdAt: daysAgo(180),
  },
];

export function getUserRecipients(userId: string): UserRecipientEntry[] {
  return liveRecipients.filter((r) => r.userId === userId && !r.isDeleted).slice();
}

// ── Devices ────────────────────────────────────────────────────────────

const liveDevices: UserDeviceEntry[] = [
  // Sardor — 2 trusted (1 iOS, 1 Android)
  {
    id: 'dev_u03_ios',
    userId: 'u_03',
    deviceId: 'A1B2C3D4E5F60xa1b2c3d4e5f6',
    platform: 'ios',
    appVersion: '17.4',
    isTrusted: true,
    lastSeenAt: minsAgo(45),
    createdAt: daysAgo(420),
  },
  {
    id: 'dev_u03_and',
    userId: 'u_03',
    deviceId: 'B7C8D9E0F1A2003456789abcde',
    platform: 'android',
    appVersion: '14.0',
    isTrusted: true,
    lastSeenAt: daysAgo(3),
    createdAt: daysAgo(180),
  },
];

const _PLATFORMS: Array<'ios' | 'android'> = ['ios', 'android'];
function _ensurePlaceholderDevices(userId: string): UserDeviceEntry[] {
  const existing = liveDevices.filter((d) => d.userId === userId);
  if (existing.length > 0) return existing;
  const u = getUserById(userId);
  if (!u || u.lastLoginAt === null) return [];
  const seedNum = parseInt(userId.replace('u_', ''), 10);
  const platform = _PLATFORMS[seedNum % 2];
  const appVer = platform === 'ios' ? '17.4' : '14.0';
  const dev: UserDeviceEntry = {
    id: `dev_${userId}_main`,
    userId,
    deviceId: `XYZ${String(seedNum).padStart(3, '0')}MAIN${seedNum * 73}device${seedNum * 41}`,
    platform,
    appVersion: appVer,
    isTrusted: u.tier !== 'tier_0',
    lastSeenAt: u.lastLoginAt,
    createdAt: u.createdAt,
  };
  liveDevices.push(dev);
  return [dev];
}

export function getUserDevices(userId: string): UserDeviceEntry[] {
  return _ensurePlaceholderDevices(userId).slice();
}

// ── Limit usage ────────────────────────────────────────────────────────

// MyID is the hard gate for transfers. tier_0 and tier_1 are both partial-
// registration states (no current passing MyID), so daily/monthly are 0n.
// Only tier_2 users with an active MyID verification can transact.
const _TIER_LIMITS_TIYINS: Record<UserTier, { daily: bigint; monthly: bigint }> = {
  tier_0: { daily: 0n, monthly: 0n },
  tier_1: { daily: 0n, monthly: 0n },
  tier_2: { daily: 5_000_000_000n, monthly: 20_000_000_000n },
};

export function getUserLimitUsage(userId: string): UserLimitUsage | null {
  const u = getUserById(userId);
  if (!u) return null;
  const limits = _TIER_LIMITS_TIYINS[u.tier];
  if (limits.daily === 0n) {
    return {
      userId,
      dailyUsedTiyins: 0n,
      dailyLimitTiyins: 0n,
      monthlyUsedTiyins: 0n,
      monthlyLimitTiyins: 0n,
    };
  }
  // Daily / monthly used are summed from real completed transfers within
  // each window so the LimitsCard matches the Transfers tab.
  const startOfToday = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  const startOfMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  let dailyUsed = 0n;
  let monthlyUsed = 0n;
  for (const tx of _userTransfers(userId)) {
    if (tx.status !== 'completed') continue;
    if (tx.createdAt.getTime() >= startOfToday.getTime()) dailyUsed += tx.amountUzs;
    if (tx.createdAt.getTime() >= startOfMonth.getTime()) monthlyUsed += tx.amountUzs;
  }
  return {
    userId,
    dailyUsedTiyins: dailyUsed > limits.daily ? limits.daily : dailyUsed,
    dailyLimitTiyins: limits.daily,
    monthlyUsedTiyins: monthlyUsed > limits.monthly ? limits.monthly : monthlyUsed,
    monthlyLimitTiyins: limits.monthly,
  };
}

// ── Monthly volume (12 buckets) ────────────────────────────────────────

const _MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getUserMonthlyVolume(userId: string): MonthlyVolumeBucket[] {
  // 12 buckets ending at current month, summed from real completed transfers.
  const buckets = new Map<string, bigint>();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(NOW.getFullYear(), NOW.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, 0n);
  }
  for (const tx of _userTransfers(userId)) {
    if (tx.status !== 'completed') continue;
    const key = `${tx.createdAt.getFullYear()}-${String(tx.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!buckets.has(key)) continue;
    buckets.set(key, (buckets.get(key) ?? 0n) + tx.amountUzs);
  }
  const out: MonthlyVolumeBucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(NOW.getFullYear(), NOW.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    out.push({
      monthKey: key,
      monthLabel: _MONTH_LABELS[date.getMonth()],
      volumeUzsTiyins: buckets.get(key) ?? 0n,
    });
  }
  return out;
}

// ── Status breakdown ───────────────────────────────────────────────────

export function getUserStatusBreakdown(userId: string): StatusBreakdownEntry[] {
  const counts: Record<StatusBreakdownEntry['status'], number> = {
    completed: 0,
    processing: 0,
    failed: 0,
    reversed: 0,
    created: 0,
  };
  for (const tx of _userTransfers(userId)) {
    counts[tx.status as StatusBreakdownEntry['status']] += 1;
  }
  return [
    { status: 'completed',  count: counts.completed },
    { status: 'processing', count: counts.processing },
    { status: 'failed',     count: counts.failed },
    { status: 'reversed',   count: counts.reversed },
    { status: 'created',    count: counts.created },
  ];
}

export function getUserSuccessRatePct(userId: string): number {
  const breakdown = getUserStatusBreakdown(userId);
  const total = breakdown.reduce((s, e) => s + e.count, 0);
  if (total === 0) return 0;
  const completed = breakdown.find((e) => e.status === 'completed')?.count ?? 0;
  return Math.round((completed / total) * 100);
}

// ── AML flags scoped to user ───────────────────────────────────────────

export function getUserOpenAmlFlagCount(userId: string): number {
  return getInitialAmlList().filter((r) => r.userId === userId && (r.status === 'open' || r.status === 'reviewing')).length;
}

// =====================================================================
// Mutators (admin actions) — write to userAudit, sync to AML where needed
// =====================================================================

export interface ActorContext {
  id: string;
  name: string;
}

export function blockUser(
  userId: string,
  reason: string,
  actor: ActorContext,
): { user: UserListRow | undefined; frozenCardIds: string[] } {
  const u = liveUsers.find((x) => x.id === userId);
  if (!u) return { user: undefined, frozenCardIds: [] };
  u.status = 'blocked';
  // Side effect: freeze all active linked cards via the canonical
  // mockCards mutator so the Cards page sees the same state.
  const frozen = freezeAllUserActiveCards(userId, reason, actor);
  const frozenCardIds = frozen.map((c) => c.id);
  // Cross-store sync with AML
  blockAmlUser(userId);
  appendUserAudit({
    userId,
    action: 'block',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { frozenCardIds },
  });
  liveUsers = liveUsers.slice();
  return { user: u, frozenCardIds };
}

export function unblockUser(
  userId: string,
  reason: string,
  actor: ActorContext,
): UserListRow | undefined {
  const u = liveUsers.find((x) => x.id === userId);
  if (!u) return undefined;
  u.status = 'active';
  // Cards stay frozen — admin must unfreeze individually
  appendUserAudit({
    userId,
    action: 'unblock',
    actorId: actor.id,
    actorName: actor.name,
    reason,
  });
  liveUsers = liveUsers.slice();
  return u;
}

export function softDeleteUser(
  userId: string,
  reason: string,
  actor: ActorContext,
): UserListRow | undefined {
  const u = liveUsers.find((x) => x.id === userId);
  if (!u) return undefined;
  u.status = 'deleted';
  appendUserAudit({
    userId,
    action: 'soft_delete',
    actorId: actor.id,
    actorName: actor.name,
    reason,
  });
  liveUsers = liveUsers.slice();
  return u;
}

export function recordReverifyKyc(
  userId: string,
  reason: string,
  actor: ActorContext,
): UserAuditEntry | null {
  const u = liveUsers.find((x) => x.id === userId);
  if (!u) return null;
  return appendUserAudit({
    userId,
    action: 'reverify_kyc',
    actorId: actor.id,
    actorName: actor.name,
    reason,
  });
}

export function recordBlacklistPhone(
  userId: string,
  reason: string,
  actor: ActorContext,
): UserAuditEntry | null {
  return appendUserAudit({
    userId,
    action: 'blacklist_phone',
    actorId: actor.id,
    actorName: actor.name,
    reason,
  });
}

export function resetDeviceTrust(
  userId: string,
  reason: string,
  actor: ActorContext,
): { count: number } {
  const devices = liveDevices.filter((d) => d.userId === userId);
  devices.forEach((d) => {
    d.isTrusted = false;
  });
  // Also ensure placeholder devices are materialized + reset
  _ensurePlaceholderDevices(userId).forEach((d) => {
    d.isTrusted = false;
  });
  appendUserAudit({
    userId,
    action: 'reset_devices',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { affectedDeviceCount: devices.length },
  });
  return { count: devices.length };
}

export function untrustDevice(
  userId: string,
  deviceId: string,
  reason: string,
  actor: ActorContext,
): UserDeviceEntry | undefined {
  const dev = liveDevices.find((d) => d.id === deviceId);
  if (!dev) return undefined;
  dev.isTrusted = false;
  appendUserAudit({
    userId,
    action: 'untrust_device',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { deviceId },
  });
  return dev;
}

export function freezeCard(
  userId: string,
  cardId: string,
  reason: string,
  actor: ActorContext,
): UserCardEntry | undefined {
  // Default severity for the user-detail-tab path is `user_request` since
  // the freeze originates from the per-user actions surface; the cards
  // page surfaces a richer severity dropdown.
  const card = cardsFreezeCard(cardId, reason, 'user_request', actor);
  if (!card) return undefined;
  appendUserAudit({
    userId,
    action: 'freeze_card',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { cardId, scheme: card.scheme, maskedPan: card.maskedPan },
  });
  return card;
}

export function unfreezeCard(
  userId: string,
  cardId: string,
  reason: string,
  actor: ActorContext,
): UserCardEntry | undefined {
  const card = cardsUnfreezeCard(cardId, reason, actor);
  if (!card) return undefined;
  appendUserAudit({
    userId,
    action: 'unfreeze_card',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { cardId, scheme: card.scheme, maskedPan: card.maskedPan },
  });
  return card;
}

export function hardDeleteRecipient(
  userId: string,
  recipientId: string,
  reason: string,
  actor: ActorContext,
): UserRecipientEntry | undefined {
  const r = liveRecipients.find((x) => x.id === recipientId);
  if (!r) return undefined;
  r.isDeleted = true;
  appendUserAudit({
    userId,
    action: 'hard_delete_recipient',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { recipientId, destination: r.destination, identifier: r.identifier },
  });
  return r;
}

export function recordGenerateAuditReport(
  userId: string,
  reason: string,
  actor: ActorContext,
  range: { from: Date; to: Date },
): UserAuditEntry | null {
  return appendUserAudit({
    userId,
    action: 'generate_audit_report',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: { from: range.from.toISOString(), to: range.to.toISOString() },
  });
}

// =====================================================================
// Search helpers
// =====================================================================

export function searchUsers(query: string): UserListRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return listUsers();
  return listUsers().filter((u) => {
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.replace(/\s+/g, '').toLowerCase().includes(q.replace(/\s+/g, '')) ||
      (u.pinfl !== null && u.pinfl.includes(q)) ||
      (u.email !== undefined && u.email.toLowerCase().includes(q))
    );
  });
}
