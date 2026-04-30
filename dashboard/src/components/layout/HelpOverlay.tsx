import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KeyboardHint } from '@/components/zhipay/KeyboardHint';
import { t } from '@/lib/i18n';

const SHORTCUTS: { keys: string[]; label: string; group: string }[] = [
  { keys: ['⌘', 'K'], label: 'Open command palette', group: 'Global' },
  { keys: ['?'], label: 'Show shortcuts help', group: 'Global' },
  { keys: ['/'], label: 'Focus search', group: 'Global' },
  { keys: ['t'], label: 'Toggle theme', group: 'Global' },
  { keys: ['Esc'], label: 'Close modal / sheet', group: 'Global' },
  { keys: ['g', 'o'], label: 'Go to Overview', group: 'Navigation' },
  { keys: ['g', 't'], label: 'Go to Transfers', group: 'Navigation' },
  { keys: ['g', 'k'], label: 'Go to KYC Queue', group: 'Navigation' },
  { keys: ['g', 'a'], label: 'Go to AML Triage', group: 'Navigation' },
  { keys: ['g', 'u'], label: 'Go to Users', group: 'Navigation' },
  { keys: ['g', 'c'], label: 'Go to Cards', group: 'Navigation' },
  { keys: ['g', 'f'], label: 'Go to FX Config', group: 'Navigation' },
  { keys: ['g', 's'], label: 'Go to Services', group: 'Navigation' },
  { keys: ['j'], label: 'Move down in lists', group: 'Lists' },
  { keys: ['k'], label: 'Move up in lists', group: 'Lists' },
  { keys: ['Enter'], label: 'Open focused item', group: 'Lists' },
  { keys: ['a'], label: 'Approve (in queues)', group: 'Lists' },
  { keys: ['r'], label: 'Reject (in queues)', group: 'Lists' },
  { keys: ['e'], label: 'Escalate (AML)', group: 'Lists' },
  { keys: ['c'], label: 'Clear (AML)', group: 'Lists' },
  // Transfer detail page (page-scoped)
  { keys: ['j'], label: 'Next transfer in filtered set', group: 'Transfer detail' },
  { keys: ['k'], label: 'Previous transfer', group: 'Transfer detail' },
  { keys: ['n'], label: 'Add note', group: 'Transfer detail' },
  { keys: ['r'], label: 'Reverse (only if completed)', group: 'Transfer detail' },
  { keys: ['f'], label: 'Force fail (only if applicable)', group: 'Transfer detail' },
  { keys: ['m'], label: 'Mark completed (only if processing)', group: 'Transfer detail' },
  { keys: ['w'], label: 'Resend webhook', group: 'Transfer detail' },
  { keys: ['c'], label: 'Copy transfer ID', group: 'Transfer detail' },
  { keys: ['u'], label: 'Open user profile', group: 'Transfer detail' },
  { keys: ['b'], label: 'Back to list', group: 'Transfer detail' },
];

interface HelpOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpOverlay({ open, onOpenChange }: HelpOverlayProps) {
  const groups = ['Global', 'Navigation', 'Lists', 'Transfer detail'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{t('admin.help.title')}</DialogTitle>
          <DialogDescription>{t('admin.help.subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {groups.map((group) => (
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
      </DialogContent>
    </Dialog>
  );
}
