import { forwardRef, type ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNetworkState } from '@/hooks/useNetworkState';
import { t } from '@/lib/i18n';

type WriteButtonProps = ComponentProps<typeof Button>;

/**
 * Drop-in replacement for `<Button>` that disables itself when the app
 * is offline and surfaces a tooltip ("Reconnect to perform this
 * action") explaining why. Use for write actions across the dashboard:
 * submit / confirm / save / destructive mutators.
 *
 * Reads `useNetworkState()` so any change to `navigator.onLine`
 * propagates immediately. The disabled state is cosmetic + interactive
 * — the underlying `<Button disabled>` still rejects clicks at the DOM
 * level, so even keyboard-driven activation (Enter / Space) is gated.
 *
 * Tooltip wrapping pattern: a `<span tabIndex={0}>` wraps the disabled
 * button so the Radix Tooltip trigger still receives hover / focus
 * events (a `disabled` button doesn't fire mouseenter, blocking the
 * tooltip otherwise). `aria-disabled` on the inner button preserves
 * the screen-reader announcement.
 *
 * `asChild` is forwarded — `<WriteButton asChild><Link>` works the
 * same as the underlying `<Button asChild>`. When offline + asChild,
 * the wrapper still gates the action by rendering the inner element
 * with `aria-disabled` and `pointer-events-none`.
 */
export const WriteButton = forwardRef<HTMLButtonElement, WriteButtonProps>(
  ({ disabled, ...props }, ref) => {
    const online = useNetworkState();
    if (online) {
      return <Button ref={ref} disabled={disabled} {...props} />;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>
            <Button
              ref={ref}
              disabled
              aria-disabled="true"
              className={props.className}
              variant={props.variant}
              size={props.size}
              type={props.type}
            >
              {props.children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {t('admin.system.offline.action.disabled-tooltip')}
        </TooltipContent>
      </Tooltip>
    );
  },
);
WriteButton.displayName = 'WriteButton';
