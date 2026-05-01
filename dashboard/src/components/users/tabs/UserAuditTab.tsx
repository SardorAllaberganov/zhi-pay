import { Card, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';
import { getUserAuditForUser, type UserAuditEntry } from '@/data/mockUsers';
import { formatRelative, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserListRow } from '@/data/mockUsers';

interface Props {
  user: UserListRow;
}

export function UserAuditTab({ user }: Props) {
  const entries = getUserAuditForUser(user.id);

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center">
          <h3 className="text-base font-medium">{t('admin.users.detail.audit.empty-title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.users.detail.audit.empty-body')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {entries.map((e) => (
            <li key={e.id} className="px-4 py-3 flex gap-3">
              <div className="mt-0.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
                  <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{actionLabel(e.action)}</span>
                  <span className="text-sm text-muted-foreground">
                    {t('admin.users.detail.audit.by', { actor: e.actorName })}
                  </span>
                  <span
                    className="ml-auto text-sm text-muted-foreground tabular"
                    title={formatDateTime(e.createdAt)}
                  >
                    {formatRelative(e.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{e.reason}</p>
                {e.context && Object.keys(e.context).length > 0 && (
                  <pre className="mt-2 rounded-md bg-muted/40 px-2 py-1.5 overflow-x-auto overflow-y-hidden">
                    <code className="font-mono text-sm tabular text-muted-foreground">
                      {JSON.stringify(e.context, replacer, 2)}
                    </code>
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function actionLabel(action: UserAuditEntry['action']): string {
  return t(`admin.users.audit.action.${action}`);
}

function replacer(_k: string, v: unknown): unknown {
  if (typeof v === 'bigint') return v.toString();
  return v;
}
