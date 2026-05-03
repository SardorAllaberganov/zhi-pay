import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { t } from '@/lib/i18n';
import type { AdminSession } from '@/data/mockAdminAuth';
import { DeviceIcon } from './DeviceIcon';

interface RevokeSessionDialogProps {
  session: AdminSession | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RevokeSessionDialog({ session, onOpenChange, onConfirm }: RevokeSessionDialogProps) {
  return (
    <AlertDialog open={!!session} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('admin.settings.sessions.revoke.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('admin.settings.sessions.revoke.body')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {session ? (
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <DeviceIcon device={session.device} />
              <span className="font-medium">{session.browser}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{session.os}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {session.ipAddress}
              {session.geoCity ? ` · ${session.geoCity}` : ''}
            </div>
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-warning-600 text-white hover:bg-warning-700"
          >
            {t('admin.settings.sessions.active.action.revoke')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
