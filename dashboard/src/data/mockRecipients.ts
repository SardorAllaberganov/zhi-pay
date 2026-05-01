/**
 * Recipients mock dataset — 60 saved recipients across 30 distinct
 * owners for /customers/recipients.
 *
 * Single source of truth for saved-recipient data:
 *   - The Recipients list page (/customers/recipients) reads `listRecipients()`.
 *   - The user-detail Recipients tab re-exports `getRecipientsByUserId`
 *     via mockUsers (thin wrapper, mirrors the mockCards refactor).
 *   - Recipient IDs `r_u03_01` / `r_u03_02` / `r_u01_01` / `r_u02_01`
 *     are preserved from the previous mockUsers seed so any in-flight
 *     deep-links resolve.
 *
 * Destinations: 36 alipay (60%) / 24 wechat (40%).
 * Favorites: 12 favorited / 48 non-favorited per spec.
 *
 * `transferCount` and `totalVolumeUzsTiyins` are stored as denormalized
 * aggregates. For users in mockTransfers' SENDERS pool (u_01..u_05) the
 * values approximate the real transfer history; for the other 25 users
 * the values reflect the long-tail distribution called out in the spec
 * (mostly 1–3 transfers, a few "Mom"-class recipients with 30+).
 *
 * The detail page's "Last 5 transfers" mini-list filters TRANSFERS_FULL
 * by (userId, identifier, destination) tuple — for SENDER users this
 * populates from real records; for non-SENDER users the list shows an
 * empty-state, which is correct because those users have no transfer
 * mock data today.
 *
 * Schema: matches `docs/models.md` §4.1 RECIPIENTS exactly. No backend
 * change needed for this surface.
 */

import { TRANSFERS_FULL } from './mockTransfers';
import type { Transfer } from '@/types';

export type RecipientDestination = 'alipay' | 'wechat';

export interface RecipientEntry {
  id: string;
  userId: string;
  destination: RecipientDestination;
  identifier: string;
  displayName: string;
  /** User-saved label, optional. Latin or native-script. */
  nickname?: string;
  isFavorite: boolean;
  lastUsedAt: Date;
  /** Denormalized count — kept consistent with detail-page derivation. */
  transferCount: number;
  /** Denormalized aggregate of completed-transfer amounts (tiyins). */
  totalVolumeUzsTiyins: bigint;
  createdAt: Date;
  /** Soft-deletion flag — hard-delete sets this to true so audit history
   *  outlives the row removal. Excluded from `listRecipients()` output. */
  isDeleted?: boolean;
}

// =====================================================================
// Deterministic time helpers — must match mockUsers / mockCards / mockTransfers NOW
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');
function daysAgo(d: number): Date {
  return new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000);
}
function minsAgo(m: number): Date {
  return new Date(NOW.getTime() - m * 60 * 1000);
}
function hoursAgo(h: number): Date {
  return new Date(NOW.getTime() - h * 60 * 60 * 1000);
}

/** UZS major → tiyins. e.g. uzs(124_000_000) === 12_400_000_000n. */
function uzs(major: number): bigint {
  return BigInt(major) * 100n;
}

// =====================================================================
// 60-recipient seed (manual, deterministic — no PRNG)
//
// Distribution:
//   6 heavy owners × 3 recipients = 18
//   18 medium owners × 2 recipients = 36
//   6 light owners × 1 recipient   = 6
//   ───────────────────────────────  60 across 30 owners
//
// Display-name mix:
//   - Pinyin (Wang Lei, Zhang Wei) — most common for cross-border
//   - Chinese characters (张伟, 李娜, 王芳) — preserved unicode
//   - Latin where the recipient identifies that way
//
// Identifier mix:
//   - Alipay: CN mobile (13800138000) or Latin email
//   - WeChat: wxid_<name> only
// =====================================================================

const _SEED: RecipientEntry[] = [
  // ── u_03 Sardor Tursunov — heavy (3) ────────────────────────────────
  // Preserved IDs from the previous mockUsers seed.
  { id: 'r_u03_01', userId: 'u_03', destination: 'alipay', identifier: '13800138000',          displayName: 'Wang Lei',     nickname: 'Brother',          isFavorite: true,  lastUsedAt: minsAgo(120),  transferCount: 31, totalVolumeUzsTiyins: uzs(124_000_000), createdAt: daysAgo(380) },
  { id: 'r_u03_02', userId: 'u_03', destination: 'alipay', identifier: 'wang.fei@example.com', displayName: 'Wang Fei',     nickname: 'Yiwu supplier',    isFavorite: false, lastUsedAt: daysAgo(8),    transferCount: 16, totalVolumeUzsTiyins: uzs(92_500_000),  createdAt: daysAgo(120) },
  { id: 'r_u03_03', userId: 'u_03', destination: 'wechat', identifier: 'wxid_li_ming',         displayName: 'Li Ming',                                    isFavorite: false, lastUsedAt: daysAgo(22),   transferCount: 5,  totalVolumeUzsTiyins: uzs(18_400_000),  createdAt: daysAgo(75)  },

  // ── u_01 Olim Karimov — heavy (3) ───────────────────────────────────
  { id: 'r_u01_01', userId: 'u_01', destination: 'alipay', identifier: '13900139000',          displayName: 'Zhang Wei',                                  isFavorite: true,  lastUsedAt: minsAgo(180),  transferCount: 67, totalVolumeUzsTiyins: uzs(280_000_000), createdAt: daysAgo(420) },
  { id: 'r_u01_02', userId: 'u_01', destination: 'wechat', identifier: 'wxid_chen_yu',         displayName: 'Chen Yu',      nickname: 'Yiwu supplier',    isFavorite: false, lastUsedAt: hoursAgo(36),  transferCount: 22, totalVolumeUzsTiyins: uzs(88_300_000),  createdAt: daysAgo(260) },
  { id: 'r_u01_03', userId: 'u_01', destination: 'alipay', identifier: '15012345678',          displayName: '张伟',                                        isFavorite: false, lastUsedAt: daysAgo(14),   transferCount: 9,  totalVolumeUzsTiyins: uzs(36_700_000),  createdAt: daysAgo(140) },

  // ── u_13 Davron Yuldashev — heavy (3) ───────────────────────────────
  { id: 'r_u13_01', userId: 'u_13', destination: 'alipay', identifier: '13700137000',          displayName: 'Li Na',        nickname: 'Mom',              isFavorite: true,  lastUsedAt: hoursAgo(4),   transferCount: 38, totalVolumeUzsTiyins: uzs(152_000_000), createdAt: daysAgo(290) },
  { id: 'r_u13_02', userId: 'u_13', destination: 'wechat', identifier: 'wxid_wang_lei',        displayName: 'Wang Lei',                                   isFavorite: false, lastUsedAt: daysAgo(5),    transferCount: 14, totalVolumeUzsTiyins: uzs(56_200_000),  createdAt: daysAgo(180) },
  { id: 'r_u13_03', userId: 'u_13', destination: 'alipay', identifier: '18800188000',          displayName: 'Sun Jian',     nickname: 'Guangzhou hostel', isFavorite: false, lastUsedAt: daysAgo(11),   transferCount: 7,  totalVolumeUzsTiyins: uzs(28_400_000),  createdAt: daysAgo(95)  },

  // ── u_27 Bakhodir Sayfullaev — heavy (3) ────────────────────────────
  { id: 'r_u27_01', userId: 'u_27', destination: 'alipay', identifier: 'zhao.lei@example.com', displayName: 'Zhao Lei',     nickname: 'Cousin',           isFavorite: true,  lastUsedAt: hoursAgo(18),  transferCount: 24, totalVolumeUzsTiyins: uzs(96_500_000),  createdAt: daysAgo(310) },
  { id: 'r_u27_02', userId: 'u_27', destination: 'wechat', identifier: 'wxid_huang_min',       displayName: 'Huang Min',                                  isFavorite: false, lastUsedAt: daysAgo(7),    transferCount: 11, totalVolumeUzsTiyins: uzs(44_300_000),  createdAt: daysAgo(220) },
  { id: 'r_u27_03', userId: 'u_27', destination: 'alipay', identifier: '13600136000',          displayName: '黄敏',          nickname: 'Factory Liu',      isFavorite: false, lastUsedAt: daysAgo(18),   transferCount: 5,  totalVolumeUzsTiyins: uzs(22_100_000),  createdAt: daysAgo(85)  },

  // ── u_42 Robiya Ergasheva — heavy (3) ───────────────────────────────
  { id: 'r_u42_01', userId: 'u_42', destination: 'wechat', identifier: 'wxid_zhou_hai',        displayName: 'Zhou Hai',     nickname: 'Mom',              isFavorite: true,  lastUsedAt: minsAgo(45),   transferCount: 28, totalVolumeUzsTiyins: uzs(112_000_000), createdAt: daysAgo(340) },
  { id: 'r_u42_02', userId: 'u_42', destination: 'alipay', identifier: '13500135000',          displayName: '王芳',                                        isFavorite: false, lastUsedAt: daysAgo(3),    transferCount: 10, totalVolumeUzsTiyins: uzs(38_900_000),  createdAt: daysAgo(190) },
  { id: 'r_u42_03', userId: 'u_42', destination: 'alipay', identifier: '15123456789',          displayName: 'Liu Mei',                                    isFavorite: false, lastUsedAt: daysAgo(28),   transferCount: 4,  totalVolumeUzsTiyins: uzs(16_400_000),  createdAt: daysAgo(80)  },

  // ── u_31 Mirzo Ibragimov — heavy (3) ────────────────────────────────
  { id: 'r_u31_01', userId: 'u_31', destination: 'alipay', identifier: '13400134000',          displayName: 'Wang Fang',    nickname: 'Older brother',    isFavorite: true,  lastUsedAt: hoursAgo(12),  transferCount: 19, totalVolumeUzsTiyins: uzs(76_300_000),  createdAt: daysAgo(380) },
  { id: 'r_u31_02', userId: 'u_31', destination: 'wechat', identifier: 'wxid_xu_feng',         displayName: 'Xu Feng',                                    isFavorite: false, lastUsedAt: daysAgo(9),    transferCount: 8,  totalVolumeUzsTiyins: uzs(32_400_000),  createdAt: daysAgo(210) },
  { id: 'r_u31_03', userId: 'u_31', destination: 'alipay', identifier: 'zhang.min@example.com',displayName: 'Zhang Min',                                  isFavorite: false, lastUsedAt: daysAgo(45),   transferCount: 3,  totalVolumeUzsTiyins: uzs(12_500_000),  createdAt: daysAgo(110) },

  // ── u_02 Madina Yusupova — medium (2) ───────────────────────────────
  { id: 'r_u02_01', userId: 'u_02', destination: 'wechat', identifier: 'liu_yang_88',          displayName: 'Liu Yang',                                   isFavorite: true,  lastUsedAt: daysAgo(2),    transferCount: 24, totalVolumeUzsTiyins: uzs(96_000_000),  createdAt: daysAgo(180) },
  { id: 'r_u02_02', userId: 'u_02', destination: 'alipay', identifier: '18811881888',          displayName: '李娜',          nickname: 'Yiwu hostel',     isFavorite: false, lastUsedAt: daysAgo(6),    transferCount: 8,  totalVolumeUzsTiyins: uzs(32_100_000),  createdAt: daysAgo(95)  },

  // ── u_04 Aziza Rahimova — medium (2) ────────────────────────────────
  { id: 'r_u04_01', userId: 'u_04', destination: 'wechat', identifier: 'wxid_liu_yang',        displayName: 'Liu Yang',                                   isFavorite: true,  lastUsedAt: daysAgo(3),    transferCount: 7,  totalVolumeUzsTiyins: uzs(28_400_000),  createdAt: daysAgo(75)  },
  { id: 'r_u04_02', userId: 'u_04', destination: 'wechat', identifier: 'wxid_zhao_lei',        displayName: 'Zhao Lei',                                   isFavorite: false, lastUsedAt: daysAgo(20),   transferCount: 4,  totalVolumeUzsTiyins: uzs(16_200_000),  createdAt: daysAgo(50)  },

  // ── u_05 Bekzod Nurmatov — medium (2) ───────────────────────────────
  { id: 'r_u05_01', userId: 'u_05', destination: 'alipay', identifier: '13200132000',          displayName: 'Chen Hua',                                   isFavorite: true,  lastUsedAt: daysAgo(1),    transferCount: 5,  totalVolumeUzsTiyins: uzs(20_500_000),  createdAt: daysAgo(55)  },
  { id: 'r_u05_02', userId: 'u_05', destination: 'wechat', identifier: 'wxid_sun_jian',        displayName: 'Sun Jian',                                   isFavorite: false, lastUsedAt: daysAgo(35),   transferCount: 2,  totalVolumeUzsTiyins: uzs(8_100_000),   createdAt: daysAgo(40)  },

  // ── u_06 Diyora Azimova — medium (2) ────────────────────────────────
  { id: 'r_u06_01', userId: 'u_06', destination: 'alipay', identifier: '13100131000',          displayName: 'Zhao Min',                                   isFavorite: false, lastUsedAt: daysAgo(4),    transferCount: 6,  totalVolumeUzsTiyins: uzs(24_300_000),  createdAt: daysAgo(180) },
  { id: 'r_u06_02', userId: 'u_06', destination: 'alipay', identifier: '13000130000',          displayName: 'Wang Hong',    nickname: 'Aunt',             isFavorite: false, lastUsedAt: daysAgo(15),   transferCount: 3,  totalVolumeUzsTiyins: uzs(12_100_000),  createdAt: daysAgo(120) },

  // ── u_10 Kamila Ismoilova — medium (2) ──────────────────────────────
  { id: 'r_u10_01', userId: 'u_10', destination: 'wechat', identifier: 'wxid_ma_li',           displayName: 'Ma Li',        nickname: 'Cousin',           isFavorite: false, lastUsedAt: hoursAgo(6),   transferCount: 12, totalVolumeUzsTiyins: uzs(48_300_000),  createdAt: daysAgo(265) },
  { id: 'r_u10_02', userId: 'u_10', destination: 'alipay', identifier: '18988889999',          displayName: '张敏',                                        isFavorite: false, lastUsedAt: daysAgo(13),   transferCount: 4,  totalVolumeUzsTiyins: uzs(16_500_000),  createdAt: daysAgo(140) },

  // ── u_14 Lola Karimbayeva — medium (2) ──────────────────────────────
  { id: 'r_u14_01', userId: 'u_14', destination: 'alipay', identifier: '18712345678',          displayName: 'Liu Hua',                                    isFavorite: false, lastUsedAt: daysAgo(7),    transferCount: 5,  totalVolumeUzsTiyins: uzs(20_700_000),  createdAt: daysAgo(155) },
  { id: 'r_u14_02', userId: 'u_14', destination: 'wechat', identifier: 'wxid_zhu_jun',         displayName: 'Zhu Jun',                                    isFavorite: false, lastUsedAt: daysAgo(40),   transferCount: 2,  totalVolumeUzsTiyins: uzs(8_400_000),   createdAt: daysAgo(80)  },

  // ── u_16 Sevara Bobomurodova — medium (2) ───────────────────────────
  { id: 'r_u16_01', userId: 'u_16', destination: 'alipay', identifier: '18923456789',          displayName: 'Zhou Mei',                                   isFavorite: false, lastUsedAt: daysAgo(2),    transferCount: 6,  totalVolumeUzsTiyins: uzs(24_100_000),  createdAt: daysAgo(195) },
  { id: 'r_u16_02', userId: 'u_16', destination: 'wechat', identifier: 'wxid_hu_bin',          displayName: 'Hu Bin',       nickname: 'Yiwu supplier',    isFavorite: false, lastUsedAt: daysAgo(11),   transferCount: 3,  totalVolumeUzsTiyins: uzs(12_500_000),  createdAt: daysAgo(120) },

  // ── u_19 Farrukh Tojiboev — medium (2) ──────────────────────────────
  { id: 'r_u19_01', userId: 'u_19', destination: 'alipay', identifier: '15234567890',          displayName: 'Wang Yu',                                    isFavorite: false, lastUsedAt: hoursAgo(20),  transferCount: 8,  totalVolumeUzsTiyins: uzs(32_300_000),  createdAt: daysAgo(280) },
  { id: 'r_u19_02', userId: 'u_19', destination: 'alipay', identifier: 'xu.feng@example.com',  displayName: 'Xu Feng',      nickname: 'Factory',          isFavorite: false, lastUsedAt: daysAgo(38),   transferCount: 2,  totalVolumeUzsTiyins: uzs(8_700_000),   createdAt: daysAgo(110) },

  // ── u_20 Malika Tashpulatova — medium (2) ───────────────────────────
  { id: 'r_u20_01', userId: 'u_20', destination: 'wechat', identifier: 'wxid_zhao_lei',        displayName: 'Zhao Lei',                                   isFavorite: false, lastUsedAt: daysAgo(9),    transferCount: 4,  totalVolumeUzsTiyins: uzs(16_100_000),  createdAt: daysAgo(225) },
  { id: 'r_u20_02', userId: 'u_20', destination: 'wechat', identifier: 'wxid_guo_qiang',       displayName: 'Guo Qiang',                                  isFavorite: false, lastUsedAt: daysAgo(60),   transferCount: 1,  totalVolumeUzsTiyins: uzs(4_200_000),   createdAt: daysAgo(60)  },

  // ── u_23 Anvar Saidaliev — medium (2) ───────────────────────────────
  { id: 'r_u23_01', userId: 'u_23', destination: 'alipay', identifier: '15456789012',          displayName: 'He Jing',      nickname: 'Cousin',           isFavorite: false, lastUsedAt: daysAgo(5),    transferCount: 7,  totalVolumeUzsTiyins: uzs(28_300_000),  createdAt: daysAgo(305) },
  { id: 'r_u23_02', userId: 'u_23', destination: 'wechat', identifier: 'wxid_he_jing',         displayName: '何静',                                        isFavorite: false, lastUsedAt: daysAgo(33),   transferCount: 2,  totalVolumeUzsTiyins: uzs(8_500_000),   createdAt: daysAgo(140) },

  // ── u_28 Kamola Mirzayeva — medium (2) ──────────────────────────────
  { id: 'r_u28_01', userId: 'u_28', destination: 'wechat', identifier: 'wxid_lin_tao',         displayName: 'Lin Tao',                                    isFavorite: false, lastUsedAt: daysAgo(8),    transferCount: 3,  totalVolumeUzsTiyins: uzs(12_400_000),  createdAt: daysAgo(195) },
  { id: 'r_u28_02', userId: 'u_28', destination: 'alipay', identifier: 'lin.tao@example.com',  displayName: 'Lin Tao',      nickname: 'Friend',           isFavorite: false, lastUsedAt: daysAgo(50),   transferCount: 1,  totalVolumeUzsTiyins: uzs(4_300_000),   createdAt: daysAgo(95)  },

  // ── u_34 Ozoda Habibullaeva — medium (2) ────────────────────────────
  { id: 'r_u34_01', userId: 'u_34', destination: 'alipay', identifier: '13800138001',          displayName: 'Wang Min',                                   isFavorite: true,  lastUsedAt: hoursAgo(8),   transferCount: 9,  totalVolumeUzsTiyins: uzs(36_400_000),  createdAt: daysAgo(245) },
  { id: 'r_u34_02', userId: 'u_34', destination: 'wechat', identifier: 'wxid_song_ying',       displayName: 'Song Ying',                                  isFavorite: false, lastUsedAt: daysAgo(28),   transferCount: 2,  totalVolumeUzsTiyins: uzs(8_200_000),   createdAt: daysAgo(135) },

  // ── u_37 Ulug'bek Karimov — medium (2) ──────────────────────────────
  { id: 'r_u37_01', userId: 'u_37', destination: 'alipay', identifier: '13700137001',          displayName: 'Sun Jia',                                    isFavorite: false, lastUsedAt: daysAgo(4),    transferCount: 6,  totalVolumeUzsTiyins: uzs(24_400_000),  createdAt: daysAgo(290) },
  { id: 'r_u37_02', userId: 'u_37', destination: 'alipay', identifier: '18811881889',          displayName: 'Tang Yun',     nickname: 'Mom',              isFavorite: true,  lastUsedAt: hoursAgo(30),  transferCount: 14, totalVolumeUzsTiyins: uzs(56_300_000),  createdAt: daysAgo(310) },

  // ── u_39 Doniyor Holmatov — medium (2) ──────────────────────────────
  { id: 'r_u39_01', userId: 'u_39', destination: 'wechat', identifier: 'wxid_tang_yun',        displayName: 'Tang Yun',                                   isFavorite: false, lastUsedAt: daysAgo(10),   transferCount: 3,  totalVolumeUzsTiyins: uzs(12_300_000),  createdAt: daysAgo(220) },
  { id: 'r_u39_02', userId: 'u_39', destination: 'alipay', identifier: '13600136001',          displayName: '王伟',                                        isFavorite: false, lastUsedAt: daysAgo(75),   transferCount: 1,  totalVolumeUzsTiyins: uzs(4_100_000),   createdAt: daysAgo(105) },

  // ── u_44 Maftuna Yulchieva — medium (2) ─────────────────────────────
  { id: 'r_u44_01', userId: 'u_44', destination: 'alipay', identifier: '13500135001',          displayName: 'Wu Dan',                                     isFavorite: false, lastUsedAt: daysAgo(6),    transferCount: 4,  totalVolumeUzsTiyins: uzs(16_300_000),  createdAt: daysAgo(235) },
  { id: 'r_u44_02', userId: 'u_44', destination: 'wechat', identifier: 'wxid_wu_dan',          displayName: 'Wu Dan',       nickname: 'Sister',           isFavorite: false, lastUsedAt: daysAgo(22),   transferCount: 2,  totalVolumeUzsTiyins: uzs(8_500_000),   createdAt: daysAgo(140) },

  // ── u_47 Erkin Bobokhonov — medium (2) ──────────────────────────────
  { id: 'r_u47_01', userId: 'u_47', destination: 'alipay', identifier: '13400134001',          displayName: 'Gao Kai',      nickname: 'Restaurant',       isFavorite: false, lastUsedAt: hoursAgo(10),  transferCount: 8,  totalVolumeUzsTiyins: uzs(32_400_000),  createdAt: daysAgo(305) },
  { id: 'r_u47_02', userId: 'u_47', destination: 'wechat', identifier: 'wxid_gao_kai',         displayName: 'Gao Kai',                                    isFavorite: false, lastUsedAt: daysAgo(17),   transferCount: 3,  totalVolumeUzsTiyins: uzs(12_200_000),  createdAt: daysAgo(180) },

  // ── u_07 Jasur Toshmatov (blocked) — medium (2), historic ───────────
  { id: 'r_u07_01', userId: 'u_07', destination: 'alipay', identifier: '13300133001',          displayName: 'Yu Bing',                                    isFavorite: false, lastUsedAt: daysAgo(86),   transferCount: 5,  totalVolumeUzsTiyins: uzs(20_100_000),  createdAt: daysAgo(360) },
  { id: 'r_u07_02', userId: 'u_07', destination: 'wechat', identifier: 'wxid_zhang_wei',       displayName: 'Zhang Wei',                                  isFavorite: false, lastUsedAt: daysAgo(120),  transferCount: 1,  totalVolumeUzsTiyins: uzs(4_200_000),   createdAt: daysAgo(280) },

  // ── u_18 Zuhra Nazarova (blocked) — medium (2), historic ────────────
  { id: 'r_u18_01', userId: 'u_18', destination: 'wechat', identifier: 'wxid_li_ming',         displayName: 'Li Ming',      nickname: 'Mom',              isFavorite: false, lastUsedAt: daysAgo(95),   transferCount: 7,  totalVolumeUzsTiyins: uzs(28_300_000),  createdAt: daysAgo(190) },
  { id: 'r_u18_02', userId: 'u_18', destination: 'alipay', identifier: '13200132001',          displayName: 'Hu Bing',                                    isFavorite: false, lastUsedAt: daysAgo(180),  transferCount: 1,  totalVolumeUzsTiyins: uzs(4_400_000),   createdAt: daysAgo(180) },

  // ── u_24 Dilfuza Mirsodikova — light (1) ────────────────────────────
  { id: 'r_u24_01', userId: 'u_24', destination: 'alipay', identifier: '13100131001',          displayName: 'Wei Hong',                                   isFavorite: false, lastUsedAt: daysAgo(31),   transferCount: 2,  totalVolumeUzsTiyins: uzs(8_300_000),   createdAt: daysAgo(125) },

  // ── u_33 Habib Tashkentov — light (1) ───────────────────────────────
  { id: 'r_u33_01', userId: 'u_33', destination: 'alipay', identifier: 'zheng.tao@example.com',displayName: 'Zheng Tao',    nickname: 'Yiwu',             isFavorite: false, lastUsedAt: daysAgo(14),   transferCount: 3,  totalVolumeUzsTiyins: uzs(12_400_000),  createdAt: daysAgo(160) },

  // ── u_36 Feruza Nasriddinova — light (1) ────────────────────────────
  { id: 'r_u36_01', userId: 'u_36', destination: 'wechat', identifier: 'wxid_chen_yu',         displayName: 'Chen Yu',                                    isFavorite: false, lastUsedAt: daysAgo(45),   transferCount: 1,  totalVolumeUzsTiyins: uzs(4_500_000),   createdAt: daysAgo(140) },

  // ── u_40 Sitora Abdullaeva — light (1) ──────────────────────────────
  { id: 'r_u40_01', userId: 'u_40', destination: 'alipay', identifier: '13000130001',          displayName: 'Lu Wei',                                     isFavorite: false, lastUsedAt: daysAgo(72),   transferCount: 1,  totalVolumeUzsTiyins: uzs(4_100_000),   createdAt: daysAgo(180) },

  // ── u_46 Yulduz Saidkarimova — light (1) ────────────────────────────
  { id: 'r_u46_01', userId: 'u_46', destination: 'alipay', identifier: '13800138002',          displayName: 'Pan Mei',                                    isFavorite: false, lastUsedAt: daysAgo(50),   transferCount: 1,  totalVolumeUzsTiyins: uzs(4_300_000),   createdAt: daysAgo(95)  },

  // ── u_09 Rustam Mirzaev (kyc=expired) — light (1), favorite ─────────
  { id: 'r_u09_01', userId: 'u_09', destination: 'alipay', identifier: '13900139001',          displayName: 'Zhao Lin',     nickname: 'Mom',              isFavorite: true,  lastUsedAt: daysAgo(85),   transferCount: 19, totalVolumeUzsTiyins: uzs(76_500_000),  createdAt: daysAgo(395) },
];

let liveRecipients: RecipientEntry[] = _SEED.slice();

// =====================================================================
// Public read API
// =====================================================================

export function listRecipients(): RecipientEntry[] {
  return liveRecipients.filter((r) => !r.isDeleted).slice();
}

export function getRecipientById(id: string): RecipientEntry | undefined {
  return liveRecipients.find((r) => r.id === id && !r.isDeleted);
}

export function getRecipientsByUserId(userId: string): RecipientEntry[] {
  return liveRecipients
    .filter((r) => r.userId === userId && !r.isDeleted)
    .slice();
}

/** Top-of-page subtitle counts: total recipients + distinct owners. */
export function getRecipientCounts(): { total: number; distinctOwners: number } {
  const live = listRecipients();
  const owners = new Set<string>();
  for (const r of live) owners.add(r.userId);
  return { total: live.length, distinctOwners: owners.size };
}

/**
 * Real transfer history for a recipient — filters TRANSFERS_FULL by the
 * canonical (userId, identifier, destination) tuple. Used by the detail
 * page's Usage card "Last 5 transfers" mini-list. Returns transfers
 * sorted newest-first.
 *
 * For users in the SENDERS pool (u_01..u_05) this populates from real
 * mock records. For other users the list is empty — render an empty
 * state on the consumer side.
 */
export function getRecipientTransfers(recipient: RecipientEntry): Transfer[] {
  return TRANSFERS_FULL.filter(
    (tx) =>
      tx.userId === recipient.userId &&
      tx.destination === recipient.destination &&
      tx.recipientIdentifier === recipient.identifier,
  )
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// =====================================================================
// Audit log
// =====================================================================

export type RecipientAuditAction = 'hard_delete';

export interface RecipientAuditEntry {
  id: string;
  recipientId: string;
  userId: string;
  action: RecipientAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  context?: Record<string, unknown>;
  createdAt: Date;
}

const recipientAudit: RecipientAuditEntry[] = [];
let recipientAuditSeq = 1;

function appendRecipientAudit(
  entry: Omit<RecipientAuditEntry, 'id' | 'createdAt'>,
): RecipientAuditEntry {
  const e: RecipientAuditEntry = {
    ...entry,
    id: `raud_${String(recipientAuditSeq++).padStart(4, '0')}`,
    createdAt: new Date(),
  };
  recipientAudit.push(e);
  return e;
}

export function getRecipientAudit(recipientId: string): RecipientAuditEntry[] {
  return recipientAudit
    .filter((e) => e.recipientId === recipientId)
    .slice()
    .reverse();
}

// =====================================================================
// Mutators
// =====================================================================

export interface RecipientActor {
  id: string;
  name: string;
}

/**
 * Hard-delete is permanent — past transfers stay intact (the identifier
 * is denormalized on the transfer row per `docs/models.md` §4.1).
 *
 * Implementation note: the row stays in the array with `isDeleted=true`
 * so audit history (`getRecipientAudit`) and any cross-store reference
 * still resolves the row metadata. `listRecipients` /
 * `getRecipientsByUserId` / `getRecipientById` filter it out.
 */
export function hardDeleteRecipient(
  recipientId: string,
  reason: string,
  actor: RecipientActor,
): RecipientEntry | undefined {
  const r = liveRecipients.find((x) => x.id === recipientId);
  if (!r) return undefined;
  if (r.isDeleted) return r;
  r.isDeleted = true;
  appendRecipientAudit({
    recipientId,
    userId: r.userId,
    action: 'hard_delete',
    actorId: actor.id,
    actorName: actor.name,
    reason,
    context: {
      destination: r.destination,
      identifier: r.identifier,
      displayName: r.displayName,
    },
  });
  liveRecipients = liveRecipients.slice();
  return r;
}
