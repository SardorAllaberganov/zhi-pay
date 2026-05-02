import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserHeader } from '@/components/users/UserHeader';
import { UserTabs, USER_TAB_KEYS, type UserTabKey } from '@/components/users/UserTabs';
import { UserOverviewTab } from '@/components/users/tabs/UserOverviewTab';
import { UserKycTab } from '@/components/users/tabs/UserKycTab';
import { UserCardsTab } from '@/components/users/tabs/UserCardsTab';
import { UserTransfersTab } from '@/components/users/tabs/UserTransfersTab';
import { UserRecipientsTab } from '@/components/users/tabs/UserRecipientsTab';
import { UserAmlTab } from '@/components/users/tabs/UserAmlTab';
import { UserDevicesTab } from '@/components/users/tabs/UserDevicesTab';
import { UserAuditTab } from '@/components/users/tabs/UserAuditTab';
import { UserActionDialog, type UserDialogAction } from '@/components/users/modals/UserActionDialog';
import { GenerateAuditReportDialog } from '@/components/users/modals/GenerateAuditReportDialog';
import type { UserAdminAction } from '@/components/users/UserAdminMenu';
import {
  getUserById,
  getUserKycHistory,
  getUserOpenAmlFlagCount,
  blockUser,
  unblockUser,
  softDeleteUser,
  recordReverifyKyc,
  recordBlacklistPhone,
  resetDeviceTrust,
  recordGenerateAuditReport,
  CURRENT_USER_ADMIN,
} from '@/data/mockUsers';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [version, setVersion] = useState(0);

  const user = useMemo(() => (id ? getUserById(id) : undefined), [id, version]);

  const tabFromUrl = searchParams.get('tab') as UserTabKey | null;
  const activeTab: UserTabKey =
    tabFromUrl && USER_TAB_KEYS.includes(tabFromUrl) ? tabFromUrl : 'overview';

  const [dialog, setDialog] = useState<UserDialogAction | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const amlCount = user ? getUserOpenAmlFlagCount(user.id) : 0;
  const kycHistory = user ? getUserKycHistory(user.id) : [];
  const passedKyc = kycHistory.find((k) => k.status === 'passed');

  // Handle ?action=block|unblock from list-page kebab
  useEffect(() => {
    const action = searchParams.get('action');
    if (!action) return;
    if (action === 'block') setDialog('block');
    else if (action === 'unblock') setDialog('unblock');
    // Clear the param so it doesn't re-fire
    const next = new URLSearchParams(searchParams);
    next.delete('action');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Number-key tab jumps (1..8) — only on lg+ viewports
  const handleNumKey = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= USER_TAB_KEYS.length) {
        e.preventDefault();
        const next = USER_TAB_KEYS[num - 1];
        const sp = new URLSearchParams(searchParams);
        sp.set('tab', next);
        setSearchParams(sp);
      } else if (e.key === 'b' && user && user.status === 'active') {
        e.preventDefault();
        setDialog('block');
      } else if (e.key === 'e') {
        e.preventDefault();
        const sp = new URLSearchParams(searchParams);
        sp.set('tab', 'audit');
        setSearchParams(sp);
      }
    },
    [searchParams, setSearchParams, user],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleNumKey);
    return () => window.removeEventListener('keydown', handleNumKey);
  }, [handleNumKey]);

  if (!user) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center">
          <h2 className="text-lg font-medium">{t('admin.users.detail.not-found.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.users.detail.not-found.body')}
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/customers/users')}>
              {t('admin.users.detail.back-to-list')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  function setTab(key: UserTabKey) {
    const sp = new URLSearchParams(searchParams);
    sp.set('tab', key);
    setSearchParams(sp);
  }

  function handleAdminAction(action: UserAdminAction) {
    if (!user) return;
    if (action === 'blacklist_phone') {
      // Pre-fill blacklist form — Blacklist Add page reads `type` + `identifier`.
      navigate(
        `/compliance/blacklist/new?type=phone&identifier=${encodeURIComponent(user.phone)}&user_id=${user.id}`,
      );
      recordBlacklistPhone(user.id, 'Admin opened blacklist form from user detail', CURRENT_USER_ADMIN);
      return;
    }
    if (action === 'generate_audit_report') {
      setReportOpen(true);
      return;
    }
    setDialog(action);
  }

  function handleDialogSubmit(reason: string) {
    if (!dialog || !user) return;
    if (dialog === 'block') {
      const result = blockUser(user.id, reason, CURRENT_USER_ADMIN);
      const frozen = result.frozenCardIds.length;
      toast.success(t('admin.users.action.block.success', { name: user.name }), {
        description:
          frozen > 0
            ? t('admin.users.action.block.success-cards', { count: frozen })
            : undefined,
      });
    } else if (dialog === 'unblock') {
      unblockUser(user.id, reason, CURRENT_USER_ADMIN);
      toast.success(t('admin.users.action.unblock.success', { name: user.name }));
    } else if (dialog === 'soft_delete') {
      softDeleteUser(user.id, reason, CURRENT_USER_ADMIN);
      toast.success(t('admin.users.action.soft-delete.success', { name: user.name }));
    } else if (dialog === 'reverify_kyc') {
      recordReverifyKyc(user.id, reason, CURRENT_USER_ADMIN);
      toast.success(t('admin.users.action.reverify-kyc.success', { name: user.name }));
    } else if (dialog === 'reset_devices') {
      const result = resetDeviceTrust(user.id, reason, CURRENT_USER_ADMIN);
      toast.success(t('admin.users.action.reset-devices.success'), {
        description: t('admin.users.action.reset-devices.success-body', { count: result.count }),
      });
    }
    setDialog(null);
    setVersion((v) => v + 1);
  }

  function handleReportSubmit(payload: { from: Date; to: Date; reason: string }) {
    if (!user) return;
    recordGenerateAuditReport(user.id, payload.reason, CURRENT_USER_ADMIN, {
      from: payload.from,
      to: payload.to,
    });
    setReportOpen(false);
    // Stub PDF generation: simulate a 1.2s job, then a "ready" toast with a placeholder link
    toast.loading(t('admin.users.action.generate-report.toast-loading'), { id: 'report-gen' });
    setTimeout(() => {
      toast.success(t('admin.users.action.generate-report.toast-ready'), {
        id: 'report-gen',
        description: t('admin.users.action.generate-report.toast-ready-body'),
      });
    }, 1200);
    setVersion((v) => v + 1);
  }

  return (
    <div className="space-y-4">
      <UserHeader
        user={user}
        kycExpiresAt={passedKyc?.expiresAt}
        onAction={handleAdminAction}
      />

      <UserTabs active={activeTab} onChange={setTab} amlCount={amlCount} />

      <div className="pt-2">
        {activeTab === 'overview' && <UserOverviewTab user={user} />}
        {activeTab === 'kyc' && (
          <UserKycTab user={user} onReverify={() => handleAdminAction('reverify_kyc')} />
        )}
        {activeTab === 'cards' && <UserCardsTab user={user} />}
        {activeTab === 'transfers' && <UserTransfersTab user={user} />}
        {activeTab === 'recipients' && <UserRecipientsTab user={user} />}
        {activeTab === 'aml' && <UserAmlTab user={user} />}
        {activeTab === 'devices' && <UserDevicesTab user={user} />}
        {activeTab === 'audit' && <UserAuditTab user={user} />}
      </div>

      <UserActionDialog
        open={dialog !== null}
        onOpenChange={(o) => {
          if (!o) setDialog(null);
        }}
        user={user}
        action={dialog ?? 'block'}
        onSubmit={handleDialogSubmit}
      />

      <GenerateAuditReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        userName={user.name}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}
