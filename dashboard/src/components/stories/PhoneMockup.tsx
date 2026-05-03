import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * 9:16 phone-frame primitive used by the Stories editor preview pane.
 *
 * Stays Stories-internal for now — promote to `components/zhipay/` when a
 * second consumer (e.g. Notifications preview) lands. The frame renders a
 * notch chrome + brand-themed status-bar so the preview reads as a real
 * mobile screen rather than a generic rectangle.
 */
export function PhoneMockup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[300px]',
        'aspect-[9/16] rounded-[2.25rem] bg-foreground/90 p-2 shadow-xl',
        className,
      )}
    >
      {/* Inner viewport */}
      <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-background">
        {/* Status bar (faux — illustrative chrome only, no real type) */}
        <div className="absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-between px-5 text-foreground/60">
          <SignalIcon className="h-2.5 w-3.5" />
          <span className="flex items-center gap-1">
            <BatteryIcon className="h-2.5 w-5" />
          </span>
        </div>

        {/* Notch */}
        <div className="absolute left-1/2 top-1.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-foreground/90" />

        {/* Body */}
        <div className="absolute inset-0">{children}</div>

        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 z-10 h-1 w-24 -translate-x-1/2 rounded-full bg-foreground/35" />
      </div>
    </div>
  );
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 12" className={className} aria-hidden="true">
      <rect x="0" y="9" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="5" y="6" width="3" height="6" rx="0.5" fill="currentColor" />
      <rect x="10" y="3" width="3" height="9" rx="0.5" fill="currentColor" />
      <rect x="15" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 12" className={className} aria-hidden="true">
      <rect x="0" y="0" width="22" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="22" y="3" width="2" height="6" rx="1" fill="currentColor" />
      <rect x="2" y="2" width="16" height="8" rx="1" fill="currentColor" />
    </svg>
  );
}
