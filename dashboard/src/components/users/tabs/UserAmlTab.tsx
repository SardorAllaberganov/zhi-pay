import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge } from '@/components/zhipay/SeverityBadge';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { cn, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { getInitialAmlList } from '@/data/mockAmlTriage';
import type { UserListRow } from '@/data/mockUsers';

interface Props {
  user: UserListRow;
}

export function UserAmlTab({ user }: Props) {
  const navigate = useNavigate();
  const flags = getInitialAmlList()
    .filter((r) => r.userId === user.id)
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (flags.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center">
          <h3 className="text-base font-medium">{t('admin.users.detail.aml.empty-title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.users.detail.aml.empty-body')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {flags.map((f, idx) => {
        const isSanctions = f.flagType === 'sanctions';
        const isCritical = f.severity === 'critical';
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => navigate(`/operations/aml-triage/${f.id}`)}
            className={cn(
              'w-full text-left flex flex-col gap-1.5 px-4 py-3 cursor-pointer transition-colors min-w-0',
              'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              idx > 0 && 'border-t border-border',
              isCritical && 'shadow-[inset_2px_0_0_theme(colors.danger.600)]',
            )}
          >
            <div className="flex items-center flex-wrap gap-2">
              {isSanctions && (
                <ShieldAlert className="h-4 w-4 shrink-0 text-danger-600" aria-hidden="true" />
              )}
              <SeverityBadge severity={f.severity} />
              <span className="inline-flex items-center rounded-full bg-muted/50 text-muted-foreground px-2 h-5 text-xs font-medium uppercase tracking-wider">
                {t(`admin.aml-triage.filter.type.${f.flagType}`)}
              </span>
              <StatusBadge status={f.status} domain="aml" />
              <span className="ml-auto text-sm text-muted-foreground">
                {formatRelative(f.createdAt)}
              </span>
            </div>
            <p className="text-sm text-foreground/90 line-clamp-2">{f.description}</p>
            {f.assigneeName && (
              <div className="text-sm text-muted-foreground">
                {t('admin.aml-triage.row.reviewing-by', { name: f.assigneeName })}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
