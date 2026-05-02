import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EntryCard } from '@/components/blacklist/EntryCard';
import { ImpactCard } from '@/components/blacklist/ImpactCard';
import { BlacklistActionBar } from '@/components/blacklist/ActionBar';
import { SeverityChip } from '@/components/blacklist/SeverityChip';
import { StatusChip } from '@/components/blacklist/StatusChip';
import { IdentityCell } from '@/components/blacklist/IdentityCell';
import { EditReasonDialog } from '@/components/blacklist/modals/EditReasonDialog';
import { ExtendExpiryDialog } from '@/components/blacklist/modals/ExtendExpiryDialog';
import { RemoveEntryDialog } from '@/components/blacklist/modals/RemoveEntryDialog';
import {
  BLACKLIST_ADMIN_POOL,
  editBlacklistReason,
  extendBlacklistExpiry,
  getBlacklistEntry,
  removeBlacklistEntry,
  type BlacklistEntry,
} from '@/data/mockBlacklist';
import { t } from '@/lib/i18n';

const ACTOR = BLACKLIST_ADMIN_POOL[0];

const TYPE_LABEL_KEY: Record<BlacklistEntry['type'], string> = {
  phone: 'admin.blacklist.type.phone',
  pinfl: 'admin.blacklist.type.pinfl',
  device_id: 'admin.blacklist.type.device',
  ip: 'admin.blacklist.type.ip',
  card_token: 'admin.blacklist.type.card-token',
};

export function BlacklistDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [editReasonOpen, setEditReasonOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const tid = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(tid);
  }, [id]);

  const entry = useMemo(
    () => getBlacklistEntry(id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, version],
  );

  // Page-scoped hotkeys.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Backspace' || e.key === 'b') {
        e.preventDefault();
        navigate('/compliance/blacklist');
        return;
      }
      if (e.key === 'Delete') {
        e.preventDefault();
        setRemoveOpen(true);
      }
    },
    [navigate],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="space-y-4 pb-28">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-7 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-4 pb-28">
        <Link
          to="/compliance/blacklist"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('admin.blacklist.detail.back')}
        </Link>
        <div className="rounded-md border border-border bg-card px-6 py-12 text-center space-y-3">
          <p className="text-sm">{t('admin.blacklist.detail.not-found')}</p>
          <Button variant="outline" onClick={() => navigate('/compliance/blacklist')}>
            {t('admin.blacklist.detail.back')}
          </Button>
        </div>
      </div>
    );
  }

  function commitEditReason(newReason: string, changeNote: string) {
    const updated = editBlacklistReason({
      entryId: entry!.id,
      newReason,
      changeNote,
      actor: ACTOR,
    });
    setEditReasonOpen(false);
    if (updated) {
      setVersion((v) => v + 1);
      toast.success(t('admin.blacklist.toast.edit-reason.title'));
    } else {
      toast.error(t('admin.blacklist.toast.edit-reason.error'));
    }
  }

  function commitExtendExpiry(newExpiresAt: Date | null) {
    const updated = extendBlacklistExpiry({
      entryId: entry!.id,
      newExpiresAt,
      actor: ACTOR,
    });
    setExtendOpen(false);
    if (updated) {
      setVersion((v) => v + 1);
      toast.success(t('admin.blacklist.toast.extend.title'));
    } else {
      toast.error(t('admin.blacklist.toast.extend.error'));
    }
  }

  function commitRemove(reason: string) {
    const removed = removeBlacklistEntry({
      entryId: entry!.id,
      reason,
      actor: ACTOR,
    });
    setRemoveOpen(false);
    if (removed) {
      toast.success(t('admin.blacklist.toast.removed.title'));
      navigate(`/compliance/blacklist?type=${entry!.type}`);
    } else {
      toast.error(t('admin.blacklist.toast.removed.error'));
    }
  }

  return (
    <div className="space-y-4 pb-28">
      <Link
        to={`/compliance/blacklist?type=${entry.type}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('admin.blacklist.detail.back')}
      </Link>

      <header className="space-y-3 lg:space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-sm bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t(TYPE_LABEL_KEY[entry.type])}
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            <IdentityCell type={entry.type} identifier={entry.identifier} />
          </h1>
          <SeverityChip severity={entry.severity} />
          <StatusChip entry={entry} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EntryCard entry={entry} />
        <ImpactCard entry={entry} />
      </div>

      <BlacklistActionBar
        onEditReason={() => setEditReasonOpen(true)}
        onExtendExpiry={() => setExtendOpen(true)}
        onRemove={() => setRemoveOpen(true)}
      />

      <EditReasonDialog
        open={editReasonOpen}
        onOpenChange={setEditReasonOpen}
        currentReason={entry.reason}
        onConfirm={commitEditReason}
      />
      <ExtendExpiryDialog
        open={extendOpen}
        onOpenChange={setExtendOpen}
        currentExpiresAt={entry.expiresAt}
        onConfirm={commitExtendExpiry}
      />
      <RemoveEntryDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onConfirm={commitRemove}
      />
    </div>
  );
}
