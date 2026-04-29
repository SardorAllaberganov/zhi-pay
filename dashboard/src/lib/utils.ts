import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import type {
  Currency,
  Locale,
  StatusDomain,
  Tone,
  TransferStatus,
  KycStatus,
  CardStatus,
  AmlFlagStatus,
} from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Money formatter — never accepts a float input.
 * Stores in minor units (tiyins for UZS, fen for CNY); divides by 100 at render.
 */
export function formatMoney(
  amountMinor: bigint | number,
  currency: Currency,
  locale: Locale = 'en',
): string {
  const minor = typeof amountMinor === 'bigint' ? amountMinor : BigInt(amountMinor);
  const negative = minor < 0n;
  const abs = negative ? -minor : minor;
  const major = Number(abs / 100n);
  const cents = Number(abs % 100n);
  const groupSep = locale === 'en' ? ',' : ' ';
  const decSep = locale === 'en' ? '.' : ',';
  const grouped = major
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
  const minorPart = cents.toString().padStart(2, '0');
  const sign = negative ? '−' : '';
  return `${sign}${grouped}${decSep}${minorPart} ${currency}`;
}

/**
 * Plain numeric formatter with locale-aware grouping.
 * For non-monetary values: FX rates, percentages, counts.
 * For money in minor units, use `formatMoney` instead.
 */
export function formatNumber(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Compact money formatter for KPI tiles (e.g. `2.84B UZS`, `847M UZS`).
 *
 * Reserved for AGGREGATE / dashboard summary rendering only — never use this
 * for transactional displays (send-money review, transfer detail, activity
 * row amounts), where the user must see the exact figure with full grouping
 * per `.claude/rules/money-and-fx.md`.
 */
export function formatMoneyCompact(
  amountMinor: bigint | number,
  currency: Currency,
): string {
  const minor = typeof amountMinor === 'bigint' ? amountMinor : BigInt(amountMinor);
  const negative = minor < 0n;
  const abs = negative ? -minor : minor;
  const major = Number(abs) / 100;
  const compact = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(major);
  const sign = negative ? '−' : '';
  return `${sign}${compact} ${currency}`;
}

/**
 * Date formatter — drives off locale, not device.
 */
export function formatDate(d: Date, locale: Locale = 'en'): string {
  if (locale === 'en') return format(d, 'MMM d, yyyy');
  return format(d, 'dd.MM.yyyy');
}

export function formatTime(d: Date, locale: Locale = 'en'): string {
  if (locale === 'en') return format(d, 'h:mm a');
  return format(d, 'HH:mm');
}

export function formatDateTime(d: Date, locale: Locale = 'en'): string {
  if (locale === 'en') return format(d, "MMM d, yyyy 'at' h:mm a");
  return format(d, 'dd.MM.yyyy HH:mm');
}

/**
 * Relative for <24h, absolute after.
 */
export function formatRelative(d: Date, locale: Locale = 'en'): string {
  const ageMs = Date.now() - d.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (ageMs < oneDay) {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  return formatDateTime(d, locale);
}

/**
 * Privacy: never display full PINFL — show 10 dots + last 4.
 */
export function maskPinfl(pinfl: string): string {
  const last4 = pinfl.slice(-4);
  return `••••••••••${last4}`;
}

/**
 * PAN comes from backend already as first6+last4.
 * UI inserts dots/spacing for visual rhythm. Never reconstruct full PAN.
 */
export function maskPan(masked: string): string {
  const clean = masked.replace(/\s+/g, '');
  if (clean.length < 10) return clean;
  const first6 = clean.slice(0, 6);
  const last4 = clean.slice(-4);
  return `${first6.slice(0, 4)} ${first6.slice(4)}•• •••• ${last4}`;
}

export function maskDocNumber(doc: string): string {
  const last4 = doc.slice(-4);
  return `••••${last4}`;
}

/**
 * Single source of truth — status to tone mapping.
 * NEVER hardcode color logic per page; always go through this.
 */
export function statusToTone(
  status: string,
  domain: StatusDomain,
): Tone {
  if (domain === 'transfer') {
    const s = status as TransferStatus;
    if (s === 'created') return 'info';
    if (s === 'processing') return 'info';
    if (s === 'completed') return 'success';
    if (s === 'failed') return 'danger';
    if (s === 'reversed') return 'warning';
  }
  if (domain === 'kyc') {
    const s = status as KycStatus;
    if (s === 'pending') return 'info';
    if (s === 'passed') return 'success';
    if (s === 'failed') return 'danger';
    if (s === 'expired') return 'warning';
  }
  if (domain === 'card') {
    const s = status as CardStatus;
    if (s === 'active') return 'success';
    if (s === 'frozen') return 'warning';
    if (s === 'expired') return 'muted';
    if (s === 'removed') return 'muted';
  }
  if (domain === 'aml') {
    const s = status as AmlFlagStatus;
    if (s === 'open') return 'danger';
    if (s === 'reviewing') return 'warning';
    if (s === 'cleared') return 'success';
    if (s === 'escalated') return 'danger';
  }
  return 'muted';
}

/** Tailwind class fragments per tone. */
export function toneClasses(
  tone: Tone,
): { bg: string; text: string; dot: string; border: string } {
  switch (tone) {
    case 'success':
      return {
        bg: 'bg-success-50 dark:bg-success-700/15',
        text: 'text-success-700 dark:text-success-600',
        dot: 'bg-success-600',
        border: 'border-success-600/20',
      };
    case 'warning':
      return {
        bg: 'bg-warning-50 dark:bg-warning-700/15',
        text: 'text-warning-700 dark:text-warning-600',
        dot: 'bg-warning-600',
        border: 'border-warning-600/20',
      };
    case 'danger':
      return {
        bg: 'bg-danger-50 dark:bg-danger-700/15',
        text: 'text-danger-700 dark:text-danger-600',
        dot: 'bg-danger-600',
        border: 'border-danger-600/20',
      };
    case 'info':
      return {
        bg: 'bg-brand-50 dark:bg-brand-950/40',
        text: 'text-brand-700 dark:text-brand-300',
        dot: 'bg-brand-600',
        border: 'border-brand-600/20',
      };
    case 'brand':
      return {
        bg: 'bg-brand-600',
        text: 'text-white',
        dot: 'bg-brand-600',
        border: 'border-brand-600',
      };
    case 'muted':
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-300',
        dot: 'bg-slate-400',
        border: 'border-slate-300 dark:border-slate-700',
      };
  }
}

export function statusLabel(status: string, domain: StatusDomain): string {
  // English labels for v1; structured to be replaced by t() later.
  const labels: Record<string, string> = {
    'transfer.created': 'Created',
    'transfer.processing': 'Processing',
    'transfer.completed': 'Completed',
    'transfer.failed': 'Failed',
    'transfer.reversed': 'Reversed',
    'kyc.pending': 'Pending',
    'kyc.passed': 'Passed',
    'kyc.failed': 'Failed',
    'kyc.expired': 'Expired',
    'card.active': 'Active',
    'card.frozen': 'Frozen',
    'card.expired': 'Expired',
    'card.removed': 'Removed',
    'aml.open': 'Open',
    'aml.reviewing': 'Reviewing',
    'aml.cleared': 'Cleared',
    'aml.escalated': 'Escalated',
  };
  return labels[`${domain}.${status}`] ?? status;
}
