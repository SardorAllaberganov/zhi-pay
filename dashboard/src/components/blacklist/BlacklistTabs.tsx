import { Skeleton } from '@/components/ui/skeleton';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { BlacklistType } from '@/data/mockBlacklist';

const TYPE_ORDER: BlacklistType[] = ['phone', 'pinfl', 'device_id', 'ip', 'card_token'];
const LABEL_KEY: Record<BlacklistType, string> = {
  phone: 'admin.blacklist.tab.phone',
  pinfl: 'admin.blacklist.tab.pinfl',
  device_id: 'admin.blacklist.tab.device',
  ip: 'admin.blacklist.tab.ip',
  card_token: 'admin.blacklist.tab.card-token',
};

export function BlacklistTabs({
  counts,
  loading,
}: {
  counts: Record<BlacklistType, number>;
  loading?: boolean;
}) {
  // Outer wrapper handles mobile horizontal scroll — the inner TabsList keeps
  // its default `inline-flex bg-muted p-1 rounded-md` segmented-control pill.
  return (
    <div className="-mx-1 overflow-x-auto pb-1 md:mx-0 md:overflow-visible md:pb-0">
      <TabsList className="h-auto">
        {TYPE_ORDER.map((type) => {
          const count = counts[type];
          return (
            <TabsTrigger
              key={type}
              value={type}
              className="gap-1.5 data-[state=active]:[&_[data-tab-count]]:bg-foreground/10"
            >
              <span>{t(LABEL_KEY[type])}</span>
              {loading ? (
                <Skeleton className="h-4 w-6 rounded-full" />
              ) : (
                <span
                  data-tab-count
                  className={cn(
                    'inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular',
                    count > 0
                      ? 'bg-background/80 text-foreground'
                      : 'bg-transparent text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}
