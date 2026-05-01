import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Money } from '@/components/zhipay/Money';
import { cn, formatNumber, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type {
  AccountType,
  CommissionRuleEntry,
} from '@/data/mockCommissionRules';

export interface DraftCommissionRule {
  minPct: number | '';
  maxPct: number | '';
  /** UZS display units (not tiyins) — converted to bigint on submit. */
  minFeeUzs: number | '';
  /** USD display units (not cents) — corporate only. */
  volumeThresholdUsd: number | '';
  corporatePct: number | '';
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

interface DiffPreviewProps {
  current: CommissionRuleEntry | undefined;
  draft: DraftCommissionRule;
  accountType: AccountType;
  className?: string;
}

interface DiffRowSpec {
  field: string;
  label: string;
  currentNode: React.ReactNode;
  nextNode: React.ReactNode;
  changed: boolean;
}

/**
 * Right-pane diff preview for the new-version form.
 *
 * Per spec: "side-by-side, only fields that changed". Renders a 2-column
 * table (Current vs New) with rows filtered to those where draft ≠ current.
 * Empty state when no changes have been made yet → submit button can read
 * this state and stay disabled.
 */
export function DiffPreview({
  current,
  draft,
  accountType,
  className,
}: DiffPreviewProps) {
  const rows = buildDiffRows(current, draft, accountType);
  const changedRows = rows.filter((r) => r.changed);
  const hasChanges = changedRows.length > 0;

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle>{t('admin.commissions.new.diff')}</CardTitle>
        {!hasChanges && (
          <p className="text-sm text-muted-foreground">
            {t('admin.commissions.new.diff.empty')}
          </p>
        )}
      </CardHeader>
      {hasChanges && (
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">
                    {t('admin.commissions.diff.column.field')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('admin.commissions.diff.column.current')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('admin.commissions.diff.column.new')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changedRows.map((r) => (
                  <TableRow key={r.field}>
                    <TableCell className="text-sm">{r.label}</TableCell>
                    <TableCell className="text-right text-sm font-mono tabular text-muted-foreground">
                      {r.currentNode}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono tabular text-foreground font-medium">
                      {r.nextNode}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function buildDiffRows(
  current: CommissionRuleEntry | undefined,
  draft: DraftCommissionRule,
  accountType: AccountType,
): DiffRowSpec[] {
  const rows: DiffRowSpec[] = [];

  // min_pct
  rows.push({
    field: 'min_pct',
    label: t('admin.commissions.diff.row.min-pct'),
    currentNode: current ? `${formatNumber(current.minPct, 2)}%` : '—',
    nextNode:
      typeof draft.minPct === 'number'
        ? `${formatNumber(draft.minPct, 2)}%`
        : '—',
    changed:
      typeof draft.minPct === 'number' &&
      current !== undefined &&
      draft.minPct !== current.minPct,
  });

  // max_pct
  rows.push({
    field: 'max_pct',
    label: t('admin.commissions.diff.row.max-pct'),
    currentNode: current ? `${formatNumber(current.maxPct, 2)}%` : '—',
    nextNode:
      typeof draft.maxPct === 'number'
        ? `${formatNumber(draft.maxPct, 2)}%`
        : '—',
    changed:
      typeof draft.maxPct === 'number' &&
      current !== undefined &&
      draft.maxPct !== current.maxPct,
  });

  // min_fee
  const draftMinFeeTiyins =
    typeof draft.minFeeUzs === 'number'
      ? BigInt(Math.round(draft.minFeeUzs * 100))
      : null;
  rows.push({
    field: 'min_fee',
    label: t('admin.commissions.diff.row.min-fee'),
    currentNode: current ? (
      <Money amount={current.minFeeUzsTiyins} currency="UZS" />
    ) : (
      '—'
    ),
    nextNode: draftMinFeeTiyins !== null ? (
      <Money amount={draftMinFeeTiyins} currency="UZS" />
    ) : (
      '—'
    ),
    changed:
      draftMinFeeTiyins !== null &&
      current !== undefined &&
      draftMinFeeTiyins !== current.minFeeUzsTiyins,
  });

  // volume_threshold (corporate only)
  if (accountType === 'corporate') {
    const draftVolumeCents =
      typeof draft.volumeThresholdUsd === 'number'
        ? BigInt(Math.round(draft.volumeThresholdUsd * 100))
        : null;
    rows.push({
      field: 'volume_threshold',
      label: t('admin.commissions.diff.row.volume-threshold'),
      currentNode: current?.volumeThresholdUsdCents !== null && current ? (
        <Money amount={current.volumeThresholdUsdCents!} currency="USD" />
      ) : (
        '—'
      ),
      nextNode: draftVolumeCents !== null ? (
        <Money amount={draftVolumeCents} currency="USD" />
      ) : (
        '—'
      ),
      changed:
        draftVolumeCents !== null &&
        current !== undefined &&
        current.volumeThresholdUsdCents !== null &&
        draftVolumeCents !== current.volumeThresholdUsdCents,
    });

    // corporate_pct
    rows.push({
      field: 'corporate_pct',
      label: t('admin.commissions.diff.row.corporate-pct'),
      currentNode:
        current?.corporatePct !== null && current
          ? `${formatNumber(current.corporatePct!, 2)}%`
          : '—',
      nextNode:
        typeof draft.corporatePct === 'number'
          ? `${formatNumber(draft.corporatePct, 2)}%`
          : '—',
      changed:
        typeof draft.corporatePct === 'number' &&
        current !== undefined &&
        current.corporatePct !== null &&
        draft.corporatePct !== current.corporatePct,
    });
  }

  // effective_from
  rows.push({
    field: 'effective_from',
    label: t('admin.commissions.diff.row.effective-from'),
    currentNode: current ? formatDateTime(current.effectiveFrom) : '—',
    nextNode: formatDateTime(draft.effectiveFrom),
    changed:
      current !== undefined &&
      draft.effectiveFrom.getTime() !== current.effectiveFrom.getTime(),
  });

  // effective_to
  rows.push({
    field: 'effective_to',
    label: t('admin.commissions.diff.row.effective-to'),
    currentNode: current
      ? current.effectiveTo === null
        ? t('admin.commissions.active.effective-to.open')
        : formatDateTime(current.effectiveTo)
      : '—',
    nextNode:
      draft.effectiveTo === null
        ? t('admin.commissions.active.effective-to.open')
        : formatDateTime(draft.effectiveTo),
    changed:
      (current?.effectiveTo?.getTime() ?? null) !==
      (draft.effectiveTo?.getTime() ?? null),
  });

  return rows;
}
