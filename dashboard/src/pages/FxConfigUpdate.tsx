import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ChevronDown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  StepperNumberInput,
} from '@/components/fx-config/StepperNumberInput';
import { DateTimeInput } from '@/components/fx-config/DateTimeInput';
import { DiffPreview, type DraftRate } from '@/components/fx-config/DiffPreview';
import { UpdateConfirmDialog } from '@/components/fx-config/UpdateConfirmDialog';
import {
  addFxRate,
  getActiveFxRate,
  getInFlightCount,
  type FxSource,
  setInFlightCounter,
} from '@/data/mockFxRates';
import { TRANSFERS_FULL } from '@/data/mockTransfers';
import { CURRENT_USER_ADMIN } from '@/data/mockUsers';
import { cn, formatNumber } from '@/lib/utils';
import { t } from '@/lib/i18n';

// Wire the in-flight counter (idempotent — same as FxConfig page).
setInFlightCounter({
  count: () => TRANSFERS_FULL.filter((t) => t.status === 'processing').length,
});

const REASON_MIN = 20;

export function FxConfigUpdate() {
  const navigate = useNavigate();

  const active = useMemo(() => getActiveFxRate(), []);
  const inFlight = useMemo(() => getInFlightCount(), []);

  const [source, setSource] = useState<FxSource>(active?.source ?? 'central_bank');
  const [midRate, setMidRate] = useState<number | ''>(active?.midRate ?? '');
  const [spreadPct, setSpreadPct] = useState<number | ''>(active?.spreadPct ?? '');
  const [validFrom, setValidFrom] = useState<Date>(new Date());
  const [validTo, setValidTo] = useState<Date | null>(null);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showDiffMobile, setShowDiffMobile] = useState(false);

  // central_bank locks subsequent fields per spec — auto-fetched value.
  const isCentralBank = source === 'central_bank';

  const draftClient =
    typeof midRate === 'number' && typeof spreadPct === 'number'
      ? Math.round(midRate * (1 + spreadPct / 100) * 100) / 100
      : null;

  const reasonValid = reason.trim().length >= REASON_MIN;
  const numericValid =
    typeof midRate === 'number' &&
    typeof spreadPct === 'number' &&
    midRate > 0 &&
    spreadPct >= 0;
  const formValid = numericValid && reasonValid;

  function back() {
    navigate('/finance/fx-config');
  }

  function openConfirm() {
    if (!formValid) return;
    setConfirmOpen(true);
  }

  function commit() {
    if (!formValid || typeof midRate !== 'number' || typeof spreadPct !== 'number') return;
    setSubmitting(true);
    try {
      const newRow = addFxRate({
        midRate,
        spreadPct,
        source,
        validFrom,
        validTo,
        reasonNote: reason.trim(),
        actor: CURRENT_USER_ADMIN,
      });
      setConfirmOpen(false);
      toast.success(
        t('admin.fx-config.update.toast.success.title'),
        {
          description: t('admin.fx-config.update.toast.success.body', {
            id: newRow.id,
          }),
        },
      );
      navigate('/finance/fx-config');
    } catch (err) {
      // Defensive — the in-memory mutator can't realistically throw, but
      // this wires up the spec'd "stays on form, error toast, inputs
      // preserved" path for completeness.
      setConfirmOpen(false);
      toast.error(t('admin.fx-config.update.toast.error.title'), {
        description:
          err instanceof Error
            ? err.message
            : t('admin.fx-config.update.toast.error.body'),
      });
      setSubmitting(false);
    }
  }

  // Cmd/Ctrl+Enter submits when reason is filled.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (formValid && !submitting && !confirmOpen) {
          e.preventDefault();
          openConfirm();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formValid, submitting, confirmOpen],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const draft: DraftRate = {
    midRate,
    spreadPct,
    source,
    validFrom,
    validTo,
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Detail-page header — inline (NOT sticky) per LESSONS 2026-05-02. */}
      <header className="space-y-3">
        <button
          type="button"
          onClick={back}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm',
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('admin.fx-config.update.back')}
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('admin.fx-config.update.title')}
          </h1>
        </div>
      </header>

      {/* Warning banner */}
      <div
        role="status"
        className="flex items-start gap-3 rounded-md border border-warning-600/30 bg-warning-50 dark:bg-warning-700/15 px-4 py-3"
      >
        <AlertTriangle
          className="h-5 w-5 mt-0.5 shrink-0 text-warning-700 dark:text-warning-600"
          aria-hidden="true"
        />
        <p className="text-sm text-foreground/90">
          {t('admin.fx-config.update.warning')}
        </p>
      </div>

      {/* Body — two columns on lg+, stacked on <lg.
          Form left (60%), diff right (40%, sticky-ish). */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* Source */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.fx-config.update.section.source')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field id="fx-source" label={t('admin.fx-config.form.source.label')}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      id="fx-source"
                      type="button"
                      aria-label={t('admin.fx-config.form.source.label')}
                      className={cn(
                        'inline-flex items-center justify-between gap-2 w-full',
                        'h-10 rounded-md border border-input bg-background pl-3 pr-3 text-sm',
                        'hover:bg-accent/40 transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      )}
                    >
                      <span className="truncate">
                        {t(`admin.fx-config.source.${source}`)}
                      </span>
                      <ChevronDown
                        className="h-4 w-4 text-muted-foreground shrink-0"
                        aria-hidden="true"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  >
                    <DropdownMenuRadioGroup
                      value={source}
                      onValueChange={(v) => setSource(v as FxSource)}
                    >
                      <DropdownMenuRadioItem value="central_bank">
                        {t('admin.fx-config.source.central_bank')}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="provider_x">
                        {t('admin.fx-config.source.provider_x')}
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="manual">
                        {t('admin.fx-config.source.manual')}
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {isCentralBank
                    ? t('admin.fx-config.form.source.help.central_bank')
                    : source === 'provider_x'
                    ? t('admin.fx-config.form.source.help.provider_x')
                    : t('admin.fx-config.form.source.help.manual')}
                </p>
              </Field>
            </CardContent>
          </Card>

          {/* Rates */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.fx-config.update.section.rates')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field id="fx-mid" label={t('admin.fx-config.form.mid-rate.label')}>
                <StepperNumberInput
                  id="fx-mid"
                  value={midRate}
                  onValueChange={setMidRate}
                  precision={8}
                  step={0.01}
                  shiftStep={0.1}
                  min={0}
                  ariaLabel={t('admin.fx-config.form.mid-rate.label')}
                  disabled={isCentralBank}
                  placeholder="1404.17"
                />
                <p className="mt-1.5 text-sm text-muted-foreground tabular">
                  {t('admin.fx-config.form.mid-rate.help')}
                </p>
              </Field>

              <Field id="fx-spread" label={t('admin.fx-config.form.spread.label')}>
                <StepperNumberInput
                  id="fx-spread"
                  value={spreadPct}
                  onValueChange={setSpreadPct}
                  precision={4}
                  step={0.01}
                  shiftStep={0.1}
                  min={0}
                  ariaLabel={t('admin.fx-config.form.spread.label')}
                  disabled={isCentralBank}
                  placeholder="1.20"
                />
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t('admin.fx-config.form.spread.help')}
                </p>
              </Field>

              {/* Auto-computed client rate */}
              <div className="rounded-md border border-border bg-slate-50/60 dark:bg-slate-900/40 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('admin.fx-config.form.client-rate.label')}
                  </span>
                  <span className="font-mono tabular text-2xl font-semibold text-brand-700 dark:text-brand-400">
                    {draftClient !== null ? formatNumber(draftClient, 2) : '—'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('admin.fx-config.form.client-rate.help')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Window — paired range, side-by-side on md+ */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.fx-config.update.section.window')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field id="fx-valid-from" label={t('admin.fx-config.form.valid-from.label')}>
                  <DateTimeInput
                    id="fx-valid-from"
                    value={validFrom}
                    onValueChange={(d) => d && setValidFrom(d)}
                    ariaLabel={t('admin.fx-config.form.valid-from.label')}
                  />
                </Field>

                <Field id="fx-valid-to" label={t('admin.fx-config.form.valid-to.label')}>
                  <DateTimeInput
                    id="fx-valid-to"
                    value={validTo}
                    onValueChange={setValidTo}
                    allowEmpty
                    min={validFrom}
                    ariaLabel={t('admin.fx-config.form.valid-to.label')}
                  />
                </Field>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('admin.fx-config.form.valid-to.help')}
              </p>
            </CardContent>
          </Card>

          {/* Reason */}
          <Card id="fx-reason-card">
            <CardHeader>
              <CardTitle>{t('admin.fx-config.update.section.reason')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="fx-reason" className="sr-only">
                {t('admin.fx-config.form.reason.label')}
              </Label>
              <textarea
                id="fx-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('admin.fx-config.form.reason.placeholder')}
                rows={4}
                className={cn(
                  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              />
              <div className="flex items-center justify-between gap-3">
                <p
                  className={cn(
                    'text-sm',
                    reasonValid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-600',
                  )}
                >
                  {reasonValid
                    ? t('admin.fx-config.form.reason.help')
                    : t('admin.fx-config.update.reason-required')}
                </p>
                <span
                  className={cn(
                    'text-sm tabular',
                    reasonValid ? 'text-muted-foreground' : 'text-warning-700 dark:text-warning-600',
                  )}
                >
                  {reason.trim().length} / {REASON_MIN}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-only toggle to scroll to diff section */}
          <div className="lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowDiffMobile(true);
                setTimeout(() => {
                  document
                    .getElementById('fx-diff-mobile')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
            >
              <Eye className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t('admin.fx-config.update.show-diff')}
            </Button>
          </div>
        </div>

        {/* Diff preview — sticky on lg+, hidden by default on mobile */}
        <div className="lg:col-span-2">
          <div className="hidden lg:block lg:sticky lg:top-4">
            <DiffPreview current={active} draft={draft} />
          </div>
          {showDiffMobile && (
            <div id="fx-diff-mobile" className="lg:hidden">
              <DiffPreview current={active} draft={draft} />
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom action bar — uses canonical `--sidebar-width` CSS
          var pattern from LESSONS 2026-05-02. */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card',
          'md:left-[var(--sidebar-width,4rem)]',
          'px-4 md:px-6 py-3',
        )}
      >
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={back} disabled={submitting}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={openConfirm} disabled={!formValid || submitting}>
            {t('admin.fx-config.action.update')}
          </Button>
        </div>
      </div>

      <UpdateConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          if (!submitting) setConfirmOpen(o);
        }}
        onConfirm={commit}
        inFlightCount={inFlight}
      />
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}
