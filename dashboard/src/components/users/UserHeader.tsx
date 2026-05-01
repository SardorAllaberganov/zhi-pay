import { Link } from 'react-router-dom';
import { Phone, ChevronLeft } from 'lucide-react';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { UserAvatar } from './UserAvatar';
import { UserStatusBadge } from './UsersTable';
import { UserAdminMenu, type UserAdminAction } from './UserAdminMenu';
import { cn, formatDate, formatRelative, maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserListRow } from '@/data/mockUsers';

interface UserHeaderProps {
  user: UserListRow;
  kycExpiresAt?: Date;
  onAction: (action: UserAdminAction) => void;
}

export function UserHeader({ user, kycExpiresAt, onAction }: UserHeaderProps) {
  const phoneDigits = user.phone.replace(/[^\d]/g, '');
  const tgUrl = `https://t.me/+${phoneDigits}`;
  const waUrl = `https://wa.me/${phoneDigits}`;

  let kycExpiryChip: { label: string; tone: 'muted' | 'warning' | 'danger' } | null = null;
  if (kycExpiresAt) {
    const daysUntil = Math.floor((kycExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    if (daysUntil < 0) {
      kycExpiryChip = { label: t('admin.users.detail.chip.kyc-expired'), tone: 'danger' };
    } else if (daysUntil < 30) {
      kycExpiryChip = {
        label: t('admin.users.detail.chip.kyc-expires-in', { days: daysUntil }),
        tone: 'warning',
      };
    } else {
      kycExpiryChip = {
        label: t('admin.users.detail.chip.kyc-expires-on', { date: formatDate(kycExpiresAt) }),
        tone: 'muted',
      };
    }
  }

  return (
    <div>
      <div className="mb-2">
        <Link
          to="/customers/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t('admin.users.detail.back-to-list')}
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-row items-center gap-3 md:gap-4">
            <UserAvatar name={user.name} size="xl" />
            <div className="min-w-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
              {user.pinfl && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="text-xs uppercase tracking-wider font-medium">
                    {t('admin.users.pinfl-label')}
                  </span>
                  <span className="tabular font-mono">{maskPinfl(user.pinfl)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={`tel:${user.phone}`}
              className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-brand-700 transition-colors tabular"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {user.phone}
            </a>
            <a
              href={tgUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('admin.users.detail.contact.telegram')}
              title={t('admin.users.detail.contact.telegram')}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#229ED9] px-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1B8FC7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#229ED9] focus-visible:ring-offset-2 transition-colors"
            >
              <TelegramIcon className="h-3.5 w-3.5" />
              <span>{t('admin.users.detail.contact.telegram-label')}</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('admin.users.detail.contact.whatsapp')}
              title={t('admin.users.detail.contact.whatsapp')}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#25D366] px-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1FBA5C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 transition-colors"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              <span>{t('admin.users.detail.contact.whatsapp-label')}</span>
            </a>
            {user.email && (
              <span className="text-sm text-muted-foreground truncate">{user.email}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={user.tier} className="text-sm" />
            <UserStatusBadge status={user.status} />
          </div>
          <UserAdminMenu user={user} onAction={onAction} />
        </div>
      </div>

      {/* Chips row */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip>
          {t('admin.users.detail.chip.created', { date: formatDate(user.createdAt) })}
        </Chip>
        <Chip>
          {user.lastLoginAt
            ? t('admin.users.detail.chip.last-login', { value: formatRelative(user.lastLoginAt) })
            : t('admin.users.detail.chip.never-logged-in')}
        </Chip>
        {kycExpiryChip && (
          <Chip tone={kycExpiryChip.tone}>{kycExpiryChip.label}</Chip>
        )}
      </div>
    </div>
  );
}

interface ChipProps {
  children: React.ReactNode;
  tone?: 'muted' | 'warning' | 'danger';
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />
    </svg>
  );
}

function Chip({ children, tone = 'muted' }: ChipProps) {
  const cls =
    tone === 'danger'
      ? 'bg-danger-50 text-danger-700 dark:bg-danger-700/15 dark:text-danger-600 border-danger-600/20'
      : tone === 'warning'
        ? 'bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-600 border-warning-600/20'
        : 'bg-muted/50 text-muted-foreground border-border';
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 h-7 text-sm', cls)}>
      {children}
    </span>
  );
}
