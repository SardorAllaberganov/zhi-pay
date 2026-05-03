import { ChevronDown, X, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { StoryStatus, StoryType } from '@/data/mockStories';
import {
  STORY_STATUS_LABEL_KEY,
  STORY_STATUS_ORDER,
  STORY_TYPE_LABEL_KEY,
  STORY_TYPE_ORDER,
  EMPTY_FILTERS,
  countActiveFilters,
  type StoryFilters,
} from './types';

interface Props {
  filters: StoryFilters;
  setFilters: (next: StoryFilters) => void;
  loading?: boolean;
  /** `f` page-scoped hotkey focuses this button. */
  firstChipRef?: React.RefObject<HTMLButtonElement>;
}

export function StoriesFilterBar({ filters, setFilters, loading = false, firstChipRef }: Props) {
  const activeCount = countActiveFilters(filters);

  function reset() {
    setFilters({ ...EMPTY_FILTERS });
  }

  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-44 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChipMulti
          values={filters.statuses}
          onChange={(next) => setFilters({ ...filters, statuses: next })}
          firstChipRef={firstChipRef}
        />
        <TypeChipMulti
          values={filters.types}
          onChange={(next) => setFilters({ ...filters, types: next })}
        />
        <HasExpirationToggleChip
          value={filters.hasExpiration}
          onChange={(next) => setFilters({ ...filters, hasExpiration: next })}
        />

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
            {t('admin.stories.filter.clear-all')}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================================

function StatusChipMulti({
  values,
  onChange,
  firstChipRef,
}: {
  values: StoryStatus[];
  onChange: (next: StoryStatus[]) => void;
  firstChipRef?: React.RefObject<HTMLButtonElement>;
}) {
  const active = values.length > 0;
  const label = t('admin.stories.filter.status');
  const summary = active
    ? values.length === 1
      ? t(STORY_STATUS_LABEL_KEY[values[0]])
      : `${label} · ${values.length}`
    : label;

  function toggle(s: StoryStatus) {
    if (values.includes(s)) onChange(values.filter((v) => v !== s));
    else onChange([...values, s]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          ref={firstChipRef}
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            active
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          <span className="truncate max-w-[200px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-56 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </span>
          {active && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('admin.stories.filter.clear-all')}
            </button>
          )}
        </div>
        <div className="p-1.5 space-y-0.5">
          {STORY_STATUS_ORDER.map((s) => {
            const checked = values.includes(s);
            return (
              <label
                key={s}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(s)} />
                <span className="flex-1">{t(STORY_STATUS_LABEL_KEY[s])}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TypeChipMulti({
  values,
  onChange,
}: {
  values: StoryType[];
  onChange: (next: StoryType[]) => void;
}) {
  const active = values.length > 0;
  const label = t('admin.stories.filter.type');
  const summary = active
    ? values.length === 1
      ? t(STORY_TYPE_LABEL_KEY[values[0]])
      : `${label} · ${values.length}`
    : label;

  function toggle(typ: StoryType) {
    if (values.includes(typ)) onChange(values.filter((v) => v !== typ));
    else onChange([...values, typ]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 h-8 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            active
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
              : 'border-border bg-background hover:bg-muted',
          )}
        >
          <span className="truncate max-w-[200px]">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-44 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </span>
          {active && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('admin.stories.filter.clear-all')}
            </button>
          )}
        </div>
        <div className="p-1.5 space-y-0.5">
          {STORY_TYPE_ORDER.map((typ) => {
            const checked = values.includes(typ);
            return (
              <label
                key={typ}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors',
                  checked
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
                    : 'hover:bg-muted',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(typ)} />
                <span className="flex-1">{t(STORY_TYPE_LABEL_KEY[typ])}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function HasExpirationToggleChip({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 h-8 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        value
          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium'
          : 'border-border bg-background hover:bg-muted',
      )}
      aria-pressed={value}
    >
      <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
      <span className="whitespace-nowrap">{t('admin.stories.filter.has-expiration')}</span>
      <Switch checked={value} className="scale-75 -mx-1.5 pointer-events-none" />
    </button>
  );
}
