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
import type { KycFailureReason } from '@/data/mockKycQueue';

const REASONS: KycFailureReason[] = [
  'document_unreadable',
  'data_mismatch',
  'under_18',
  'sanctions_hit',
  'other',
];

export interface RejectSubmit {
  failureReason: KycFailureReason;
  reason: string;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** Pre-select a failure reason driven by an edge-case (e.g. under_18). */
  prefillFailureReason?: KycFailureReason;
  onSubmit: (payload: RejectSubmit) => void;
}

export function RejectDialog({
  open,
  onOpenChange,
  prefillFailureReason,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState('');
  const [failureReason, setFailureReason] = useState<KycFailureReason>(
    prefillFailureReason ?? 'document_unreadable',
  );

  useEffect(() => {
    if (open) {
      setReason('');
      setFailureReason(prefillFailureReason ?? 'document_unreadable');
    }
  }, [open, prefillFailureReason]);

  const valid = reason.trim().length >= 10;

  function submit() {
    if (!valid) return;
    onSubmit({ failureReason, reason: reason.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.kyc-queue.action.reject.title')}</DialogTitle>
          <DialogDescription>{t('admin.kyc-queue.action.reject.body')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="kyc-reject-reason">
              {t('admin.kyc-queue.action.reject.failure-reason')}
            </Label>
            <select
              id="kyc-reject-reason"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value as KycFailureReason)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(`admin.kyc-queue.action.reject.failure-reason.${r}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kyc-reject-text">
              {t('admin.kyc-queue.action.reject.reason-label')}
            </Label>
            <Textarea
              id="kyc-reject-text"
              autoFocus
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('admin.kyc-queue.action.reject.reason-placeholder')}
            />
            <div className="text-sm text-muted-foreground tabular">
              {reason.trim().length} / min 10
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button variant="destructive" onClick={submit} disabled={!valid}>
            {t('admin.kyc-queue.action.reject.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
