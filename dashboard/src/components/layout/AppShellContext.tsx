import { createContext, useContext } from 'react';

/**
 * Context exposed by `<AppShell>` so deep descendants can trigger the
 * shell's overlay surfaces (command palette, help overlay) without
 * prop-drilling. Used today by:
 *
 *   - `<NotFound>` — secondary CTA "Open command palette (⌘K)"
 *   - Future: any page-level CTA that wants to open the palette directly
 *
 * The palette + help overlay state still lives in `<AppShell>` — this
 * context just hands consumers the imperative open function.
 */
export interface AppShellActions {
  openCommandPalette: () => void;
  openHelp: () => void;
}

const NOOP: AppShellActions = {
  openCommandPalette: () => {},
  openHelp: () => {},
};

export const AppShellContext = createContext<AppShellActions>(NOOP);

export function useAppShell(): AppShellActions {
  return useContext(AppShellContext);
}
