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
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { News } from '@/data/mockNews';

const REASON_MIN = 20;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: News | null;
  onConfirm: (reason: string) => void;
}

export function UnpublishDialog({ open, onOpenChange, item, onConfirm }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  if (!item) return null;

  const trimmed = reason.trim();
  const valid = trimmed.length >= REASON_MIN;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t('admin.news.unpublish.title')}</DialogTitle>
          <DialogDescription>{t('admin.news.unpublish.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm">
            <div className="text-muted-foreground mb-1">{t('admin.news.unpublish.target')}</div>
            <div className="font-medium text-foreground line-clamp-2">{item.titleEn || item.titleUz || item.titleRu}</div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="news-unpublish-reason" className="block text-sm font-medium">
              {t('admin.news.unpublish.reason-label')}
            </label>
            <textarea
              id="news-unpublish-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder={t('admin.news.unpublish.reason-placeholder')}
            />
            <div
              className={cn(
                'text-sm',
                trimmed.length < REASON_MIN ? 'text-muted-foreground' : 'text-success-700 dark:text-success-400',
              )}
            >
              {t('admin.news.unpublish.reason-counter').replace('{count}', String(trimmed.length))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              onConfirm(trimmed);
              onOpenChange(false);
            }}
          >
            {t('admin.news.unpublish.action')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
