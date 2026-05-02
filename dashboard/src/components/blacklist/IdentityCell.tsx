import { cn } from '@/lib/utils';
import type { BlacklistType } from '@/data/mockBlacklist';
import { maskIdentifier } from './types';

const MONO_TYPES: BlacklistType[] = ['pinfl', 'device_id', 'ip', 'card_token'];

export function IdentityCell({
  type,
  identifier,
  className,
}: {
  type: BlacklistType;
  identifier: string;
  className?: string;
}) {
  const masked = maskIdentifier(type, identifier);
  return (
    <span
      className={cn(
        MONO_TYPES.includes(type) ? 'font-mono tabular text-sm' : 'text-sm',
        className,
      )}
    >
      {masked}
    </span>
  );
}
