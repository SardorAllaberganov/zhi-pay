import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { StepperNumberInput } from '@/components/zhipay/StepperNumberInput';
import { DateTimeInput } from '@/components/zhipay/DateTimeInput';
import {
  DiffPreview,
  type DraftCommissionRule,
} from '@/components/commissions/DiffPreview';
import { WorkedExampleCard } from '@/components/commissions/WorkedExampleCard';
import { ActivateConfirmDialog } from '@/components/commissions/ActivateConfirmDialog';
import {
  addCommissionRule,
  getActiveCommissionRule,
  type AccountType,
  type CommissionRuleEntry,
} from '@/data/mockCommissionRules';
import { CURRENT_USER_ADMIN } from '@/data/mockUsers';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

const REASON_MIN = 20;

function parseAccountType(raw: string | null): AccountType {
  return raw === 'corporate' ? 'corporate' : 'personal';
}

/**
 * Build a synthetic preview rule from the in-progress draft so the
 * WorkedExampleCard can recompute live as the user types. Only renders
 * when every numeric input is parseable; otherwise falls back to the
 * current active rule.
 */
function previewRuleFromDraft(
  draft: DraftCommissionRule,
  accountType: AccountType,
  current: CommissionRuleEntry | undefined,
): CommissionRuleEntry | undefined {
  if (
    typeof draft.minPct !== 'number' ||
    typeof draft.maxPct !== 'number' ||
    typeof draft.minFeeUzs !== 'number'
  ) {
    return current;
  }
  if (
    accountType === 'corporate' &&
    (typeof draft.volumeThresholdUsd !== 'number' ||
      typeof draft.corporatePct !== 'number')
  ) {
    return current;
  }
  return {
    id: '__draft__',
    accountType,
    version: (current?.version ?? 0) + 1,
    minPct: draft.minPct,
    maxPct: draft.maxPct,
    minFeeUzsTiyins: BigInt(Math.round(draft.minFeeUzs * 100)),
    volumeThresholdUsdCents:
      accountType === 'corporate' && typeof draft.volumeThresholdUsd === 'number'
        ? BigInt(Math.round(draft.volumeThresholdUsd * 100))
        : null,
    corporatePct:
      accountType === 'corporate' && typeof draft.corporatePct === 'number'
        ? draft.corporatePct
        : null,
    effectiveFrom: draft.effectiveFrom,
    effectiveTo: draft.effectiveTo,
    createdBy: CURRENT_USER_ADMIN.id,
    reasonNote: '',
  };
}

export function CommissionRulesNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountType = parseAccountType(searchParams.get('account_type'));
  const isCorporate = accountType === 'corporate';

  const active = useMemo(
    () => getActiveCommissionRule(accountType),
    [accountType],
  );

  // Pre-fill from active version
  const [minPct, setMinPct] = useState<number | ''>(active?.minPct ?? '');
  const [maxPct, setMaxPct] = useState<number | ''>(active?.maxPct ?? '');
  const [minFeeUzs, setMinFeeUzs] = useState<number | ''>(
    active ? Number(active.minFeeUzsTiyins) / 100 : '',
  );
  const [volumeThresholdUsd, setVolumeThresholdUsd] = useState<number | ''>(
    active?.volumeThresholdUsdCents !== null && active?.volumeThresholdUsdCents !== undefined
      ? Number(active.volumeThresholdUsdCents) / 100
      : '',
  );
  const [corporatePct, setCorporatePct] = useState<number | ''>(
    active?.corporatePct ?? '',
  );
  const [effectiveFrom, setEffectiveFrom] = useState<Date>(new Date());
  const [effectiveTo, setEffectiveTo] = useState<Date | null>(null);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showDiffMobile, setShowDiffMobile] = useState(false);

  const draft: DraftCommissionRule = {
    minPct,
    maxPct,
    minFeeUzs,
    volumeThresholdUsd,
    corporatePct,
    effectiveFrom,
    effectiveTo,
  };

  // Validation
  const minLeMaxValid =
    typeof minPct !== 'number' ||
    typeof maxPct !== 'number' ||
    minPct <= maxPct;
  const minFeeValid = typeof minFeeUzs === 'number' && minFeeUzs >= 0;
  const fromBeforeToValid =
    effectiveTo === null || effectiveFrom.getTime() < effectiveTo.getTime();
  const corporateLeMinValid =
    !isCorporate ||
    typeof corporatePct !== 'number' ||
    typeof minPct !== 'number' ||
    corporatePct <= minPct;
  const numericValid =
    typeof minPct === 'number' &&
    typeof maxPct === 'number' &&
    typeof minFeeUzs === 'number' &&
    (!isCorporate ||
      (typeof volumeThresholdUsd === 'number' &&
        typeof corporatePct === 'number'));
  const reasonValid = reason.trim().length >= REASON_MIN;
  const formValid =
    numericValid &&
    minLeMaxValid &&
    minFeeValid &&
    fromBeforeToValid &&
    corporateLeMinValid &&
    reasonValid;

  // Has-changes detection — submit also requires at least one delta vs active.
  const hasChanges = useMemo(() => {
    if (!active) return true; // first-time activation
    if (typeof minPct === 'number' && minPct !== active.minPct) return true;
    if (typeof maxPct === 'number' && maxPct !== active.maxPct) return true;
    if (typeof minFeeUzs === 'number') {
      const draftTiyins = BigInt(Math.round(minFeeUzs * 100));
      if (draftTiyins !== active.minFeeUzsTiyins) return true;
    }
    if (isCorporate) {
      if (typeof volumeThresholdUsd === 'number') {
        const draftCents = BigInt(Math.round(volumeThresholdUsd * 100));
        if (draftCents !== active.volumeThresholdUsdCents) return true;
      }
      if (typeof corporatePct === 'number' && corporatePct !== active.corporatePct) return true;
    }
    if (effectiveFrom.getTime() !== active.effectiveFrom.getTime()) return true;
    if ((effectiveTo?.getTime() ?? null) !== (active.effectiveTo?.getTime() ?? null)) {
      return true;
    }
    return false;
  }, [active, minPct, maxPct, minFeeUzs, volumeThresholdUsd, corporatePct, effectiveFrom, effectiveTo, isCorporate]);

  const submitEnabled = formValid && hasChanges && !submitting;

  function back() {
    navigate(`/finance/commissions${isCorporate ? '?account_type=corporate' : ''}`);
  }

  function openConfirm() {
    if (!submitEnabled) return;
    setConfirmOpen(true);
  }

  function commit() {
    if (
      !submitEnabled ||
      typeof minPct !== 'number' ||
      typeof maxPct !== 'number' ||
      typeof minFeeUzs !== 'number'
    ) {
      return;
    }
    if (
      isCorporate &&
      (typeof volumeThresholdUsd !== 'number' || typeof corporatePct !== 'number')
    ) {
      return;
    }
    setSubmitting(true);
    try {
      const newRow = addCommissionRule({
        accountType,
        minPct,
        maxPct,
        minFeeUzsTiyins: BigInt(Math.round(minFeeUzs * 100)),
        volumeThresholdUsdCents: isCorporate
          ? BigInt(Math.round((volumeThresholdUsd as number) * 100))
          : null,
        corporatePct: isCorporate ? (corporatePct as number) : null,
        effectiveFrom,
        effectiveTo,
        reasonNote: reason.trim(),
        actor: CURRENT_USER_ADMIN,
      });
      setConfirmOpen(false);
      toast.success(t('admin.commissions.new.toast.success.title'), {
        description: t('admin.commissions.new.toast.success.body', {
          version: `v${newRow.version}`,
          accountType: t(`admin.commissions.tab.${accountType}`),
        }),
      });
      back();
    } catch (err) {
      // Per spec: server-side validation may reject — UI affordance to
      // stay on form, toast error, preserve fields.
      setConfirmOpen(false);
      toast.error(t('admin.commissions.new.toast.error.title'), {
        description:
          err instanceof Error
            ? err.message
            : t('admin.commissions.new.toast.error.body'),
      });
      setSubmitting(false);
    }
  }

  // Cmd/Ctrl+Enter submits when valid.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (submitEnabled && !confirmOpen) {
          e.preventDefault();
          openConfirm();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submitEnabled, confirmOpen],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Synthetic preview rule for the WorkedExampleCard (live recompute).
  const previewRule = useMemo(
    () => previewRuleFromDraft(draft, accountType, active),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      minPct,
      maxPct,
      minFeeUzs,
      volumeThresholdUsd,
      corporatePct,
      effectiveFrom,
      effectiveTo,
      accountType,
      active,
    ],
  );

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
          {t('admin.commissions.new.back')}
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isCorporate
              ? t('admin.commissions.new.title.corporate')
              : t('admin.commissions.new.title.personal')}
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
          {t('admin.commissions.new.warning')}
        </p>
      </div>

      {/* Body — two columns on lg+, stacked on <lg.
          Form left (60%), diff + example right (40%, sticky). */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* Bands */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.commissions.new.section.bands')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field id="cr-min-pct" label={t('admin.commissions.active.min-pct')}>
                <StepperNumberInput
                  id="cr-min-pct"
                  value={minPct}
                  onValueChange={setMinPct}
                  precision={4}
                  step={0.01}
                  shiftStep={0.1}
                  min={0}
                  ariaLabel={t('admin.commissions.active.min-pct')}
                  placeholder="0.50"
                />
                {!minLeMaxValid && (
                  <p className="mt-1.5 text-sm text-danger-700 dark:text-danger-600">
                    {t('admin.commissions.new.validation.min-le-max')}
                  </p>
                )}
              </Field>
              <Field id="cr-max-pct" label={t('admin.commissions.active.max-pct')}>
                <StepperNumberInput
                  id="cr-max-pct"
                  value={maxPct}
                  onValueChange={setMaxPct}
                  precision={4}
                  step={0.01}
                  shiftStep={0.1}
                  min={0}
                  ariaLabel={t('admin.commissions.active.max-pct')}
                  placeholder="2.00"
                />
              </Field>
              <Field id="cr-min-fee" label={t('admin.commissions.active.min-fee')}>
                <StepperNumberInput
                  id="cr-min-fee"
                  value={minFeeUzs}
                  onValueChange={setMinFeeUzs}
                  precision={2}
                  step={100}
                  shiftStep={1000}
                  min={0}
                  ariaLabel={t('admin.commissions.active.min-fee')}
                  placeholder="5000.00"
                />
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t('admin.commissions.new.help.min-fee')}
                </p>
              </Field>
            </CardContent>
          </Card>

          {/* Corporate-only section */}
          {isCorporate && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('admin.commissions.new.section.corporate')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  id="cr-volume"
                  label={t('admin.commissions.active.volume-threshold')}
                >
                  <StepperNumberInput
                    id="cr-volume"
                    value={volumeThresholdUsd}
                    onValueChange={setVolumeThresholdUsd}
                    precision={2}
                    step={100}
                    shiftStep={1000}
                    min={0}
                    ariaLabel={t('admin.commissions.active.volume-threshold')}
                    placeholder="10000.00"
                  />
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {t('admin.commissions.new.help.volume-threshold')}
                  </p>
                </Field>
                <Field
                  id="cr-corporate-pct"
                  label={t('admin.commissions.active.corporate-pct')}
                >
                  <StepperNumberInput
                    id="cr-corporate-pct"
                    value={corporatePct}
                    onValueChange={setCorporatePct}
                    precision={4}
                    step={0.01}
                    shiftStep={0.1}
                    min={0}
                    ariaLabel={t('admin.commissions.active.corporate-pct')}
                    placeholder="0.30"
                  />
                  {!corporateLeMinValid && (
                    <p className="mt-1.5 text-sm text-danger-700 dark:text-danger-600">
                      {t('admin.commissions.new.validation.corporate-le-min')}
                    </p>
                  )}
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {t('admin.commissions.new.help.corporate-pct')}
                  </p>
                </Field>
              </CardContent>
            </Card>
          )}

          {/* Validity window */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('admin.commissions.new.section.window')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  id="cr-effective-from"
                  label={t('admin.commissions.active.effective-from')}
                >
                  <DateTimeInput
                    id="cr-effective-from"
                    value={effectiveFrom}
                    onValueChange={(d) => d && setEffectiveFrom(d)}
                    ariaLabel={t('admin.commissions.active.effective-from')}
                  />
                </Field>
                <Field
                  id="cr-effective-to"
                  label={t('admin.commissions.active.effective-to')}
                >
                  <DateTimeInput
                    id="cr-effective-to"
                    value={effectiveTo}
                    onValueChange={setEffectiveTo}
                    allowEmpty
                    min={effectiveFrom}
                    ariaLabel={t('admin.commissions.active.effective-to')}
                  />
                </Field>
              </div>
              {!fromBeforeToValid && (
                <p className="text-sm text-danger-700 dark:text-danger-600">
                  {t('admin.commissions.new.validation.from-before-to')}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {t('admin.commissions.new.help.effective-to')}
              </p>
            </CardContent>
          </Card>

          {/* Reason */}
          <Card id="cr-reason-card">
            <CardHeader>
              <CardTitle>{t('admin.commissions.new.section.reason')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="cr-reason" className="sr-only">
                {t('admin.commissions.new.section.reason')}
              </Label>
              <textarea
                id="cr-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('admin.commissions.new.reason.placeholder')}
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
                    reasonValid
                      ? 'text-muted-foreground'
                      : 'text-warning-700 dark:text-warning-600',
                  )}
                >
                  {reasonValid
                    ? t('admin.commissions.new.reason-help')
                    : t('admin.commissions.new.reason-required')}
                </p>
                <span
                  className={cn(
                    'text-sm tabular',
                    reasonValid
                      ? 'text-muted-foreground'
                      : 'text-warning-700 dark:text-warning-600',
                  )}
                >
                  {reason.trim().length} / {REASON_MIN}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Mobile-only — show diff + example */}
          <div className="lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowDiffMobile(true);
                setTimeout(() => {
                  document
                    .getElementById('cr-diff-mobile')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
            >
              <Eye className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t('admin.commissions.new.show-diff')}
            </Button>
          </div>
        </div>

        {/* Right pane — diff + worked example */}
        <div className="lg:col-span-2">
          <div className="hidden lg:block lg:sticky lg:top-4 space-y-4">
            <DiffPreview
              current={active}
              draft={draft}
              accountType={accountType}
            />
            <WorkedExampleCard rule={previewRule} compact />
          </div>
          {showDiffMobile && (
            <div id="cr-diff-mobile" className="lg:hidden space-y-4">
              <DiffPreview
                current={active}
                draft={draft}
                accountType={accountType}
              />
              <WorkedExampleCard rule={previewRule} compact />
            </div>
          )}
        </div>
      </div>

      {/* Sticky-bottom action bar — canonical pattern from LESSONS 2026-05-02 */}
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
          <Button onClick={openConfirm} disabled={!submitEnabled}>
            {t('admin.commissions.new.action.create')}
          </Button>
        </div>
      </div>

      <ActivateConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          if (!submitting) setConfirmOpen(o);
        }}
        onConfirm={commit}
        effectiveFrom={effectiveFrom}
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
