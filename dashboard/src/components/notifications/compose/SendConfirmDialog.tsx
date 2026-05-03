import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { LARGE_AUDIENCE_THRESHOLD, type ComposeForm } from '../types';

interface SendConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ComposeForm;
  recipientCount: number;
  /** Display name for single-user audience (resolved by the caller from mockUsers). */
  singleUserName: string | null;
  onConfirm: () => void;
}

/**
 * 4 visual variants composed inside one AlertDialog:
 *   1. Standard send (broadcast / segment / single, send-now)
 *   2. Schedule for later — title swaps + body shows scheduled timestamp
 *   3. Large broadcast (>5000) — additional warning banner
 *   4. Compliance type — typed-confirm input gates the primary action
 *
 * Compliance check is the strictest gate: typing must match the localized
 * "I confirm" string trim+lowercase before the primary CTA enables.
 */
export function SendConfirmDialog({
  open,
  onOpenChange,
  form,
  recipientCount,
  singleUserName,
  onConfirm,
}: SendConfirmDialogProps) {
  const isScheduled = form.schedule === 'later';
  const isLargeBroadcast = recipientCount > LARGE_AUDIENCE_THRESHOLD;
  const isCompliance = form.type === 'compliance';

  const expectedConfirmText = t('admin.notifications.compose.confirm.compliance.text').trim().toLowerCase();

  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  const complianceUnlocked = !isCompliance || typed.trim().toLowerCase() === expectedConfirmText;

  const titleText = (() => {
    if (isScheduled) {
      return t('admin.notifications.compose.confirm.schedule.title').replace(
        '{time}',
        form.scheduledFor ? formatDateTime(form.scheduledFor) : '—',
      );
    }
    switch (form.audienceType) {
      case 'broadcast':
        return t('admin.notifications.compose.confirm.broadcast.title').replace(
          '{count}',
          formatCount(recipientCount),
        );
      case 'segment':
        return t('admin.notifications.compose.confirm.segment.title').replace(
          '{count}',
          formatCount(recipientCount),
        );
      case 'single':
        return t('admin.notifications.compose.confirm.single.title').replace(
          '{name}',
          singleUserName ?? '—',
        );
    }
  })();

  const ctaText = isScheduled
    ? t('admin.notifications.compose.action.schedule')
    : t('admin.notifications.compose.action.send.confirm');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titleText}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block">
              {t(`admin.notifications.compose.type.${form.type}`)} ·{' '}
              {form.audienceType === 'single' && singleUserName
                ? singleUserName
                : t('admin.notifications.compose.confirm.audience-summary').replace(
                    '{count}',
                    formatCount(recipientCount),
                  )}
            </span>

            {isCompliance && (
              <span
                className={cn(
                  'block rounded-md border px-3 py-2',
                  'border-warning-300 bg-warning-50 text-warning-800',
                  'dark:border-warning-700/40 dark:bg-warning-950/30 dark:text-warning-300',
                )}
              >
                <span className="inline-flex items-start gap-2">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{t('admin.notifications.compose.confirm.compliance.warning')}</span>
                </span>
              </span>
            )}

            {isLargeBroadcast && !isCompliance && (
              <span
                className={cn(
                  'block rounded-md border px-3 py-2',
                  'border-warning-300 bg-warning-50 text-warning-800',
                  'dark:border-warning-700/40 dark:bg-warning-950/30 dark:text-warning-300',
                )}
              >
                <span className="inline-flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{t('admin.notifications.compose.confirm.large-audience')}</span>
                </span>
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isCompliance && (
          <div className="space-y-2">
            <Label htmlFor="notif-compliance-typed-confirm">
              {t('admin.notifications.compose.confirm.compliance.input').replace(
                '{confirmText}',
                t('admin.notifications.compose.confirm.compliance.text'),
              )}
            </Label>
            <Input
              id="notif-compliance-typed-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={t('admin.notifications.compose.confirm.compliance.text')}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>{t('admin.notifications.compose.action-bar.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={!complianceUnlocked}>
            {ctaText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
