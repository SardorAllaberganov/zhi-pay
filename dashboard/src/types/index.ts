// Aligned with docs/models.md — single source of truth for status enums.

export type TransferStatus =
  | 'created'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'reversed';

export type KycStatus = 'pending' | 'passed' | 'failed' | 'expired';

export type CardStatus = 'active' | 'frozen' | 'expired' | 'removed';

export type AmlFlagStatus = 'open' | 'reviewing' | 'cleared' | 'escalated';

export type AmlSeverity = 'info' | 'warning' | 'critical';

export type KycTier = 'tier_0' | 'tier_1' | 'tier_2';

export type CardScheme = 'uzcard' | 'humo' | 'visa' | 'mastercard';

export type Destination = 'alipay' | 'wechat';

export type Currency = 'UZS' | 'CNY' | 'USD';

export type Locale = 'en' | 'ru' | 'uz';

export type StatusDomain = 'transfer' | 'kyc' | 'card' | 'aml';

export type Tone =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'brand';

export type BlacklistType = 'phone' | 'pinfl' | 'device_id' | 'ip' | 'card_token';
export type BlacklistSeverity = 'suspected' | 'confirmed';

export type ServiceName =
  | 'alipay'
  | 'wechat'
  | 'uzcard'
  | 'humo'
  | 'visa'
  | 'mastercard'
  | 'myid';

export type ServiceStatus = 'active' | 'maintenance' | 'disabled';

export type ServiceHealth = 'green' | 'amber' | 'red';

export type EventActor = 'system' | 'user' | 'provider' | 'admin';

export interface TransferEvent {
  id: string;
  transferId: string;
  fromStatus: TransferStatus | null;
  toStatus: TransferStatus;
  actor: EventActor;
  context?: Record<string, unknown>;
  failureCode?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  phone: string;
  fullName: string;
  pinflLast4: string;
  kycTier: KycTier;
  status: 'active' | 'blocked' | 'pending' | 'deleted';
  preferredLanguage: Locale;
  createdAt: Date;
}

export interface Transfer {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  cardId: string;
  cardScheme: CardScheme;
  cardMaskedPan: string;
  cardBank: string;
  recipientIdentifier: string;
  destination: Destination;
  amountUzs: bigint;
  amountCny: bigint;
  feeUzs: bigint;
  fxSpreadUzs: bigint;
  totalChargeUzs: bigint;
  clientRate: number;
  status: TransferStatus;
  failureCode?: string;
  externalTxId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Card {
  id: string;
  userId: string;
  scheme: CardScheme;
  maskedPan: string;
  bankName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  status: CardStatus;
  createdAt: Date;
}

export interface KycVerification {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  pinflLast4: string;
  resultingTier?: KycTier;
  status: KycStatus;
  documentType: 'passport' | 'id_card';
  failureReason?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface AmlFlag {
  id: string;
  userId: string;
  userName: string;
  transferId?: string;
  flagType: 'velocity' | 'amount' | 'pattern' | 'sanctions' | 'manual';
  severity: AmlSeverity;
  description: string;
  status: AmlFlagStatus;
  assignedTo?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface FxRate {
  id: string;
  pair: 'UZS_CNY';
  midRate: number;
  spreadPct: number;
  clientRate: number;
  source: string;
  validFrom: Date;
  validTo: Date;
}

export interface CommissionRule {
  id: string;
  accountType: 'personal' | 'corporate';
  minPct: number;
  maxPct: number;
  minFeeUzs: bigint;
  isActive: boolean;
  version: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface Service {
  id: string;
  name: ServiceName;
  status: ServiceStatus;
  health: ServiceHealth;
  latencyMs: number;
  lastCheckedAt: Date;
  /** Optional short status label rendered next to the dot ("Maintenance", "Elevated latency"). */
  note?: string;
}

export interface ErrorCode {
  code: string;
  category: 'kyc' | 'acquiring' | 'fx' | 'provider' | 'compliance' | 'system';
  messageEn: string;
  messageRu: string;
  messageUz: string;
  retryable: boolean;
  suggestedAction: string;
}
