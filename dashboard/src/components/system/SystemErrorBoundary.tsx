import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ServerErrorState } from './ServerErrorState';
import { logPageError } from '@/lib/systemEvents';

interface SystemErrorBoundaryProps {
  children: ReactNode;
}

interface SystemErrorBoundaryState {
  hasError: boolean;
  referenceId: string | null;
}

/**
 * React error boundary that catches render-time crashes anywhere in the
 * authenticated app and renders `<ServerErrorState>` in-shell.
 *
 * Boundary contract:
 *   - `getDerivedStateFromError` flips `hasError` on the next render.
 *   - `componentDidCatch` logs the crash to `mockSystemEvents` and
 *     captures the generated reference id for display.
 *   - The Try-again CTA calls `reset()` which clears boundary state,
 *     re-mounting children. If the same render path crashes again,
 *     we land back here.
 *
 * Doesn't catch errors in event handlers, async code, or effects —
 * those propagate as unhandled rejections / exceptions and would need
 * a global handler. The 500 state is rendered for render-time crashes;
 * other failure modes use targeted toasts.
 */
export class SystemErrorBoundary extends Component<
  SystemErrorBoundaryProps,
  SystemErrorBoundaryState
> {
  state: SystemErrorBoundaryState = { hasError: false, referenceId: null };

  static getDerivedStateFromError(): Partial<SystemErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const referenceId = logPageError({
      route:
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '',
      error,
      componentStack: errorInfo.componentStack ?? undefined,
    });
    this.setState({ referenceId: referenceId || null });
  }

  reset = (): void => {
    this.setState({ hasError: false, referenceId: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ServerErrorState
          referenceId={this.state.referenceId}
          onRetry={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
