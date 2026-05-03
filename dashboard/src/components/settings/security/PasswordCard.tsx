import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth';
import { formatRelative, cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ChangePasswordModal } from './ChangePasswordModal';

const STALE_AFTER_DAYS = 90;

export function PasswordCard() {
  const session = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  if (!session) return null;
  const last = session.profile.lastPasswordChangedAt;
  const daysSince = last
    ? Math.floor((Date.now() - last.getTime()) / (24 * 60 * 60 * 1000))
    : null;
  const stale = daysSince !== null && daysSince > STALE_AFTER_DAYS;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t('admin.settings.security.password.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className={cn('text-sm', stale ? 'text-danger-600 dark:text-danger-700' : 'text-muted-foreground')}>
            {last ? (
              <>
                {t('admin.settings.security.password.last-changed')}{' '}
                <span className="font-medium">{formatRelative(last)}</span>
                {stale ? (
                  <>
                    {' '}
                    · {t('admin.settings.security.password.stale-warning')}
                  </>
                ) : null}
              </>
            ) : (
              t('admin.settings.security.password.never-changed')
            )}
          </p>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            {t('admin.settings.security.password.change')}
          </Button>
        </div>
      </CardContent>
      <ChangePasswordModal open={modalOpen} onOpenChange={setModalOpen} />
    </Card>
  );
}
