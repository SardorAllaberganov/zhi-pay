import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { StatusBadge } from '@/components/zhipay/StatusBadge';
import { ShieldCheck } from 'lucide-react';
import {
  getUserKycHistory,
  getUserMyIdResponse,
  type UserListRow,
} from '@/data/mockUsers';
import { MyIdProfileCard } from '../cards/MyIdProfileCard';
import { formatDate, formatRelative, maskDocNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';

interface Props {
  user: UserListRow;
  onReverify: () => void;
}

export function UserKycTab({ user, onReverify }: Props) {
  const history = getUserKycHistory(user.id);
  const passed = history.find((h) => h.status === 'passed');
  const myidResponse = getUserMyIdResponse(user.id);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.detail.kyc.current-tier')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {passed ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <TierBadge tier={user.tier} />
                <span className="text-sm text-muted-foreground">
                  {t('admin.users.detail.kyc.attained-via', {
                    method: passed.documentType === 'passport'
                      ? t('admin.kyc-queue.detail.identity.doc-passport')
                      : t('admin.kyc-queue.detail.identity.doc-id-card'),
                  })}
                </span>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t('admin.users.detail.kyc.verified-at')}
                  </dt>
                  <dd className="mt-0.5">
                    {passed.verifiedAt ? formatDate(passed.verifiedAt) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t('admin.users.detail.kyc.expires-at')}
                  </dt>
                  <dd className="mt-0.5">
                    {passed.expiresAt ? formatDate(passed.expiresAt) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t('admin.users.detail.kyc.doc-number')}
                  </dt>
                  <dd className="mt-0.5 tabular font-mono">
                    {maskDocNumber(passed.documentNumber)}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('admin.users.detail.kyc.no-current-tier')}
            </p>
          )}
          <div className="pt-1">
            <Button variant="outline" size="sm" onClick={onReverify}>
              <ShieldCheck className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t('admin.users.action.reverify-kyc')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {myidResponse && <MyIdProfileCard response={myidResponse} />}

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.detail.kyc.history-title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground text-center">
              {t('admin.users.detail.kyc.history-empty')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.users.detail.kyc.col.status')}</TableHead>
                  <TableHead>{t('admin.users.detail.kyc.col.doc-type')}</TableHead>
                  <TableHead>{t('admin.users.detail.kyc.col.submitted')}</TableHead>
                  <TableHead>{t('admin.users.detail.kyc.col.verified')}</TableHead>
                  <TableHead>{t('admin.users.detail.kyc.col.expires')}</TableHead>
                  <TableHead>{t('admin.users.detail.kyc.col.failure')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <StatusBadge status={h.status} domain="kyc" />
                    </TableCell>
                    <TableCell className="text-sm">
                      {h.documentType === 'passport'
                        ? t('admin.kyc-queue.detail.identity.doc-passport')
                        : t('admin.kyc-queue.detail.identity.doc-id-card')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelative(h.submittedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {h.verifiedAt ? formatDate(h.verifiedAt) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {h.expiresAt ? formatDate(h.expiresAt) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {h.failureReason ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
