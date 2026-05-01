import { RefreshCw, Database, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { FxSource } from '@/data/mockFxRates';

interface SourceChipProps {
  source: FxSource;
  className?: string;
}

const ICON: Record<FxSource, React.ComponentType<{ className?: string }>> = {
  central_bank: RefreshCw,
  provider_x: Database,
  manual: Pencil,
};

/**
 * Compact chip rendering the FX rate source.
 *   central_bank → RefreshCw  (auto-fetched, neutral)
 *   provider_x   → Database
 *   manual       → Pencil     (operator override — visually distinct, amber)
 */
export function SourceChip({ source, className }: SourceChipProps) {
  const Icon = ICON[source];
  const isManual = source === 'manual';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 text-xs font-sans font-medium whitespace-nowrap',
        isManual
          ? 'bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-600 border border-warning-600/20'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(`admin.fx-config.source.${source}`)}
    </span>
  );
}
