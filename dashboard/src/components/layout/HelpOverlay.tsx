import { PrinterIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KeyboardHint } from '@/components/zhipay/KeyboardHint';
import { SHORTCUTS, SHORTCUT_GROUPS } from './shortcuts';
import { t } from '@/lib/i18n';

interface HelpOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Centered Dialog (640px wide, max-h 80vh, scrollable) listing every
 * keyboard shortcut grouped by surface. Triggered by `?` anywhere in
 * the app and from the TopBar Help action.
 *
 * Footer carries a "Print shortcuts" link that opens
 * `/system/shortcuts-print` in a new tab — the route triggers
 * `window.print()` after first paint so the print dialog opens
 * automatically.
 */
export function HelpOverlay({ open, onOpenChange }: HelpOverlayProps) {
  function handlePrint() {
    if (typeof window === 'undefined') return;
    // HashRouter — preserve the current pathname so the new tab lands
    // on the same origin.
    const url = `${window.location.pathname}${window.location.search}#/system/shortcuts-print`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-border px-6 pt-6 pb-4">
          <DialogTitle>{t('admin.shortcuts.title')}</DialogTitle>
          <DialogDescription>{t('admin.shortcuts.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group}>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                {group}
              </div>
              <ul className="space-y-1.5">
                {SHORTCUTS.filter((s) => s.group === group).map((s, i) => (
                  <li
                    key={`${group}-${i}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground/80">{s.label}</span>
                    <KeyboardHint keys={s.keys} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="shrink-0 border-t border-border px-6 py-3 flex items-center justify-end">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <PrinterIcon className="h-4 w-4" aria-hidden="true" />
            <span>{t('admin.shortcuts.action.print')}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
