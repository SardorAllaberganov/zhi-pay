import { Plus, StickyNote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { InternalNote, NoteTag } from '@/data/mockTransferDetail';

interface Props {
  notes: InternalNote[];
  onAdd: () => void;
}

const TAG_TONE: Record<NoteTag, string> = {
  compliance:
    'border-brand-600/30 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300',
  fraud:
    'border-danger-600/30 bg-danger-50 text-danger-700 dark:bg-danger-700/15 dark:text-danger-600',
  'customer-support':
    'border-success-600/30 bg-success-50 text-success-700 dark:bg-success-700/15 dark:text-success-600',
  general:
    'border-border bg-muted text-muted-foreground',
};

export function InternalNotesCard({ notes, onAdd }: Props) {
  const sorted = [...notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t('admin.transfer-detail.notes.title')}
          {sorted.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground tabular">
              ({sorted.length})
            </span>
          )}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {t('admin.transfer-detail.notes.add')}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {sorted.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            {t('admin.transfer-detail.notes.empty')}
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((n) => (
              <li
                key={n.id}
                className="flex gap-3 rounded-md border border-border bg-card p-3"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-brand-50 text-brand-700 text-xs dark:bg-brand-950/40 dark:text-brand-300">
                    {n.authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{n.authorName}</span>
                    <span className="text-sm text-muted-foreground">{n.authorRole}</span>
                    <span className="text-sm text-muted-foreground tabular">
                      · {formatRelative(n.createdAt)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TAG_TONE[n.tag]}`}
                    >
                      {t(`admin.transfer-detail.notes.tag.${n.tag}`)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap break-words">
                    {n.body}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
