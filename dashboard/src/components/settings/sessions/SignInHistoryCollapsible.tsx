import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
import { useMySignInHistory } from '@/lib/auth';
import { cn, formatDateTime, formatRelative } from '@/lib/utils';
import { t } from '@/lib/i18n';

export function SignInHistoryCollapsible() {
  const [open, setOpen] = useState(false);
  const history = useMySignInHistory(30);

  return (
    <Card className="overflow-hidden">
      {/* Clickable header — fills the Card's normal CardHeader padding
          (p-5) so the closed state looks like every other card. The
          chevron sits on the right rail. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-5 py-4 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          'hover:bg-muted/30 transition-colors',
        )}
        aria-expanded={open}
        aria-controls="signin-history-body"
      >
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-tight">
            {t('admin.settings.sessions.history.title')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin.settings.sessions.history.subtitle').replace(
              '{n}',
              String(history.length),
            )}
          </p>
        </div>
        {open ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <div id="signin-history-body" className="border-t border-border">
          {/* Desktop table — non-sticky thead per LESSON 2026-04-30.
              Table is flush to the card edges; cells provide their own
              horizontal padding via the primitive (px-3). */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[1%]">
                    <span className="sr-only">{t('admin.settings.sessions.history.column.outcome')}</span>
                  </TableHead>
                  <TableHead>{t('admin.settings.sessions.history.column.when')}</TableHead>
                  <TableHead>{t('admin.settings.sessions.history.column.ip')}</TableHead>
                  <TableHead>{t('admin.settings.sessions.history.column.device')}</TableHead>
                  <TableHead>{t('admin.settings.sessions.history.column.outcome')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => {
                  const success = row.eventType === 'signin_success';
                  const Icon = success ? CheckCircle2 : XCircle;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="pl-4">
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            success ? 'text-success-600' : 'text-danger-600',
                          )}
                          aria-hidden="true"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-foreground">
                              {formatRelative(row.createdAt)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{formatDateTime(row.createdAt)}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-foreground">{row.ipAddress}</span>
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <span className="text-sm text-muted-foreground truncate block">
                          {row.userAgent.slice(0, 60)}
                          {row.userAgent.length > 60 ? '…' : ''}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            success ? 'text-success-700' : 'text-danger-700',
                          )}
                        >
                          {success
                            ? t('admin.settings.sessions.history.outcome.success')
                            : t('admin.settings.sessions.history.outcome.failed')}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile stacked rows */}
          <ul className="block md:hidden divide-y divide-border">
            {history.map((row) => {
              const success = row.eventType === 'signin_success';
              const Icon = success ? CheckCircle2 : XCircle;
              return (
                <li key={row.id} className="px-4 py-3 flex items-start gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 mt-0.5 shrink-0',
                      success ? 'text-success-600' : 'text-danger-600',
                    )}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          success ? 'text-success-700' : 'text-danger-700',
                        )}
                      >
                        {success
                          ? t('admin.settings.sessions.history.outcome.success')
                          : t('admin.settings.sessions.history.outcome.failed')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatRelative(row.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      <span className="font-mono">{row.ipAddress}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
