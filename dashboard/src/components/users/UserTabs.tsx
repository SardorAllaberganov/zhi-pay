import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export type UserTabKey =
  | 'overview'
  | 'kyc'
  | 'cards'
  | 'transfers'
  | 'recipients'
  | 'aml'
  | 'devices'
  | 'audit';

export const USER_TAB_KEYS: UserTabKey[] = [
  'overview',
  'kyc',
  'cards',
  'transfers',
  'recipients',
  'aml',
  'devices',
  'audit',
];

interface UserTabsProps {
  active: UserTabKey;
  onChange: (key: UserTabKey) => void;
  amlCount?: number;
}

export function UserTabs({ active, onChange, amlCount = 0 }: UserTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={t('admin.users.detail.tabs.aria')}
      className="-mx-4 md:-mx-6 px-4 md:px-6 border-b border-border"
    >
      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {USER_TAB_KEYS.map((key) => {
          const isActive = active === key;
          const showCount = key === 'aml' && amlCount > 0;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 h-11 -mb-px border-b-2 text-sm whitespace-nowrap transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-md',
                isActive
                  ? 'border-brand-600 text-brand-700 dark:text-brand-300 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`admin.users.detail.tab.${key}`)}
              {showCount && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center rounded-full min-w-5 h-5 px-1.5 text-xs font-medium tabular',
                    isActive
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
                      : 'bg-danger-50 text-danger-700 dark:bg-danger-700/20 dark:text-danger-600',
                  )}
                >
                  {amlCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
