import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/transfer-detail/modals/Textarea';
import { t } from '@/lib/i18n';
import type { UserDeviceEntry } from '@/data/mockUsers';

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  device: UserDeviceEntry | null;
  onSubmit: (reason: string) => void;
}

export function UntrustDeviceDialog({ open, onOpenChange, device, onSubmit }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const valid = reason.trim().length >= 20;

  function submit() {
    if (!valid || !device) return;
    onSubmit(reason.trim());
    onOpenChange(false);
  }

  if (!device) return null;
  const last6 = device.deviceId.slice(-6);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.users.action.untrust-device.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.users.action.untrust-device.body', {
              platform: device.platform,
              deviceId: last6,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="untrust-reason">{t('admin.users.action.reason-label')}</Label>
          <Textarea
            id="untrust-reason"
            autoFocus
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('admin.users.action.reason-placeholder')}
          />
          <div className="text-sm text-muted-foreground tabular">
            {reason.trim().length} / {t('admin.users.action.confirm-reason-required')}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {t('admin.users.action.untrust-device.cta')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
