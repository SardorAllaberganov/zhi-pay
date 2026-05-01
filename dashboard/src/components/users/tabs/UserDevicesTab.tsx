import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, ShieldCheck, ShieldOff } from 'lucide-react';
import { UntrustDeviceDialog } from '../modals/UntrustDeviceDialog';
import {
  getUserDevices,
  untrustDevice,
  CURRENT_USER_ADMIN,
  type UserDeviceEntry,
  type UserListRow,
} from '@/data/mockUsers';
import { cn, formatRelative, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

interface Props {
  user: UserListRow;
}

export function UserDevicesTab({ user }: Props) {
  const [version, setVersion] = useState(0);
  const devices = getUserDevices(user.id);
  const [target, setTarget] = useState<UserDeviceEntry | null>(null);

  function handleSubmit(reason: string) {
    if (!target) return;
    untrustDevice(user.id, target.id, reason, CURRENT_USER_ADMIN);
    toast.success(t('admin.users.action.untrust-device.success'));
    setTarget(null);
    setVersion((v) => v + 1);
  }

  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center">
          <h3 className="text-base font-medium">{t('admin.users.detail.devices.empty-title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.users.detail.devices.empty-body')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3" key={version}>
      {devices.map((d) => (
        <div
          key={d.id}
          className={cn(
            'rounded-md border bg-card text-card-foreground shadow-sm px-4 py-3',
            !d.isTrusted && 'opacity-80',
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 shrink-0 rounded-md bg-muted/60 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium capitalize">
                    {d.platform === 'ios' ? 'iOS' : 'Android'}
                  </span>
                  <span className="text-sm text-muted-foreground tabular">
                    v{d.appVersion}
                  </span>
                  {d.isTrusted ? (
                    <span className="inline-flex items-center rounded-full bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-600 px-2 h-5 text-xs font-medium">
                      <ShieldCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                      {t('admin.users.detail.devices.trusted')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-warning-50 dark:bg-warning-700/15 text-warning-700 dark:text-warning-600 px-2 h-5 text-xs font-medium">
                      <ShieldOff className="h-3 w-3 mr-1" aria-hidden="true" />
                      {t('admin.users.detail.devices.untrusted')}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground tabular">
                  {t('admin.users.detail.devices.device-id', { id: d.deviceId.slice(-6) })}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {t('admin.users.detail.devices.last-seen', { value: formatRelative(d.lastSeenAt) })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('admin.users.detail.devices.added', { value: formatDate(d.createdAt) })}
                </div>
              </div>
            </div>
            {d.isTrusted && (
              <Button variant="outline" size="sm" onClick={() => setTarget(d)}>
                <ShieldOff className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                {t('admin.users.action.untrust-device.cta')}
              </Button>
            )}
          </div>
        </div>
      ))}

      <UntrustDeviceDialog
        open={target !== null}
        onOpenChange={(o) => {
          if (!o) setTarget(null);
        }}
        device={target}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
