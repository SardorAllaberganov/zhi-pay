import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SchemeLogo } from '@/components/zhipay/SchemeLogo';
import { MaskedPan } from '@/components/zhipay/MaskedPan';
import { Lock, Unlock, ShieldCheck } from 'lucide-react';
import { CardActionDialog } from '../modals/CardActionDialog';
import {
  getUserCards,
  freezeCard,
  unfreezeCard,
  CURRENT_USER_ADMIN,
  type UserCardEntry,
  type UserListRow,
} from '@/data/mockUsers';
import { cn, formatDate } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

interface Props {
  user: UserListRow;
}

const TIER_MAX_CARDS: Record<UserListRow['tier'], number> = {
  tier_0: 1,
  tier_1: 2,
  tier_2: 5,
};

export function UserCardsTab({ user }: Props) {
  const [version, setVersion] = useState(0);
  const cards = getUserCards(user.id);
  const [target, setTarget] = useState<{ card: UserCardEntry; mode: 'freeze' | 'unfreeze' } | null>(null);

  function handleSubmit(reason: string) {
    if (!target) return;
    if (target.mode === 'freeze') {
      freezeCard(user.id, target.card.id, reason, CURRENT_USER_ADMIN);
      toast.success(t('admin.users.action.freeze-card.success', { pan: target.card.maskedPan }));
    } else {
      unfreezeCard(user.id, target.card.id, reason, CURRENT_USER_ADMIN);
      toast.success(t('admin.users.action.unfreeze-card.success', { pan: target.card.maskedPan }));
    }
    setTarget(null);
    setVersion((v) => v + 1);
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center">
          <h3 className="text-base font-medium">{t('admin.users.detail.cards.empty-title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.users.detail.cards.empty-body')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const max = TIER_MAX_CARDS[user.tier];

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        {t('admin.users.detail.cards.usage', { used: cards.length, max })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" key={version}>
        {cards.map((card) => (
          <CardTile
            key={card.id}
            card={card}
            onFreeze={() => setTarget({ card, mode: 'freeze' })}
            onUnfreeze={() => setTarget({ card, mode: 'unfreeze' })}
          />
        ))}
      </div>

      <CardActionDialog
        open={target !== null}
        onOpenChange={(o) => {
          if (!o) setTarget(null);
        }}
        card={target?.card ?? null}
        mode={target?.mode ?? 'freeze'}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

interface TileProps {
  card: UserCardEntry;
  onFreeze: () => void;
  onUnfreeze: () => void;
}

function CardTile({ card, onFreeze, onUnfreeze }: TileProps) {
  const isFrozen = card.status === 'frozen';
  const isExpired = card.status === 'expired';
  const isRemoved = card.status === 'removed';

  return (
    <div
      className={cn(
        'rounded-md border bg-card text-card-foreground shadow-sm p-4',
        (isFrozen || isExpired || isRemoved) && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <SchemeLogo scheme={card.scheme} className="h-8 w-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{card.bank}</span>
            {card.isDefault && (
              <span className="inline-flex items-center rounded-full bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-600 px-2 h-5 text-xs font-medium">
                <ShieldCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                {t('admin.users.detail.cards.default')}
              </span>
            )}
            {isFrozen && (
              <span className="inline-flex items-center rounded-full bg-warning-50 dark:bg-warning-700/15 text-warning-700 dark:text-warning-600 px-2 h-5 text-xs font-medium">
                <Lock className="h-3 w-3 mr-1" aria-hidden="true" />
                {t('admin.users.detail.cards.frozen')}
              </span>
            )}
          </div>
          <div className="mt-1.5">
            <MaskedPan value={card.maskedPan} scheme={card.scheme} hideScheme />
          </div>
          <div className="mt-1 text-sm text-muted-foreground tabular">
            {t('admin.users.detail.cards.expires', {
              month: String(card.expiryMonth).padStart(2, '0'),
              year: String(card.expiryYear).slice(-2),
            })}
          </div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {t('admin.users.detail.cards.added-on', { date: formatDate(card.createdAt) })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isFrozen ? (
          <Button size="sm" variant="outline" onClick={onUnfreeze}>
            <Unlock className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {t('admin.users.action.unfreeze-card.cta')}
          </Button>
        ) : !isExpired && !isRemoved ? (
          <Button size="sm" variant="outline" onClick={onFreeze}>
            <Lock className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            {t('admin.users.action.freeze-card.cta')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
