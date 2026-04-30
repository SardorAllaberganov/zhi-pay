import { useState } from 'react';
import { ArrowRight, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AdminActionEntry, AdminActionType } from '@/data/mockTransferDetail';

interface Props {
  actions: AdminActionEntry[];
  onViewFullAudit: () => void;
}

const TONE_BY_TYPE: Record<AdminActionType, string> = {
  note_added:
    'border-border bg-muted text-muted-foreground',
  webhook_resent:
    'border-brand-600/30 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300',
  force_failed:
    'border-danger-600/30 bg-danger-50 text-danger-700 dark:bg-danger-700/15 dark:text-danger-600',
  marked_completed:
    'border-success-600/30 bg-success-50 text-success-700 dark:bg-success-700/15 dark:text-success-600',
  reversed:
    'border-warning-600/30 bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-600',
  refunded:
    'border-warning-600/30 bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-600',
};

export function AdminActionHistoryCard({ actions, onViewFullAudit }: Props) {
  const last5 = actions.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t('admin.transfer-detail.audit.title')}
          {actions.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground tabular">
              ({actions.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {last5.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            {t('admin.transfer-detail.audit.empty')}
          </div>
        ) : (
          <ul className="space-y-2">
            {last5.map((a) => (
              <ActionRow key={a.id} action={a} />
            ))}
          </ul>
        )}
        <div className="flex items-center justify-end pt-3 mt-3 border-t">
          <button
            type="button"
            onClick={onViewFullAudit}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {t('admin.transfer-detail.audit.view-full')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionRow({ action }: { action: AdminActionEntry }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = action.reason.length > 100 ? action.reason.slice(0, 100) + '…' : action.reason;
  const visible = expanded ? action.reason : truncated;

  return (
    <li className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="bg-brand-50 text-brand-700 text-xs dark:bg-brand-950/40 dark:text-brand-300">
          {action.actorInitials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{action.actorName}</span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONE_BY_TYPE[action.type]}`}
          >
            {t(`admin.transfer-detail.audit.action.${action.type}`)}
          </span>
          <span className="text-sm text-muted-foreground tabular">
            {formatRelative(action.createdAt)}
          </span>
        </div>
        {action.reason && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 text-left text-sm text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {visible}
          </button>
        )}
      </div>
    </li>
  );
}
