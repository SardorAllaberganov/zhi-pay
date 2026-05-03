import { useEffect } from 'react';
import { KeyboardHint } from '@/components/zhipay/KeyboardHint';
import { SHORTCUTS, SHORTCUT_GROUPS } from '@/components/layout/shortcuts';
import { t } from '@/lib/i18n';

/**
 * Print-friendly view of every keyboard shortcut. Opened in a new tab
 * via the HelpOverlay's "Print shortcuts" button. Triggers
 * `window.print()` after first paint so the print dialog opens
 * automatically; closing the dialog leaves a static page the admin can
 * close at will.
 *
 * Layout: 2-column on screen, 1-column when printed (handled by the
 * `print:` Tailwind variant). No AppShell chrome — clean paper
 * output. Auth-guarded — admin must be signed in to view.
 */
export function ShortcutsPrint() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Defer one tick so the layout settles before the print dialog
    // opens. Otherwise the page sometimes prints before the icon
    // chips have laid out.
    const timer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-dvh bg-background p-8 print:p-0">
      <header className="mb-6 print:mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('admin.shortcuts.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('admin.shortcuts.print.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 print:grid-cols-2 print:gap-y-4">
        {SHORTCUT_GROUPS.map((group) => (
          <section key={group} className="break-inside-avoid">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group}
            </h2>
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
          </section>
        ))}
      </div>
    </div>
  );
}
