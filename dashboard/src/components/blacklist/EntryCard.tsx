import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { BlacklistEntry } from '@/data/mockBlacklist';
import { IdentityCell } from './IdentityCell';
import { ExpiryCell } from './ExpiryCell';
import { SeverityChip } from './SeverityChip';
import { AddedByCell } from './AddedByCell';

const TYPE_LABEL_KEY: Record<BlacklistEntry['type'], string> = {
  phone: 'admin.blacklist.type.phone',
  pinfl: 'admin.blacklist.type.pinfl',
  device_id: 'admin.blacklist.type.device',
  ip: 'admin.blacklist.type.ip',
  card_token: 'admin.blacklist.type.card-token',
};

export function EntryCard({
  entry,
  className,
}: {
  entry: BlacklistEntry;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('admin.blacklist.detail.entry')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          <Row label={t('admin.blacklist.detail.type')}>
            <span className="text-sm">{t(TYPE_LABEL_KEY[entry.type])}</span>
          </Row>
          <Row label={t('admin.blacklist.detail.identifier')}>
            <IdentityCell type={entry.type} identifier={entry.identifier} />
          </Row>
          <Row label={t('admin.blacklist.detail.severity')}>
            <SeverityChip severity={entry.severity} />
          </Row>
          <Row label={t('admin.blacklist.detail.reason')}>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {entry.reason}
            </p>
          </Row>
          <Row label={t('admin.blacklist.detail.added-by')}>
            <AddedByCell adminId={entry.addedBy} />
          </Row>
          <Row label={t('admin.blacklist.detail.created')}>
            <span className="text-sm">{formatDateTime(entry.createdAt)}</span>
          </Row>
          <Row label={t('admin.blacklist.detail.expires')}>
            <ExpiryCell entry={entry} />
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
