import { cn } from '@/lib/utils';
import { BLACKLIST_ADMIN_POOL } from '@/data/mockBlacklist';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

export function AddedByCell({
  adminId,
  className,
}: {
  adminId: string;
  className?: string;
}) {
  const profile = BLACKLIST_ADMIN_POOL.find((a) => a.id === adminId);
  const name = profile?.name ?? adminId;
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {initials(name)}
      </span>
      <span className="text-sm">{name}</span>
    </span>
  );
}
