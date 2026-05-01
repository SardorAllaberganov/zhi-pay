import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SourceChip } from './SourceChip';
import { cn, formatNumber, formatDateTime } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { FxRateEntry, FxSource } from '@/data/mockFxRates';

export interface DraftRate {
  midRate: number | '';
  spreadPct: number | '';
  source: FxSource;
  validFrom: Date;
  validTo: Date | null;
}

interface DiffPreviewProps {
  current: FxRateEntry | undefined;
  draft: DraftRate;
  className?: string;
}

/**
 * Right-pane diff preview shown alongside the Update Rate form.
 *
 * Renders a 2-column table: Current vs New. Highlights the client_rate
 * delta with a +/-X.XX% badge. Disabled-style rendering when the draft
 * is incomplete (numeric inputs empty).
 */
export function DiffPreview({ current, draft, className }: DiffPreviewProps) {
  const ready =
    typeof draft.midRate === 'number' && typeof draft.spreadPct === 'number';

  const draftClient =
    ready && typeof draft.midRate === 'number' && typeof draft.spreadPct === 'number'
      ? Math.round(draft.midRate * (1 + draft.spreadPct / 100) * 100) / 100
      : null;

  const clientPctDelta =
    current && draftClient !== null
      ? ((draftClient - current.clientRate) / current.clientRate) * 100
      : null;

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle>{t('admin.fx-config.update.diff')}</CardTitle>
        {!ready && (
          <p className="text-sm text-muted-foreground">
            {t('admin.fx-config.update.diff.subtitle.empty')}
          </p>
        )}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">{t('admin.fx-config.diff.column.field')}</TableHead>
                <TableHead className="text-right">{t('admin.fx-config.diff.column.current')}</TableHead>
                <TableHead className="text-right">{t('admin.fx-config.diff.column.new')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Row
                label={t('admin.fx-config.diff.row.mid-rate')}
                current={current ? formatNumber(current.midRate, 2) : '—'}
                next={
                  typeof draft.midRate === 'number'
                    ? formatNumber(draft.midRate, 2)
                    : '—'
                }
                changed={
                  typeof draft.midRate === 'number' &&
                  current !== undefined &&
                  draft.midRate !== current.midRate
                }
              />
              <Row
                label={t('admin.fx-config.diff.row.spread')}
                current={current ? `${formatNumber(current.spreadPct, 2)}%` : '—'}
                next={
                  typeof draft.spreadPct === 'number'
                    ? `${formatNumber(draft.spreadPct, 2)}%`
                    : '—'
                }
                changed={
                  typeof draft.spreadPct === 'number' &&
                  current !== undefined &&
                  draft.spreadPct !== current.spreadPct
                }
              />
              <Row
                label={t('admin.fx-config.diff.row.client-rate')}
                current={current ? formatNumber(current.clientRate, 2) : '—'}
                next={draftClient !== null ? formatNumber(draftClient, 2) : '—'}
                changed={
                  draftClient !== null &&
                  current !== undefined &&
                  draftClient !== current.clientRate
                }
                trailing={
                  clientPctDelta !== null && Math.abs(clientPctDelta) >= 0.005 ? (
                    <span
                      className={cn(
                        'ml-2 text-sm font-medium tabular',
                        clientPctDelta > 0
                          ? 'text-warning-700 dark:text-warning-600'
                          : 'text-success-700 dark:text-success-600',
                      )}
                    >
                      {clientPctDelta > 0 ? '+' : ''}
                      {formatNumber(clientPctDelta, 2)}%
                    </span>
                  ) : null
                }
                accent={
                  draftClient !== null &&
                  current !== undefined &&
                  draftClient !== current.clientRate
                }
              />
              <Row
                label={t('admin.fx-config.diff.row.source')}
                current={current ? <SourceChip source={current.source} /> : '—'}
                next={<SourceChip source={draft.source} />}
                changed={current !== undefined && draft.source !== current.source}
              />
              <Row
                label={t('admin.fx-config.diff.row.valid-from')}
                current={current ? formatDateTime(current.validFrom) : '—'}
                next={formatDateTime(draft.validFrom)}
                changed={
                  current !== undefined &&
                  draft.validFrom.getTime() !== current.validFrom.getTime()
                }
              />
              <Row
                label={t('admin.fx-config.diff.row.valid-to')}
                current={
                  current
                    ? current.validTo === null
                      ? t('admin.fx-config.active.valid-to.open')
                      : formatDateTime(current.validTo)
                    : '—'
                }
                next={
                  draft.validTo === null
                    ? t('admin.fx-config.active.valid-to.open')
                    : formatDateTime(draft.validTo)
                }
                changed={
                  (current?.validTo?.getTime() ?? null) !==
                  (draft.validTo?.getTime() ?? null)
                }
              />
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  current,
  next,
  changed,
  trailing,
  accent,
}: {
  label: string;
  current: React.ReactNode;
  next: React.ReactNode;
  changed: boolean;
  trailing?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="text-sm">{label}</TableCell>
      <TableCell className="text-right text-sm font-mono tabular text-muted-foreground">
        {current}
      </TableCell>
      <TableCell
        className={cn(
          'text-right text-sm font-mono tabular',
          accent
            ? 'text-brand-700 dark:text-brand-400 font-semibold'
            : changed
            ? 'text-foreground font-medium'
            : 'text-muted-foreground',
        )}
      >
        <span className="inline-flex items-center justify-end">
          {next}
          {trailing}
        </span>
      </TableCell>
    </TableRow>
  );
}
