import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { UserAvatar } from '@/components/users/UserAvatar';
import { UserStatusBadge } from '@/components/users/UsersTable';
import { maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserListRow } from '@/data/mockUsers';

interface Props {
  owner: UserListRow | undefined;
}

export function CardOwnerCard({ owner }: Props) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('admin.cards.detail.section.owner')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!owner ? (
          <div className="text-sm text-muted-foreground italic">
            {t('admin.cards.detail.owner.unknown')}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <UserAvatar name={owner.name} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{owner.name}</div>
                {owner.pinfl ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider mr-1">
                      {t('admin.cards.detail.owner.pinfl')}
                    </span>
                    <span className="tabular font-mono">{maskPinfl(owner.pinfl)}</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    {t('admin.cards.detail.owner.pinfl-not-verified')}
                  </div>
                )}
                <div className="mt-1 text-sm tabular">{owner.phone}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={owner.tier} />
              <UserStatusBadge status={owner.status} />
            </div>

            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/customers/users/${owner.id}`)}
              >
                {t('admin.cards.detail.owner.open-profile')}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
