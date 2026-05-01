import { useMemo, useState } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { formatDateRangeLabel, type DateRangeValue } from '@/components/zhipay/DateRangePicker';
import {
  bigintSafeReplacer,
  type AuditEvent,
} from '@/data/mockAuditLog';

type Format = 'csv' | 'ndjson';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: AuditEvent[];
  dateRange: DateRangeValue;
  /** Called once the file download has been triggered. */
  onSuccess: (format: Format, count: number) => void;
  onError: () => void;
}

const SIZE_WARNING_THRESHOLD_BYTES = 2 * 1024 * 1024; // 2 MB

export function ExportDialog({
  open,
  onOpenChange,
  rows,
  dateRange,
  onSuccess,
  onError,
}: ExportDialogProps) {
  const [format, setFormat] = useState<Format>('csv');
  const [includeContext, setIncludeContext] = useState(false);
  const [busy, setBusy] = useState(false);

  // Cheap byte estimate when "include context" is on — used for the warning.
  const estimatedBytes = useMemo(() => {
    if (!includeContext) return 0;
    let total = 0;
    for (const r of rows) {
      total += JSON.stringify(r.context, bigintSafeReplacer).length;
    }
    // Add ~200 bytes per row for the rest of the columns.
    total += rows.length * 200;
    return total;
  }, [includeContext, rows]);
  const sizeWarning = includeContext && estimatedBytes >= SIZE_WARNING_THRESHOLD_BYTES;

  function buildCsv(): string {
    const headers = [
      'event_id',
      'timestamp',
      'actor_type',
      'actor_id',
      'actor_name',
      'actor_phone',
      'actor_ip',
      'actor_device',
      'action',
      'entity_type',
      'entity_id',
      'from_status',
      'to_status',
      'reason',
      ...(includeContext ? ['context_json'] : []),
    ];
    const lines = [headers.join(',')];
    for (const r of rows) {
      const a = r.actor;
      const cols = [
        csvField(r.id),
        csvField(r.timestamp.toISOString()),
        csvField(r.actorType),
        csvField(a.id ?? ''),
        csvField(a.name ?? ''),
        csvField(a.phone ?? ''),
        csvField(a.ip ?? ''),
        csvField(a.device ?? ''),
        csvField(r.action),
        csvField(r.entity.type),
        csvField(r.entity.id),
        csvField(r.fromStatus ?? ''),
        csvField(r.toStatus ?? ''),
        csvField(r.reason ?? ''),
        ...(includeContext ? [csvField(JSON.stringify(r.context, bigintSafeReplacer))] : []),
      ];
      lines.push(cols.join(','));
    }
    return lines.join('\n');
  }

  function buildNdjson(): string {
    return rows
      .map((r) =>
        JSON.stringify(
          {
            event_id: r.id,
            timestamp: r.timestamp.toISOString(),
            actor_type: r.actorType,
            actor: r.actor,
            action: r.action,
            entity: r.entity,
            from_status: r.fromStatus,
            to_status: r.toStatus,
            reason: r.reason ?? null,
            ...(includeContext ? { context: r.context } : {}),
          },
          bigintSafeReplacer,
        ),
      )
      .join('\n');
  }

  async function handleGenerate() {
    setBusy(true);
    try {
      // Yield to the event loop so the busy state renders before the
      // (synchronous, but potentially heavy) builder runs.
      await new Promise((r) => setTimeout(r, 50));
      const content = format === 'csv' ? buildCsv() : buildNdjson();
      const mime = format === 'csv' ? 'text/csv' : 'application/x-ndjson';
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.download = `zhipay-audit-log-${today}.${format === 'csv' ? 'csv' : 'ndjson'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onSuccess(format, rows.length);
      onOpenChange(false);
    } catch (_e) {
      onError();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t('admin.audit-log.export.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.audit-log.export.subtitle', { count: rows.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('admin.audit-log.export.date-range')}
            </Label>
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm font-mono">
              {formatDateRangeLabel(dateRange)}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('admin.audit-log.export.date-range-help')}
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t('admin.audit-log.export.format')}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <FormatRadio
                checked={format === 'csv'}
                onClick={() => setFormat('csv')}
                title="CSV"
                hint={t('admin.audit-log.export.format-csv-hint')}
              />
              <FormatRadio
                checked={format === 'ndjson'}
                onClick={() => setFormat('ndjson')}
                title="NDJSON"
                hint={t('admin.audit-log.export.format-ndjson-hint')}
              />
            </div>
          </fieldset>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={includeContext}
              onCheckedChange={(v) => setIncludeContext(v === true)}
              className="mt-0.5"
            />
            <span className="flex-1 text-sm">
              <span className="font-medium">{t('admin.audit-log.export.include-context')}</span>
              <span className="block text-sm text-muted-foreground">
                {t('admin.audit-log.export.include-context-help')}
              </span>
            </span>
          </label>

          {sizeWarning && (
            <div className="flex items-start gap-2.5 rounded-md border border-warning-600/30 bg-warning-50 dark:bg-warning-700/15 px-3 py-2 text-sm text-warning-700 dark:text-warning-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>
                {t('admin.audit-log.export.size-warning', {
                  mb: (estimatedBytes / (1024 * 1024)).toFixed(1),
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={handleGenerate} disabled={busy || rows.length === 0}>
            <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {busy
              ? t('admin.audit-log.export.cta-busy')
              : t('admin.audit-log.export.cta')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormatRadio({
  checked,
  onClick,
  title,
  hint,
}: {
  checked: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={checked}
      className={cn(
        'rounded-md border px-3 py-2.5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        checked
          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40'
          : 'border-border bg-background hover:bg-muted',
      )}
    >
      <div className={cn('text-sm font-medium', checked ? 'text-brand-700 dark:text-brand-300' : 'text-foreground')}>
        {title}
      </div>
      <div className="mt-0.5 text-sm text-muted-foreground">{hint}</div>
    </button>
  );
}

// CSV escaping — same convention as the existing Recipients/Users/Cards exports.
function csvField(value: string): string {
  if (value === '') return '';
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
