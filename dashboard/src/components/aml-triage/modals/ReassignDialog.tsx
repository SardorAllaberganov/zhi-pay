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
import { t } from '@/lib/i18n';
import { ADMIN_POOL, type AmlAdmin } from '@/data/mockAmlTriage';

export interface ReassignSubmit {
  /** null = unassigned (returns to open queue). */
  assigneeId: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  currentAssigneeId: string | undefined;
  onSubmit: (payload: ReassignSubmit) => void;
}

const UNASSIGNED_VALUE = '__unassigned__';

export function ReassignDialog({
  open,
  onOpenChange,
  currentAssigneeId,
  onSubmit,
}: Props) {
  const [value, setValue] = useState<string>(currentAssigneeId ?? UNASSIGNED_VALUE);

  useEffect(() => {
    if (open) {
      setValue(currentAssigneeId ?? UNASSIGNED_VALUE);
    }
  }, [open, currentAssigneeId]);

  function submit() {
    onSubmit({ assigneeId: value === UNASSIGNED_VALUE ? null : value });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.aml-triage.action.reassign.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.aml-triage.action.reassign.body')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="aml-reassign-assignee">
            {t('admin.aml-triage.action.reassign.assignee')}
          </Label>
          <select
            id="aml-reassign-assignee"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value={UNASSIGNED_VALUE}>
              {t('admin.aml-triage.action.reassign.unassigned')}
            </option>
            {ADMIN_POOL.map((a: AmlAdmin) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={submit}>
            {t('admin.aml-triage.action.reassign.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
