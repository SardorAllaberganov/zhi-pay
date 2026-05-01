import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DestinationBadge } from '@/components/zhipay/DestinationBadge';
import { RecipientActionBar } from '@/components/recipients/RecipientActionBar';
import { DisplayInfoCard } from '@/components/recipients/cards/DisplayInfoCard';
import { OwnerCard } from '@/components/recipients/cards/OwnerCard';
import { UsageCard } from '@/components/recipients/cards/UsageCard';
import { HardDeleteRecipientDialog } from '@/components/recipients/modals/HardDeleteRecipientDialog';
import {
  getRecipientById,
  getRecipientTransfers,
  type RecipientEntry,
} from '@/data/mockRecipients';
import {
  CURRENT_USER_ADMIN,
  getUserById,
  hardDeleteRecipient as usersHardDelete,
} from '@/data/mockUsers';
import { cn, formatRelative, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export function RecipientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);

  const recipient = useMemo<RecipientEntry | undefined>(
    () => (id ? getRecipientById(id) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, version],
  );

  const owner = useMemo(
    () => (recipient ? getUserById(recipient.userId) : undefined),
    [recipient],
  );

  const transfers = useMemo(
    () => (recipient ? getRecipientTransfers(recipient) : []),
    [recipient],
  );

  const [deleteOpen, setDeleteOpen] = useState(false);

  function back() {
    navigate('/customers/recipients');
  }

  function handleDelete(reason: string) {
    if (!recipient) return;
    const updated = usersHardDelete(
      recipient.userId,
      recipient.id,
      reason,
      CURRENT_USER_ADMIN,
    );
    if (updated) {
      toast.success(t('admin.recipients.toast.deleted'));
      // Recipient is now soft-deleted on the data side; navigate back to
      // the list so the user isn't stuck on an orphaned detail page.
      navigate('/customers/recipients');
    } else {
      toast.error(t('admin.recipients.toast.delete-failed'));
      setVersion((v) => v + 1);
    }
  }

  // Page-scoped hotkeys: Backspace / b — back; Delete — open delete confirm.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Backspace' || e.key === 'b') {
        e.preventDefault();
        back();
        return;
      }
      if (!recipient) return;
      if (e.key === 'Delete') {
        e.preventDefault();
        setDeleteOpen(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recipient],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Recipient not found
  if (!recipient) {
    return (
      <div className="space-y-4">
        <BackButton onClick={back} />
        <Card>
          <CardContent className="px-6 py-12 text-center">
            <AlertTriangle
              className="h-8 w-8 text-warning-700 dark:text-warning-600 mx-auto mb-3"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold">
              {t('admin.recipients.detail.not-found.title')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('admin.recipients.detail.not-found.body', { id: id ?? '' })}
            </p>
            <Button variant="outline" size="sm" onClick={back} className="mt-4">
              {t('admin.recipients.detail.not-found.cta')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Detail-page header — inline (NOT sticky) per LESSONS 2026-05-02
          (detail-page-header consistency). Structure: back-link / identity
          row / chips. */}
      <header className="space-y-3">
        <BackButton onClick={back} />
        <div className="flex flex-wrap items-center gap-3">
          <DestinationBadge destination={recipient.destination} />
          <span className="text-base font-semibold tabular font-mono break-all">
            {recipient.identifier}
          </span>
          <span className="text-base text-muted-foreground">
            {recipient.displayName}
          </span>
          {recipient.isFavorite && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 dark:bg-warning-700/15 text-warning-700 dark:text-warning-600 px-2.5 h-6 text-xs font-medium"
              aria-label={t('admin.recipients.favorite')}
            >
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
              {t('admin.recipients.favorite')}
            </span>
          )}
        </div>
        {/* Chips row — created / last-used / nickname */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground tabular">
          <span>
            {t('admin.recipients.detail.chip.created', {
              value: formatDate(recipient.createdAt),
            })}
          </span>
          <span>
            {t('admin.recipients.detail.chip.last-used', {
              value: formatRelative(recipient.lastUsedAt),
            })}
          </span>
          {recipient.nickname && (
            <span className="italic">
              {t('admin.recipients.detail.chip.nickname', {
                value: recipient.nickname,
              })}
            </span>
          )}
        </div>
      </header>

      {/* 2-col on desktop, single col on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DisplayInfoCard recipient={recipient} />
        <OwnerCard owner={owner} />
      </div>

      <UsageCard recipient={recipient} transfers={transfers} />

      {/* Fixed-bottom action bar — escapes <main>'s padding via the
          AppShell's `--sidebar-width` CSS var. */}
      <RecipientActionBar onDelete={() => setDeleteOpen(true)} />

      <HardDeleteRecipientDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        recipient={recipient}
        onSubmit={handleDelete}
      />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {t('admin.recipients.detail.back')}
    </button>
  );
}
