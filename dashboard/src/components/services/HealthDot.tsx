import { cn } from '@/lib/utils';

interface HealthDotProps {
  tone: 'amber' | 'red' | null;
  className?: string;
}

/**
 * Health-check overlay dot — shown only when the *observed* health (from
 * the recent pip strip) disagrees with the *configured* status. When in
 * agreement, returns null and renders nothing. Pairs with the status
 * badge so the contradiction reads at-a-glance.
 */
export function HealthDot({ tone, className }: HealthDotProps) {
  if (tone === null) return null;
  return (
    <span
      className={cn(
        'inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-card',
        tone === 'amber' ? 'bg-warning-600' : 'bg-danger-600',
        className,
      )}
      aria-label={tone === 'amber' ? 'Health degraded' : 'Health failing'}
    />
  );
}
