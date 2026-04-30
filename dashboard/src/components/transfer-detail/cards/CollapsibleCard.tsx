import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  title: ReactNode;
  defaultOpen?: boolean;
  /** Force-open from outside (e.g. when status = failed). */
  forceOpen?: boolean;
  /** Visible whether collapsed or open — sits in the header. */
  rightAccessory?: ReactNode;
  /** Always-visible summary line shown beneath the header when collapsed. */
  collapsedSummary?: ReactNode;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export function CollapsibleCard({
  title,
  defaultOpen = true,
  forceOpen,
  rightAccessory,
  collapsedSummary,
  children,
  className,
  innerClassName,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const effectiveOpen = forceOpen ?? open;

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between space-y-0 gap-3 py-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-expanded={effectiveOpen}
        >
          {effectiveOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          <CardTitle className="truncate">{title}</CardTitle>
        </button>
        {rightAccessory && <div className="shrink-0">{rightAccessory}</div>}
      </CardHeader>
      {!effectiveOpen && collapsedSummary && (
        <CardContent className="pt-0 pb-4 text-sm text-muted-foreground">
          {collapsedSummary}
        </CardContent>
      )}
      {effectiveOpen && (
        <CardContent className={cn('pt-0', innerClassName)}>{children}</CardContent>
      )}
    </Card>
  );
}
