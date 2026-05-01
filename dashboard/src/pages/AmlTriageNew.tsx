import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/transfer-detail/modals/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, maskPinfl } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { AmlFlagStatus, AmlSeverity } from '@/types';
import {
  CURRENT_ADMIN,
  appendAmlAudit,
  listAmlUsers,
  nextManualFlagId,
  type AmlFlagType,
  type AmlReview,
} from '@/data/mockAmlTriage';
import { TRANSFERS_FULL } from '@/data/mockTransfers';

const SEVERITIES: AmlSeverity[] = ['info', 'warning', 'critical'];
const TYPES: AmlFlagType[] = ['velocity', 'amount', 'pattern', 'sanctions', 'manual'];

/**
 * Full-page manual-flag form. Per spec — separate route, not a modal.
 *
 * On submit, creates a flag in the in-memory mock store and navigates back
 * to the triage list with the new flag selected.
 */
export function AmlTriageNew() {
  const navigate = useNavigate();

  const [userQuery, setUserQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [transferQuery, setTransferQuery] = useState('');
  const [transferId, setTransferId] = useState<string | null>(null);

  const [severity, setSeverity] = useState<AmlSeverity>('warning');
  const [flagType, setFlagType] = useState<AmlFlagType>('manual');

  const [contextRaw, setContextRaw] = useState('');
  const [contextError, setContextError] = useState<string | null>(null);

  const [note, setNote] = useState('');

  const allUsers = useMemo(() => listAmlUsers(), []);
  const userMatches = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return [];
    return allUsers
      .filter(
        (u) =>
          u.phone.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [allUsers, userQuery]);

  const transferMatches = useMemo(() => {
    const q = transferQuery.trim().toLowerCase();
    if (!q) return [];
    return TRANSFERS_FULL.filter((t) => t.id.toLowerCase().startsWith(q)).slice(0, 6);
  }, [transferQuery]);

  function validateContext(): boolean {
    if (!contextRaw.trim()) {
      setContextError(null);
      return true; // empty is fine — context is optional
    }
    try {
      JSON.parse(contextRaw);
      setContextError(null);
      return true;
    } catch {
      setContextError(t('admin.aml-triage.new.context.invalid-json'));
      return false;
    }
  }

  const noteValid = note.trim().length >= 20;
  const userValid = !!userId;
  const formValid = userValid && noteValid && validateContext() && contextError === null;

  function submit() {
    if (!formValid || !userId) return;

    const id = nextManualFlagId();
    const ctxParsed = contextRaw.trim() ? JSON.parse(contextRaw) : {};
    const newFlag: AmlReview = {
      id,
      userId,
      transferId: transferId ?? undefined,
      flagType,
      severity,
      description: note.trim().slice(0, 80),
      context: {
        filer_admin_id: CURRENT_ADMIN.id,
        filer_admin_name: CURRENT_ADMIN.name,
        filer_note: note.trim(),
        ...ctxParsed,
        // Force `type: 'manual'` even if user wrote a different type in JSON.
        type: 'manual' as const,
      } as AmlReview['context'],
      status: 'open' as AmlFlagStatus,
      assigneeId: undefined,
      assigneeName: undefined,
      resolutionNotes: undefined,
      clearReason: undefined,
      resolvedAt: undefined,
      createdAt: new Date(),
    };

    // Append to the live list via the page's URL — the master-detail page
    // re-reads `getInitialAmlList()` on mount, so we hand the new flag's id
    // through the URL and let the user re-select via list state.
    //
    // For a richer UX we'd push into a shared store. v1 keeps it simple:
    // log the audit entry and navigate back. The item won't appear until
    // the master-detail page updates its in-memory state. To make it
    // visible immediately, the master-detail page exposes an `addFlag`
    // pattern via a module-level event (see filterState).
    appendAmlAudit({
      flagId: id,
      action: 'create_manual',
      actorId: CURRENT_ADMIN.id,
      actorName: CURRENT_ADMIN.name,
      toStatus: 'open',
      reason: note.trim(),
      context: { severity, type: flagType, has_transfer: !!transferId },
    });

    // Persist the new flag in the module so the list pane sees it on remount.
    insertNewManualFlag(newFlag);

    toast.success(t('admin.aml-triage.new.success'));
    navigate(`/operations/aml-triage/${id}`);
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header with back link */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/operations/aml-triage')}
          className="-ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {t('admin.aml-triage.mobile.back')}
        </Button>
      </div>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('admin.aml-triage.new.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('admin.aml-triage.new.subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Flag details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-5">
          {/* User picker */}
          <div className="space-y-1.5">
            <Label htmlFor="aml-new-user">
              {t('admin.aml-triage.new.user')}
            </Label>
            <div className="relative">
              <Input
                id="aml-new-user"
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value);
                  setUserId(null);
                }}
                placeholder={t('admin.aml-triage.new.user.placeholder')}
                autoComplete="off"
              />
              {userQuery && !userId && userMatches.length > 0 && (
                <ul className="absolute z-10 top-full mt-1 left-0 right-0 rounded-md border border-border bg-popover shadow-md max-h-60 overflow-y-auto">
                  {userMatches.map((u) => (
                    <li key={u.userId}>
                      <button
                        type="button"
                        onClick={() => {
                          setUserId(u.userId);
                          setUserQuery(`${u.phone} · ${u.fullName}`);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                      >
                        <span className="font-medium tabular">{u.phone}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="truncate">{u.fullName}</span>
                        <span className="text-muted-foreground text-xs uppercase tracking-wider ml-auto">
                          {maskPinfl(u.pinfl)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Transfer picker */}
          <div className="space-y-1.5">
            <Label htmlFor="aml-new-transfer">
              {t('admin.aml-triage.new.transfer')}
            </Label>
            <div className="relative">
              <Input
                id="aml-new-transfer"
                value={transferQuery}
                onChange={(e) => {
                  setTransferQuery(e.target.value);
                  setTransferId(null);
                }}
                placeholder={t('admin.aml-triage.new.transfer.placeholder')}
                autoComplete="off"
              />
              {transferQuery && !transferId && transferMatches.length > 0 && (
                <ul className="absolute z-10 top-full mt-1 left-0 right-0 rounded-md border border-border bg-popover shadow-md max-h-60 overflow-y-auto">
                  {transferMatches.map((tx) => (
                    <li key={tx.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setTransferId(tx.id);
                          setTransferQuery(tx.id);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                      >
                        <span className="font-mono tabular">{tx.id}</span>
                        <span className="text-muted-foreground truncate">
                          · {tx.userName}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {!transferQuery && (
              <div className="text-sm text-muted-foreground">
                {t('admin.aml-triage.new.transfer.none')}
              </div>
            )}
          </div>

          {/* Severity radio */}
          <div className="space-y-1.5">
            <Label>{t('admin.aml-triage.new.severity')}</Label>
            <div className="flex flex-wrap items-center gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 h-8 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    severity === s
                      ? s === 'critical'
                        ? 'border-danger-600 bg-danger-50 text-danger-700 dark:bg-danger-700/15 dark:text-danger-600'
                        : s === 'warning'
                          ? 'border-warning-600 bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-600'
                          : 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                      : 'border-border bg-background hover:bg-muted',
                  )}
                >
                  {t(`admin.aml-triage.filter.severity.${s}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Type select */}
          <div className="space-y-1.5">
            <Label htmlFor="aml-new-type">{t('admin.aml-triage.new.type')}</Label>
            <select
              id="aml-new-type"
              value={flagType}
              onChange={(e) => setFlagType(e.target.value as AmlFlagType)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`admin.aml-triage.filter.type.${tp}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Context JSON */}
          <div className="space-y-1.5">
            <Label htmlFor="aml-new-context">
              {t('admin.aml-triage.new.context')}
            </Label>
            <Textarea
              id="aml-new-context"
              rows={5}
              value={contextRaw}
              onChange={(e) => {
                setContextRaw(e.target.value);
                setContextError(null);
              }}
              onBlur={validateContext}
              placeholder={t('admin.aml-triage.new.context.placeholder')}
              className={cn('font-mono', contextError && 'border-danger-600')}
            />
            {contextError && (
              <div className="text-sm text-danger-700 dark:text-danger-600">
                {contextError}
              </div>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="aml-new-note">{t('admin.aml-triage.new.note')}</Label>
            <Textarea
              id="aml-new-note"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('admin.aml-triage.new.note.placeholder')}
            />
            <div className="text-sm text-muted-foreground tabular">
              {note.trim().length} / min 20
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/operations/aml-triage')}
            >
              {t('admin.aml-triage.new.cancel')}
            </Button>
            <Button onClick={submit} disabled={!formValid}>
              {t('admin.aml-triage.new.submit')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================================
// Manual-flag insertion — module-level so AmlTriage page reads it on mount
// =====================================================================

import { extraManualFlags } from '@/data/mockAmlTriage';

function insertNewManualFlag(flag: AmlReview) {
  extraManualFlags.unshift(flag);
}
