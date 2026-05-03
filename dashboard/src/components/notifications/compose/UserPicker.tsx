import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/users/UserAvatar';
import { TierBadge } from '@/components/zhipay/TierBadge';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { getUserById } from '@/data/mockUsers';
import { searchUsersForPicker } from '../audienceEstimate';
import { USER_SEARCH_DEBOUNCE_MS } from '../types';

interface UserPickerProps {
  value: string;
  onChange: (next: string) => void;
  showError: boolean;
}

export function UserPicker({ value, onChange, showError }: UserPickerProps) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), USER_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const matches = useMemo(() => searchUsersForPicker(debounced), [debounced]);
  const selected = value ? getUserById(value) : undefined;

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor="notif-single-user-search">
        {t('admin.notifications.compose.audience.single.search-label')}
      </Label>

      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar name={selected.name} size="sm" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{selected.name}</div>
              <div className="text-sm text-muted-foreground truncate">{selected.phone}</div>
            </div>
            <TierBadge tier={selected.tier} />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange('');
              setQuery('');
              setDebounced('');
            }}
          >
            {t('admin.notifications.compose.audience.single.change')}
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="notif-single-user-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t('admin.notifications.compose.audience.single.search-placeholder')}
            className={cn('pl-9', showError && !value && 'border-danger-600')}
            autoComplete="off"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDebounced('');
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
              aria-label={t('admin.notifications.compose.audience.single.clear-search')}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}

          {open && debounced.trim().length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-popover shadow-md">
              {matches.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted-foreground">
                  {t('admin.notifications.compose.audience.single.no-results')}
                </div>
              ) : (
                matches.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onChange(u.id);
                      setQuery('');
                      setDebounced('');
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                      'hover:bg-accent focus:bg-accent focus:outline-none',
                    )}
                  >
                    <UserAvatar name={u.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{u.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{u.phone}</div>
                    </div>
                    <TierBadge tier={u.tier} />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {showError && !value && (
        <p className="text-sm text-danger-700 dark:text-danger-500">
          {t('admin.notifications.validation.user-required')}
        </p>
      )}
    </div>
  );
}
