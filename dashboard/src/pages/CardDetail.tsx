import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { CardStatusPill } from '@/components/cards/CardsTable';
import { CardActionBar } from '@/components/cards/CardActionBar';
import { CardDetailsCard } from '@/components/cards/cards/CardDetailsCard';
import { CardOwnerCard } from '@/components/cards/cards/CardOwnerCard';
import { CardRecentActivityCard } from '@/components/cards/cards/CardRecentActivityCard';
import { PrivacyBanner } from '@/components/cards/cards/PrivacyBanner';
import { FreezeCardDialog } from '@/components/cards/modals/FreezeCardDialog';
import { UnfreezeCardDialog } from '@/components/cards/modals/UnfreezeCardDialog';
import {
  freezeCard,
  getCardById,
  recordTokenCopy,
  unfreezeCard,
  type CardEntry,
  type FreezeSeverity,
} from '@/data/mockCards';
import { CURRENT_USER_ADMIN, getUserById } from '@/data/mockUsers';
import { TRANSFERS_FULL } from '@/data/mockTransfers';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);

  const card = useMemo<CardEntry | undefined>(
    () => (id ? getCardById(id) : undefined),
    // version bumps force re-resolution after a mutator runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, version],
  );

  const owner = useMemo(
    () => (card ? getUserById(card.userId) : undefined),
    [card],
  );

  const transfers = useMemo(
    () => (card ? TRANSFERS_FULL.filter((tx) => tx.cardId === card.id) : []),
    [card],
  );

  const [freezeOpen, setFreezeOpen] = useState(false);
  const [unfreezeOpen, setUnfreezeOpen] = useState(false);

  function handleFreeze({ reason, severity }: { reason: string; severity: FreezeSeverity }) {
    if (!card) return;
    const updated = freezeCard(card.id, reason, severity, CURRENT_USER_ADMIN);
    if (updated) {
      toast.success(t('admin.cards.toast.frozen', { pan: card.maskedPan }));
      setVersion((v) => v + 1);
    } else {
      toast.error(t('admin.cards.toast.action-failed'));
    }
  }

  function handleUnfreeze({ reason }: { reason: string }) {
    if (!card) return;
    const updated = unfreezeCard(card.id, reason, CURRENT_USER_ADMIN);
    if (updated) {
      toast.success(t('admin.cards.toast.unfrozen', { pan: card.maskedPan }));
      setVersion((v) => v + 1);
    } else {
      toast.error(t('admin.cards.toast.action-failed'));
    }
  }

  function handleCopyToken() {
    if (!card) return;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(card.token);
    recordTokenCopy(card.id, CURRENT_USER_ADMIN);
    toast.success(t('admin.cards.toast.token-copied'));
  }

  function handleOpenTransferFlow() {
    if (!card) return;
    navigate(`/operations/transfers?context=card&card_id=${card.id}`);
  }

  function back() {
    navigate('/customers/cards');
  }

  // Page-scoped hotkeys: Backspace / b — back; f — freeze (active);
  // u — unfreeze (frozen); c — copy token.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Backspace' || e.key === 'b') {
        e.preventDefault();
        back();
        return;
      }
      if (!card) return;
      if (e.key === 'f' && card.status === 'active') {
        e.preventDefault();
        setFreezeOpen(true);
        return;
      }
      if (e.key === 'u' && card.status === 'frozen') {
        e.preventDefault();
        setUnfreezeOpen(true);
        return;
      }
      if (e.key === 'c') {
        e.preventDefault();
        handleCopyToken();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Card not found
  if (!card) {
    return (
      <div className="space-y-4">
        <BackButton onClick={back} />
        <Card>
          <CardContent className="px-6 py-12 text-center">
            <AlertTriangle
              className="h-8 w-8 text-warning-700 dark:text-warning-600 mx-auto mb-3"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold">{t('admin.cards.detail.not-found.title')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('admin.cards.detail.not-found.body', { id: id ?? '' })}
            </p>
            <Button variant="outline" size="sm" onClick={back} className="mt-4">
              {t('admin.cards.detail.not-found.cta')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Detail-page header — inline (NOT sticky), matching the User /
          Transfer detail-page convention: back-link first, then identity
          row. See LESSONS 2026-05-02 (detail-page-header consistency). */}
      <header className="space-y-3">
        <BackButton onClick={back} />
        <div className="flex flex-wrap items-center gap-3">
          <SchemeLogo scheme={card.scheme} size="lg" />
          <MaskedPan value={card.maskedPan} scheme={card.scheme} hideScheme size="md" />
          <CardStatusPill status={card.status} />
          {card.isDefault && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-2.5 h-6 text-xs font-medium">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {t('admin.cards.detail.default-badge')}
            </span>
          )}
        </div>
      </header>

      <PrivacyBanner />

      {/* 2-col on desktop, single col on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardDetailsCard card={card} />
        <CardOwnerCard owner={owner} />
      </div>

      <CardRecentActivityCard cardId={card.id} transfers={transfers} />

      {/* Fixed-bottom action bar — escapes <main>'s padding via the
          AppShell's `--sidebar-width` CSS var. */}
      <CardActionBar
        card={card}
        onFreeze={() => setFreezeOpen(true)}
        onUnfreeze={() => setUnfreezeOpen(true)}
        onCopyToken={handleCopyToken}
        onOpenTransferFlow={handleOpenTransferFlow}
      />

      <FreezeCardDialog
        open={freezeOpen}
        onOpenChange={setFreezeOpen}
        card={card}
        onSubmit={handleFreeze}
      />
      <UnfreezeCardDialog
        open={unfreezeOpen}
        onOpenChange={setUnfreezeOpen}
        card={card}
        onSubmit={handleUnfreeze}
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
      {t('admin.cards.detail.back')}
    </button>
  );
}
