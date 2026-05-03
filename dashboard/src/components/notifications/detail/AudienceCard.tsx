import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/users/UserAvatar';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { t } from '@/lib/i18n';
import { getUserById } from '@/data/mockUsers';
import type { Notification } from '@/data/mockNotifications';
import { LAST_LOGIN_LABEL_KEY, AUDIENCE_TYPE_LABEL_KEY } from '../types';

interface Props {
  notification: Notification;
}

const TIER_LABEL_KEY: Record<'tier_0' | 'tier_1' | 'tier_2', string> = {
  tier_0: 'admin.notifications.compose.segment.tier.tier_0',
  tier_1: 'admin.notifications.compose.segment.tier.tier_1',
  tier_2: 'admin.notifications.compose.segment.tier.tier_2',
};
const LANG_LABEL_KEY: Record<'uz' | 'ru' | 'en', string> = {
  uz: 'admin.notifications.compose.locale.uz',
  ru: 'admin.notifications.compose.locale.ru',
  en: 'admin.notifications.compose.locale.en',
};

export function AudienceCard({ notification }: Props) {
  const user = notification.userId ? getUserById(notification.userId) : undefined;
  const c = notification.audienceCriteria;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.notifications.detail.section.audience')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row
          labelKey="admin.notifications.detail.audience.type"
          value={t(AUDIENCE_TYPE_LABEL_KEY[notification.audienceType])}
        />
        <Row
          labelKey="admin.notifications.detail.audience.recipient-count"
          value={formatCount(notification.recipientCount)}
        />

        {notification.audienceType === 'single' && user && (
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <Link
              to={`/customers/users/${user.id}`}
              className="flex items-center gap-3 group"
            >
              <UserAvatar name={user.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate group-hover:underline">
                  {user.name}
                </div>
                <div className="text-sm text-muted-foreground truncate">{user.phone}</div>
              </div>
              <TierBadge tier={user.tier} />
              <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden />
            </Link>
          </div>
        )}

        {notification.audienceType === 'segment' && c && (
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t('admin.notifications.detail.audience.criteria')}
            </div>
            {c.tiers && c.tiers.length > 0 && (
              <CriteriaRow
                labelKey="admin.notifications.compose.segment.tier"
                value={c.tiers.map((tt) => t(TIER_LABEL_KEY[tt])).join(' · ')}
              />
            )}
            {c.languages && c.languages.length > 0 && (
              <CriteriaRow
                labelKey="admin.notifications.compose.segment.language"
                value={c.languages.map((l) => t(LANG_LABEL_KEY[l])).join(' · ')}
              />
            )}
            {c.hasLinkedCard !== undefined && c.hasLinkedCard !== null && (
              <CriteriaRow
                labelKey="admin.notifications.compose.segment.has-card"
                value={t(
                  c.hasLinkedCard
                    ? 'admin.notifications.compose.segment.yes'
                    : 'admin.notifications.compose.segment.no',
                )}
              />
            )}
            {c.hasCompletedTransfer !== undefined && c.hasCompletedTransfer !== null && (
              <CriteriaRow
                labelKey="admin.notifications.compose.segment.has-transfer"
                value={t(
                  c.hasCompletedTransfer
                    ? 'admin.notifications.compose.segment.yes'
                    : 'admin.notifications.compose.segment.no',
                )}
              />
            )}
            {c.lastLogin && (
              <CriteriaRow
                labelKey="admin.notifications.compose.segment.last-login"
                value={t(LAST_LOGIN_LABEL_KEY[c.lastLogin])}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ labelKey, value }: { labelKey: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {t(labelKey)}
      </dt>
      <dd className="text-sm font-medium tabular text-right">{value}</dd>
    </div>
  );
}

function CriteriaRow({ labelKey, value }: { labelKey: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-muted-foreground">{t(labelKey)}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function formatCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
