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
import { DateTimeInput } from '@/components/zhipay/DateTimeInput';
import { t } from '@/lib/i18n';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentExpiresAt: Date | null;
  onConfirm: (newExpiresAt: Date | null) => void;
}

export function ExtendExpiryDialog({
  open,
  onOpenChange,
  currentExpiresAt,
  onConfirm,
}: Props) {
  const [value, setValue] = useState<Date | null>(currentExpiresAt);

  useEffect(() => {
    if (open) setValue(currentExpiresAt);
  }, [open, currentExpiresAt]);

  const changed =
    (value?.getTime() ?? null) !== (currentExpiresAt?.getTime() ?? null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{t('admin.blacklist.extend.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.blacklist.extend.body')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('admin.blacklist.extend.field.expires-at')}</Label>
            <DateTimeInput
              value={value}
              onValueChange={setValue}
              allowEmpty
              ariaLabel={t('admin.blacklist.extend.field.expires-at')}
            />
            <p className="text-sm text-muted-foreground">
              {t('admin.blacklist.extend.help')}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button disabled={!changed} onClick={() => onConfirm(value)}>
            {t('admin.blacklist.extend.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
