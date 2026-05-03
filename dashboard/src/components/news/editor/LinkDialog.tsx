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
import { t } from '@/lib/i18n';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl: string;
  onSubmit: (url: string) => void;
  onRemove?: () => void;
  hasExistingLink: boolean;
}

export function LinkDialog({ open, onOpenChange, initialUrl, onSubmit, onRemove, hasExistingLink }: Props) {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    if (open) setUrl(initialUrl);
  }, [open, initialUrl]);

  const trimmed = url.trim();
  const valid = /^https?:\/\/\S+/i.test(trimmed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{t('admin.news.editor.link-dialog.title')}</DialogTitle>
          <DialogDescription>{t('admin.news.editor.link-dialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="news-link-url">{t('admin.news.editor.link-dialog.url-label')}</Label>
          <Input
            id="news-link-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
          />
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          {hasExistingLink && onRemove ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onRemove();
                onOpenChange(false);
              }}
              className="text-danger-700 hover:text-danger-800 hover:bg-danger-50"
            >
              {t('admin.news.editor.link-dialog.remove')}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              disabled={!valid}
              onClick={() => {
                onSubmit(trimmed);
                onOpenChange(false);
              }}
            >
              {t('admin.news.editor.link-dialog.apply')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
