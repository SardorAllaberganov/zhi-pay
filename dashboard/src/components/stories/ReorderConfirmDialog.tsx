import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { Story } from '@/data/mockStories';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: Story | null;
  oldOrder: number;
  newOrder: number;
  /** Reason note ≥ 20 chars before commit. */
  onConfirm: (reason: string) => void;
}

export function ReorderConfirmDialog({
  open,
  onOpenChange,
  story,
  oldOrder,
  newOrder,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!story) return null;

  const reasonValid = reason.trim().length >= 20;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.stories.reorder.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.stories.reorder.body', { title: story.titleEn })}
          </DialogDescription>
        </DialogHeader>

        {/* Old → New visual */}
        <div className="flex items-center justify-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-4">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('admin.stories.reorder.from')}
            </div>
            <div className="mt-1 text-2xl font-bold tabular text-foreground">#{oldOrder}</div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('admin.stories.reorder.to')}
            </div>
            <div className="mt-1 text-2xl font-bold tabular text-brand-700 dark:text-brand-300">#{newOrder}</div>
          </div>
        </div>

        {/* Reason note */}
        <div className="space-y-2">
          <Label htmlFor="reorder-reason">{t('admin.stories.reorder.reason-label')}</Label>
          <textarea
            id="reorder-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={t('admin.stories.reorder.reason-placeholder')}
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'placeholder:text-muted-foreground/70 resize-none',
            )}
          />
          <div className="flex items-center justify-between text-sm">
            <span className={cn(reasonValid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-500')}>
              {t('admin.stories.reorder.reason-hint')}
            </span>
            <span className={cn('tabular', reasonValid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-500')}>
              {reason.trim().length}/20
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={!reasonValid}
          >
            {t('admin.stories.reorder.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
