import { AlertTriangle, CheckCircle2, Info, ShieldCheck, XOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { PreAddCheckResult } from '@/data/mockBlacklist';

interface Props {
  result: PreAddCheckResult | null;
  className?: string;
}

export function PreAddCheckPanel({ result, className }: Props) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t('admin.blacklist.pre-add.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!result || !result.identifier ? (
          <Idle />
        ) : result.duplicate ? (
          <DuplicateBanner />
        ) : (
          <>
            {result.match ? (
              <MatchBanner result={result} />
            ) : result.noStore ? (
              <NoStoreBanner />
            ) : (
              <NoMatchBanner />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Idle() {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      <span>{t('admin.blacklist.pre-add.idle')}</span>
    </div>
  );
}

function DuplicateBanner() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-danger-600/30 bg-danger-50 dark:bg-danger-700/15 px-3 py-2.5 text-sm">
      <XOctagon
        className="h-4 w-4 mt-0.5 shrink-0 text-danger-700 dark:text-danger-600"
        aria-hidden="true"
      />
      <div>
        <p className="font-medium text-danger-700 dark:text-danger-600">
          {t('admin.blacklist.add.warning.duplicate')}
        </p>
        <p className="text-sm text-danger-700/80 dark:text-danger-600/80">
          {t('admin.blacklist.pre-add.duplicate-body')}
        </p>
      </div>
    </div>
  );
}

function NoMatchBanner() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm">
      <CheckCircle2
        className="h-4 w-4 mt-0.5 shrink-0 text-success-700 dark:text-success-600"
        aria-hidden="true"
      />
      <div>
        <p className="font-medium">{t('admin.blacklist.pre-add.no-match.title')}</p>
        <p className="text-sm text-muted-foreground">
          {t('admin.blacklist.pre-add.no-match.body')}
        </p>
      </div>
    </div>
  );
}

function NoStoreBanner() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm">
      <Info
        className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div>
        <p className="font-medium">{t('admin.blacklist.pre-add.no-store.title')}</p>
        <p className="text-sm text-muted-foreground">
          {t('admin.blacklist.pre-add.no-store.body')}
        </p>
      </div>
    </div>
  );
}

function MatchBanner({ result }: { result: PreAddCheckResult }) {
  const m = result.match;
  if (!m) return null;
  if (m.kind === 'user') {
    const lastLogin = m.lastLoginAt
      ? formatRelative(m.lastLoginAt)
      : t('admin.blacklist.pre-add.last-login.never');
    return (
      <div className="flex items-start gap-2 rounded-md border border-warning-600/30 bg-warning-50 dark:bg-warning-700/15 px-3 py-2.5 text-sm">
        <AlertTriangle
          className="h-4 w-4 mt-0.5 shrink-0 text-warning-700 dark:text-warning-600"
          aria-hidden="true"
        />
        <div className="space-y-1.5 flex-1">
          <p className="font-medium text-warning-700 dark:text-warning-600">
            {t('admin.blacklist.add.warning.user-match', {
              name: m.name,
              phone: m.phone,
              tier: m.tier,
              lastLogin,
            })}
          </p>
          <Link
            to={`/customers/users/${m.userId}`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-warning-800 dark:text-warning-500 hover:underline"
          >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {t('admin.blacklist.pre-add.open-user')}
          </Link>
        </div>
      </div>
    );
  }
  // card match
  return (
    <div className="flex items-start gap-2 rounded-md border border-warning-600/30 bg-warning-50 dark:bg-warning-700/15 px-3 py-2.5 text-sm">
      <AlertTriangle
        className="h-4 w-4 mt-0.5 shrink-0 text-warning-700 dark:text-warning-600"
        aria-hidden="true"
      />
      <div className="space-y-1.5 flex-1">
        <p className="font-medium text-warning-700 dark:text-warning-600">
          {t('admin.blacklist.add.warning.card-match', {
            maskedPan: m.maskedPan,
            bank: m.bank,
          })}
        </p>
        <Link
          to={`/customers/cards/${m.cardId}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-warning-800 dark:text-warning-500 hover:underline"
        >
          {t('admin.blacklist.pre-add.open-card')}
        </Link>
      </div>
    </div>
  );
}
