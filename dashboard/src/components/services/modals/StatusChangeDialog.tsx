import { useEffect, useMemo, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ServiceStatus } from '@/types';
import type { ServiceFull } from '@/data/mockServices';

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceFull;
  /** The status the admin clicked. Drives copy + min-reason length + acknowledge flag. */
  target: ServiceStatus | null;
  onConfirm: (input: {
    target: ServiceStatus;
    reason: string;
    acknowledgeImpact?: boolean;
  }) => Promise<void> | void;
}

interface DialogConfig {
  titleKey: string;
  bodyKey: string;
  confirmKey: string;
  minReason: number;
  destructive: boolean;
  requiresAcknowledge: boolean;
}

function configFor(target: ServiceStatus): DialogConfig {
  if (target === 'maintenance') {
    return {
      titleKey: 'admin.services.confirm.maintenance.title',
      bodyKey: 'admin.services.confirm.maintenance.body',
      confirmKey: 'admin.services.confirm.maintenance.cta',
      minReason: 30,
      destructive: false,
      requiresAcknowledge: false,
    };
  }
  if (target === 'disabled') {
    return {
      titleKey: 'admin.services.confirm.disabled.title',
      bodyKey: 'admin.services.confirm.disabled.body',
      confirmKey: 'admin.services.confirm.disabled.cta',
      minReason: 50,
      destructive: true,
      requiresAcknowledge: true,
    };
  }
  // → active
  return {
    titleKey: 'admin.services.confirm.active.title',
    bodyKey: 'admin.services.confirm.active.body',
    confirmKey: 'admin.services.confirm.active.cta',
    minReason: 20,
    destructive: false,
    requiresAcknowledge: false,
  };
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  service,
  target,
  onConfirm,
}: StatusChangeDialogProps) {
  const cfg = useMemo(
    () => (target ? configFor(target) : configFor('active')),
    [target],
  );

  const [reason, setReason] = useState('');
  const [acknowledge, setAcknowledge] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset state every time the dialog opens for a new transition.
  useEffect(() => {
    if (open) {
      setReason('');
      setAcknowledge(false);
      setSubmitting(false);
    }
  }, [open, target]);

  if (!target) return null;

  const reasonValid = reason.trim().length >= cfg.minReason;
  const ackValid = !cfg.requiresAcknowledge || acknowledge;
  const canConfirm = reasonValid && ackValid && !submitting;

  async function handleConfirm() {
    if (!target || !canConfirm) return;
    setSubmitting(true);
    try {
      await onConfirm({
        target,
        reason: reason.trim(),
        acknowledgeImpact: cfg.requiresAcknowledge ? acknowledge : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{t(cfg.titleKey)}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                {t(cfg.bodyKey, {
                  inflight: service.inflightCount,
                })}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Reason field */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="status-change-reason">
            {t('admin.services.confirm.reason-label')}
          </label>
          <textarea
            id="status-change-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('admin.services.confirm.reason-placeholder', {
              min: cfg.minReason,
            })}
            rows={4}
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'placeholder:text-muted-foreground/70',
            )}
          />
          <p
            className={cn(
              'text-sm tabular',
              reasonValid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-600',
            )}
          >
            {t('admin.services.confirm.reason-counter', {
              count: reason.trim().length,
              min: cfg.minReason,
            })}
          </p>
        </div>

        {/* Acknowledge checkbox — disable transitions only */}
        {cfg.requiresAcknowledge && (
          <label className="flex items-start gap-2.5 rounded-md border border-danger-600/30 bg-danger-50 dark:bg-danger-700/15 px-3 py-2.5 cursor-pointer">
            <Checkbox
              checked={acknowledge}
              onCheckedChange={(v) => setAcknowledge(v === true)}
              className="mt-0.5"
              aria-labelledby="status-change-acknowledge-label"
            />
            <span
              id="status-change-acknowledge-label"
              className="text-sm text-danger-700 dark:text-danger-600 font-medium leading-snug"
            >
              {t('admin.services.confirm.disabled.acknowledge')}
            </span>
          </label>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>
            {t('common.actions.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={!canConfirm}
            className={cn(
              cfg.destructive &&
                'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-600',
            )}
          >
            {submitting
              ? t('admin.services.confirm.submitting')
              : t(cfg.confirmKey)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
