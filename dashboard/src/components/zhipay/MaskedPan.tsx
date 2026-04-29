import { cn, maskPan } from '@/lib/utils';
import { SchemeLogo } from './SchemeLogo';
import type { CardScheme } from '@/types';

interface MaskedPanProps {
  /** PAN as `first6+last4` from backend. UI inserts dots/spacing. */
  value: string;
  scheme: CardScheme;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  hideScheme?: boolean;
}

/**
 * Renders masked PAN with the scheme logo.
 * Format: `4242 42•• •••• 4242`
 * NEVER reconstructs the full PAN.
 */
export function MaskedPan({
  value,
  scheme,
  size = 'sm',
  className,
  hideScheme,
}: MaskedPanProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {!hideScheme && <SchemeLogo scheme={scheme} size={size} />}
      <span className="font-mono text-sm tabular text-foreground/90">{maskPan(value)}</span>
    </span>
  );
}
