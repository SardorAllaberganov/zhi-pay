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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/transfer-detail/modals/Textarea';
import { t } from '@/lib/i18n';

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  userName: string;
  onSubmit: (payload: { from: Date; to: Date; reason: string }) => void;
}

function isoYMD(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function GenerateAuditReportDialog({ open, onOpenChange, userName, onSubmit }: Props) {
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const [from, setFrom] = useState<string>(isoYMD(ninetyDaysAgo));
  const [to, setTo] = useState<string>(isoYMD(today));
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setFrom(isoYMD(ninetyDaysAgo));
      setTo(isoYMD(today));
      setReason('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fromDate = new Date(from);
  const toDate = new Date(to);
  const validRange = !isNaN(fromDate.getTime()) && !isNaN(toDate.getTime()) && fromDate.getTime() <= toDate.getTime();
  const validReason = reason.trim().length >= 20;
  const valid = validRange && validReason;

  function submit() {
    if (!valid) return;
    onSubmit({ from: fromDate, to: toDate, reason: reason.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.users.action.generate-report.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.users.action.generate-report.body', { name: userName })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="report-from">{t('admin.users.action.generate-report.from')}</Label>
            <Input id="report-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-to">{t('admin.users.action.generate-report.to')}</Label>
            <Input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="report-reason">{t('admin.users.action.reason-label')}</Label>
          <Textarea
            id="report-reason"
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
            {t('admin.users.action.generate-report.cta')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
