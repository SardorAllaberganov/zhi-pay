import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { BlacklistEntry } from '@/data/mockBlacklist';
import { getAffectedSummary } from '@/data/mockBlacklist';

const TYPE_NOUN_KEY: Record<BlacklistEntry['type'], string> = {
  phone: 'admin.blacklist.impact.noun.users',
  pinfl: 'admin.blacklist.impact.noun.users',
  device_id: 'admin.blacklist.impact.noun.devices',
  ip: 'admin.blacklist.impact.noun.sessions',
  card_token: 'admin.blacklist.impact.noun.cards',
};

export function ImpactCard({
  entry,
  className,
}: {
  entry: BlacklistEntry;
  className?: string;
}) {
  const summary = getAffectedSummary(entry);
  const noun = t(TYPE_NOUN_KEY[entry.type]);

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('admin.blacklist.detail.impact')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight tabular">
              {summary.total}
            </span>
            <span className="text-sm text-muted-foreground">{noun}</span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {summary.total > 0
              ? t('admin.blacklist.impact.currently-blocking')
              : t('admin.blacklist.impact.no-current-effect')}
          </p>
        </div>

        {entry.loginAttemptsBlocked30d !== undefined && (
          <div className="text-sm text-muted-foreground">
            {t('admin.blacklist.impact.attempts-30d', {
              count: entry.loginAttemptsBlocked30d,
            })}
          </div>
        )}

        {summary.user && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              {t('admin.blacklist.impact.affected-user')}
            </p>
            <Link
              to={`/customers/users/${summary.user.userId}`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">{summary.user.name}</span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{summary.user.phone}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-1" aria-hidden="true" />
            </Link>
          </div>
        )}

        {summary.card && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              {t('admin.blacklist.impact.affected-card')}
            </p>
            <Link
              to={`/customers/cards/${summary.card.cardId}`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="text-sm font-medium font-mono tabular">
                {summary.card.maskedPan}
              </span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{summary.card.bank}</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-1" aria-hidden="true" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
