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
  onSubmit: (url: string, alt: string) => void;
}

export function InlineImageDialog({ open, onOpenChange, onSubmit }: Props) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');

  useEffect(() => {
    if (!open) {
      setUrl('');
      setAlt('');
    }
  }, [open]);

  const trimmed = url.trim();
  const valid = /^https?:\/\/\S+/i.test(trimmed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{t('admin.news.editor.image-dialog.title')}</DialogTitle>
          <DialogDescription>{t('admin.news.editor.image-dialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="news-inline-img-url">{t('admin.news.editor.image-dialog.url-label')}</Label>
            <Input
              id="news-inline-img-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://cdn.example.com/photo.jpg"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="news-inline-img-alt">{t('admin.news.editor.image-dialog.alt-label')}</Label>
            <Input
              id="news-inline-img-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder={t('admin.news.editor.image-dialog.alt-placeholder')}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              onSubmit(trimmed, alt.trim());
              onOpenChange(false);
            }}
          >
            {t('admin.news.editor.image-dialog.insert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
