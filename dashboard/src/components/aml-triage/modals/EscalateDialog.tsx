import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/transfer-detail/modals/Textarea';
import { t } from '@/lib/i18n';
import {
  buildSanctionsEscalateTemplate,
  type AmlReview,
} from '@/data/mockAmlTriage';

export interface EscalateSubmit {
  notes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  review: AmlReview;
  userPhone: string;
  onSubmit: (payload: EscalateSubmit) => void;
}

export function EscalateDialog({
  open,
  onOpenChange,
  review,
  userPhone,
  onSubmit,
}: Props) {
  const isSanctions = review.flagType === 'sanctions';
  const isCritical = review.severity === 'critical';

  const sanctionsTemplate = useMemo(
    () => (isSanctions ? buildSanctionsEscalateTemplate(review) : ''),
    [isSanctions, review],
  );

  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Auto-fill the sanctions compliance template when opening for sanctions.
      setNotes(isSanctions ? sanctionsTemplate : '');
      setConfirmOpen(false);
    }
  }, [open, isSanctions, sanctionsTemplate]);

  // Validation:
  // - non-sanctions: ≥20 chars
  // - sanctions: ≥20 chars AND meaningfully edited beyond the template
  //   (template length + 30 reviewer-context chars OR text differs from template)
  let valid = notes.trim().length >= 20;
  let templateUntouched = false;
  if (isSanctions) {
    const trimmedNotes = notes.trim();
    const trimmedTemplate = sanctionsTemplate.trim();
    if (trimmedNotes === trimmedTemplate) {
      templateUntouched = true;
      valid = false;
    } else if (
      trimmedNotes.length < trimmedTemplate.length + 30 &&
      trimmedNotes.startsWith(trimmedTemplate.slice(0, 30))
    ) {
      // Reviewer barely edited — require ≥30 added chars beyond template.
      templateUntouched = true;
      valid = false;
    }
  }

  function attemptSubmit() {
    if (!valid) return;
    setConfirmOpen(true);
  }
  function confirmSubmit() {
    onSubmit({ notes: notes.trim() });
    setConfirmOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open && !confirmOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{t('admin.aml-triage.action.escalate.title')}</DialogTitle>
            <DialogDescription>
              {t('admin.aml-triage.action.escalate.body')}
            </DialogDescription>
          </DialogHeader>

          {isSanctions && (
            <div className="rounded-md border border-danger-600/40 bg-danger-50 dark:bg-danger-700/15 p-3">
              <div className="flex items-start gap-2 text-sm text-danger-700 dark:text-danger-600">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{t('admin.aml-triage.action.escalate.body.sanctions-warning')}</span>
              </div>
            </div>
          )}

          {!isSanctions && isCritical && (
            <div className="rounded-md border border-warning-600/40 bg-warning-50 dark:bg-warning-700/15 p-3">
              <div className="flex items-start gap-2 text-sm text-warning-700 dark:text-warning-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {t('admin.aml-triage.action.escalate.body.critical-block-warning', {
                    phone: userPhone,
                  })}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="aml-escalate-notes">
              {t('admin.aml-triage.action.escalate.notes-label')}
            </Label>
            <Textarea
              id="aml-escalate-notes"
              autoFocus
              rows={isSanctions ? 8 : 4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('admin.aml-triage.action.escalate.notes-placeholder')}
              className={isSanctions ? 'font-mono text-sm' : ''}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground tabular">
              <span>
                {notes.trim().length} / min 20
              </span>
              {templateUntouched && (
                <span className="text-danger-700 dark:text-danger-600">
                  {t('admin.aml-triage.action.escalate.notes-too-similar')}
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={attemptSubmit} disabled={!valid}>
              {t('admin.aml-triage.action.escalate.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('admin.aml-triage.action.escalate.confirm-title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.aml-triage.action.escalate.confirm-body', {
                extra: isCritical
                  ? t('admin.aml-triage.action.escalate.confirm-body.block-user', {
                      phone: userPhone,
                    })
                  : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="bg-danger-600 text-white hover:bg-danger-700"
            >
              {t('admin.aml-triage.action.escalate.submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
