import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { revokeMyOtherSessions, revokeMySession, useMyActiveSessions, useSession } from '@/lib/auth';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AdminSession } from '@/data/mockAdminAuth';
import { DeviceIcon } from './DeviceIcon';
import { RevokeSessionDialog } from './RevokeSessionDialog';
import { RevokeAllDialog } from './RevokeAllDialog';

export function ActiveSessionsList() {
  const session = useSession();
  const sessions = useMyActiveSessions();
  const [pendingRevoke, setPendingRevoke] = useState<AdminSession | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  if (!session) return null;
  const currentId = session.id;
  const otherCount = sessions.filter((s) => s.id !== currentId).length;

  const doRevoke = (s: AdminSession) => {
    const result = revokeMySession(s.id);
    if (result.ok) {
      toast.success(t('admin.settings.sessions.toast.revoked'));
    } else {
      toast.error(t('admin.settings.sessions.toast.error'));
    }
    setPendingRevoke(null);
  };

  const doRevokeAll = () => {
    const result = revokeMyOtherSessions();
    if (result.ok) {
      toast.success(
        t('admin.settings.sessions.toast.revoked-all').replace('{n}', String(result.count ?? 0)),
      );
    } else {
      toast.error(t('admin.settings.sessions.toast.error'));
    }
    setRevokeAllOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{t('admin.settings.sessions.active.title')}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {sessions.length === 1
              ? t('admin.settings.sessions.active.subtitle.one')
              : t('admin.settings.sessions.active.subtitle.many').replace(
                  '{n}',
                  String(sessions.length),
                )}
          </p>
        </div>
        {otherCount > 0 ? (
          <Button
            variant="outline"
            className="text-warning-700 hover:text-warning-700"
            onClick={() => setRevokeAllOpen(true)}
          >
            {t('admin.settings.sessions.active.action.revoke-all')}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="p-0">
        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.settings.sessions.column.device')}</TableHead>
                <TableHead>{t('admin.settings.sessions.column.ip')}</TableHead>
                <TableHead>{t('admin.settings.sessions.column.signed-in')}</TableHead>
                <TableHead>{t('admin.settings.sessions.column.last-activity')}</TableHead>
                <TableHead className="w-[1%] text-right pr-4">
                  <span className="sr-only">
                    {t('admin.settings.sessions.column.actions')}
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => {
                const isCurrent = s.id === currentId;
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <DeviceIcon device={s.device} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground flex items-center gap-2">
                            {s.browser}
                            {isCurrent ? (
                              <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">
                                {t('admin.settings.sessions.active.this-device')}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-sm text-muted-foreground">{s.os}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono text-foreground">{s.ipAddress}</div>
                      {s.geoCity ? (
                        <div className="text-sm text-muted-foreground">{s.geoCity}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-foreground">
                            {formatRelative(s.createdAt)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{formatDateTime(s.createdAt)}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-foreground">
                            {formatRelative(s.lastSeenAt)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{formatDateTime(s.lastSeenAt)}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isCurrent}
                        onClick={() => setPendingRevoke(s)}
                        className={cn(!isCurrent && 'text-warning-700 hover:text-warning-700')}
                      >
                        {t('admin.settings.sessions.active.action.revoke')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile stacked cards */}
        <ul className="block md:hidden divide-y divide-border">
          {sessions.map((s) => {
            const isCurrent = s.id === currentId;
            return (
              <li key={s.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <DeviceIcon device={s.device} className="mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {s.browser}
                        {isCurrent ? (
                          <span className="ml-2 inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">
                            {t('admin.settings.sessions.active.this-device')}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-sm text-muted-foreground">{s.os}</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">
                      {t('admin.settings.sessions.column.ip')}
                    </div>
                    <div className="font-mono text-foreground">{s.ipAddress}</div>
                    {s.geoCity ? (
                      <div className="text-muted-foreground">{s.geoCity}</div>
                    ) : null}
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {t('admin.settings.sessions.column.last-activity')}
                    </div>
                    <div className="text-foreground">{formatRelative(s.lastSeenAt)}</div>
                  </div>
                </div>
                {!isCurrent ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-warning-700 hover:text-warning-700"
                    onClick={() => setPendingRevoke(s)}
                  >
                    {t('admin.settings.sessions.active.action.revoke')}
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </CardContent>

      <RevokeSessionDialog
        session={pendingRevoke}
        onOpenChange={(open) => {
          if (!open) setPendingRevoke(null);
        }}
        onConfirm={() => pendingRevoke && doRevoke(pendingRevoke)}
      />
      <RevokeAllDialog
        open={revokeAllOpen}
        onOpenChange={setRevokeAllOpen}
        count={otherCount}
        onConfirm={doRevokeAll}
      />
    </Card>
  );
}
