import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { cn, formatDate, formatMoneyCompact, maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AmlUserStats } from '@/data/mockAmlTriage';

interface UserCardProps {
  user: AmlUserStats;
  onOpenProfile: () => void;
}

export function UserCard({ user, onOpenProfile }: UserCardProps) {
  const blocked = user.status === 'blocked';
  return (
    <Card>
      <CardHeader className="py-4 flex-row items-center justify-between space-y-0">
        <CardTitle>{t('admin.aml-triage.detail.user-card')}</CardTitle>
        <div className="flex items-center gap-2">
          {blocked && (
            <span className="inline-flex items-center rounded-sm bg-danger-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-danger-700 dark:bg-danger-700/15 dark:text-danger-600">
              {t('admin.aml-triage.detail.user-card.account-blocked')}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onOpenProfile}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {t('admin.aml-triage.detail.user-card.open-profile')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <Field label={t('admin.aml-triage.detail.user-card.phone')}>
            <span className="font-medium tabular">{user.phone}</span>
          </Field>
          <Field label={t('admin.aml-triage.detail.user-card.pinfl')}>
            <span className="font-mono tabular">{maskPinfl(user.pinfl)}</span>
          </Field>
          <Field label={t('admin.aml-triage.detail.user-card.tier')}>
            <TierBadge tier={user.tier} />
          </Field>
          <Field label={t('admin.aml-triage.detail.user-card.account-status')}>
            <span
              className={cn(
                'capitalize',
                blocked && 'text-danger-700 dark:text-danger-600 font-semibold',
              )}
            >
              {user.status}
            </span>
          </Field>
          <Field label={t('admin.aml-triage.detail.user-card.lifetime')}>
            <span className="tabular">
              {t('admin.aml-triage.detail.user-card.lifetime-value', {
                count: user.lifetimeTransferCount,
                volume: formatMoneyCompact(user.lifetimeVolumeUzsTiyins, 'UZS'),
              })}
            </span>
          </Field>
          <Field label={t('admin.aml-triage.detail.user-card.joined')}>
            <span className="tabular">{formatDate(user.joinedAt)}</span>
          </Field>
        </dl>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm min-w-0">{children}</dd>
    </div>
  );
}
