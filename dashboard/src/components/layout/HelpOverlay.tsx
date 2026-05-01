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
  { keys: ['g', 'r'], label: 'Go to Recipients', group: 'Navigation' },
  { keys: ['g', 'f'], label: 'Go to FX Config', group: 'Navigation' },
  { keys: ['g', 'm'], label: 'Go to Commission Rules', group: 'Navigation' },
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
  // KYC Queue page (page-scoped)
  { keys: ['j'], label: 'Move down in queue', group: 'KYC Queue' },
  { keys: ['k'], label: 'Move up in queue', group: 'KYC Queue' },
  { keys: ['Enter'], label: 'Open focused verification', group: 'KYC Queue' },
  { keys: ['a'], label: 'Approve focused (opens confirm)', group: 'KYC Queue' },
  { keys: ['r'], label: 'Reject focused (opens reason)', group: 'KYC Queue' },
  { keys: ['i'], label: 'Request more info', group: 'KYC Queue' },
  { keys: ['e'], label: 'Escalate to senior review', group: 'KYC Queue' },
  { keys: ['m'], label: 'Toggle "Assigned to me" filter', group: 'KYC Queue' },
  // AML Triage page (page-scoped)
  { keys: ['j'], label: 'Move down in list', group: 'AML Triage' },
  { keys: ['k'], label: 'Move up in list', group: 'AML Triage' },
  { keys: ['Enter'], label: 'Open focused flag', group: 'AML Triage' },
  { keys: ['c'], label: 'Clear (disabled for sanctions)', group: 'AML Triage' },
  { keys: ['e'], label: 'Escalate (auto-blocks user on critical)', group: 'AML Triage' },
  { keys: ['m'], label: 'Assign to me', group: 'AML Triage' },
  { keys: ['a'], label: 'Reassign', group: 'AML Triage' },
  // Users page (page-scoped)
  { keys: ['j'], label: 'Move down in list', group: 'Users' },
  { keys: ['k'], label: 'Move up in list', group: 'Users' },
  { keys: ['Enter'], label: 'Open focused user', group: 'Users' },
  { keys: ['1'], label: 'Jump to Overview tab', group: 'Users' },
  { keys: ['2'], label: 'Jump to KYC tab', group: 'Users' },
  { keys: ['3'], label: 'Jump to Cards tab', group: 'Users' },
  { keys: ['4'], label: 'Jump to Transfers tab', group: 'Users' },
  { keys: ['5'], label: 'Jump to Recipients tab', group: 'Users' },
  { keys: ['6'], label: 'Jump to AML tab', group: 'Users' },
  { keys: ['7'], label: 'Jump to Devices tab', group: 'Users' },
  { keys: ['8'], label: 'Jump to Audit tab', group: 'Users' },
  { keys: ['b'], label: 'Block (opens confirm)', group: 'Users' },
  { keys: ['e'], label: 'Open Audit tab', group: 'Users' },
  // Cards page (page-scoped)
  { keys: ['j'], label: 'Move down in list', group: 'Cards' },
  { keys: ['k'], label: 'Move up in list', group: 'Cards' },
  { keys: ['Enter'], label: 'Open focused card', group: 'Cards' },
  { keys: ['/'], label: 'Focus search', group: 'Cards' },
  // Card detail page (page-scoped)
  { keys: ['b'], label: 'Back to list', group: 'Card detail' },
  { keys: ['Backspace'], label: 'Back to list', group: 'Card detail' },
  { keys: ['f'], label: 'Freeze (only when active)', group: 'Card detail' },
  { keys: ['u'], label: 'Unfreeze (only when frozen)', group: 'Card detail' },
  { keys: ['c'], label: 'Copy acquirer token', group: 'Card detail' },
  // Recipients page (page-scoped)
  { keys: ['j'], label: 'Move down in list', group: 'Recipients' },
  { keys: ['k'], label: 'Move up in list', group: 'Recipients' },
  { keys: ['Enter'], label: 'Open focused recipient', group: 'Recipients' },
  { keys: ['/'], label: 'Focus search', group: 'Recipients' },
  // Recipient detail page (page-scoped)
  { keys: ['b'], label: 'Back to list', group: 'Recipient detail' },
  { keys: ['Backspace'], label: 'Back to list', group: 'Recipient detail' },
  { keys: ['Delete'], label: 'Open hard-delete confirm', group: 'Recipient detail' },
  // FX Config page (page-scoped)
  { keys: ['u'], label: 'Open Update rate page', group: 'FX Config' },
  // Update FX rate page (page-scoped)
  { keys: ['⌘', 'Enter'], label: 'Submit (when reason filled)', group: 'Update FX rate' },
  { keys: ['↑', '↓'], label: 'Step number ± 0.01', group: 'Update FX rate' },
  { keys: ['Shift', '↑↓'], label: 'Step number ± 0.10', group: 'Update FX rate' },
  // Commission Rules page (page-scoped)
  { keys: ['n'], label: 'Open New version page (active tab)', group: 'Commission Rules' },
  // Update commission version page (page-scoped)
  { keys: ['⌘', 'Enter'], label: 'Submit (when reason filled)', group: 'New commission version' },
  { keys: ['↑', '↓'], label: 'Step number ± 0.01 (% inputs) / ± 100 (money)', group: 'New commission version' },
  { keys: ['Shift', '↑↓'], label: 'Step number ± 0.10 / ± 1000', group: 'New commission version' },
];

interface HelpOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpOverlay({ open, onOpenChange }: HelpOverlayProps) {
  const groups = ['Global', 'Navigation', 'Lists', 'Transfer detail', 'KYC Queue', 'AML Triage', 'Users', 'Cards', 'Card detail', 'Recipients', 'Recipient detail', 'FX Config', 'Update FX rate', 'Commission Rules', 'New commission version'];

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
