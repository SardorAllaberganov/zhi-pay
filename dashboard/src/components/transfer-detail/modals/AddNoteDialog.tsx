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
import { Textarea } from './Textarea';
import { t } from '@/lib/i18n';
import type { NoteTag } from '@/data/mockTransferDetail';

const TAGS: NoteTag[] = ['compliance', 'fraud', 'customer-support', 'general'];

export interface AddNoteSubmit {
  body: string;
  tag: NoteTag;
}

interface Props {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onSubmit: (payload: AddNoteSubmit) => void;
}

export function AddNoteDialog({ open, onOpenChange, onSubmit }: Props) {
  const [body, setBody] = useState('');
  const [tag, setTag] = useState<NoteTag>('general');

  useEffect(() => {
    if (open) {
      setBody('');
      setTag('general');
    }
  }, [open]);

  const valid = body.trim().length >= 5 && body.trim().length <= 1000;

  function submit() {
    if (!valid) return;
    onSubmit({ body: body.trim(), tag });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.transfer-detail.action.add-note.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.transfer-detail.action.add-note.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="note-body">
              {t('admin.transfer-detail.action.add-note.body')}
            </Label>
            <Textarea
              id="note-body"
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('admin.transfer-detail.action.add-note.body-placeholder')}
              rows={5}
            />
            <div className="text-sm text-muted-foreground tabular">
              {body.trim().length} / 1000
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note-tag">{t('admin.transfer-detail.action.add-note.tag')}</Label>
            <select
              id="note-tag"
              value={tag}
              onChange={(e) => setTag(e.target.value as NoteTag)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {TAGS.map((tg) => (
                <option key={tg} value={tg}>
                  {t(`admin.transfer-detail.notes.tag.${tg}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {t('admin.transfer-detail.action.add-note.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
