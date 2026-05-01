import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { Star, Trash2 } from 'lucide-react';
import { HardDeleteRecipientDialog } from '../modals/HardDeleteRecipientDialog';
import {
  getUserRecipients,
  hardDeleteRecipient,
  CURRENT_USER_ADMIN,
  type UserListRow,
  type UserRecipientEntry,
} from '@/data/mockUsers';
import { formatRelative, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

interface Props {
  user: UserListRow;
}

export function UserRecipientsTab({ user }: Props) {
  const [version, setVersion] = useState(0);
  const recipients = getUserRecipients(user.id);
  const [target, setTarget] = useState<UserRecipientEntry | null>(null);

  function handleDelete(reason: string) {
    if (!target) return;
    hardDeleteRecipient(user.id, target.id, reason, CURRENT_USER_ADMIN);
    toast.success(t('admin.users.action.delete-recipient.success'));
    setTarget(null);
    setVersion((v) => v + 1);
  }

  if (recipients.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center">
          <h3 className="text-base font-medium">{t('admin.users.detail.recipients.empty-title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.users.detail.recipients.empty-body')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3" key={version}>
      {recipients.map((r) => (
        <div key={r.id} className="rounded-md border bg-card text-card-foreground shadow-sm px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DestinationBadge destination={r.destination} />
                <span className="font-medium truncate">{r.displayName}</span>
                {r.isFavorite && (
                  <Star
                    className="h-4 w-4 text-warning-600 fill-warning-600"
                    aria-label={t('admin.users.detail.recipients.favorite')}
                  />
                )}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground tabular truncate">
                {r.identifier}
              </div>
              {r.nickname && (
                <div className="mt-0.5 text-sm text-muted-foreground italic">
                  {t('admin.users.detail.recipients.nickname', { value: r.nickname })}
                </div>
              )}
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  {t('admin.users.detail.recipients.transfer-count', { count: r.transferCount })}
                </span>
                <span>
                  {t('admin.users.detail.recipients.last-used', { value: formatRelative(r.lastUsedAt) })}
                </span>
                <span>
                  {t('admin.users.detail.recipients.added', { value: formatDate(r.createdAt) })}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTarget(r)}
              className="text-danger-700 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-700/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              {t('admin.users.action.delete-recipient.cta')}
            </Button>
          </div>
        </div>
      ))}

      <HardDeleteRecipientDialog
        open={target !== null}
        onOpenChange={(o) => {
          if (!o) setTarget(null);
        }}
        recipient={target}
        onSubmit={handleDelete}
      />
    </div>
  );
}
