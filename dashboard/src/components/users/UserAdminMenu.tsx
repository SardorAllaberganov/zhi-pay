import {
  Ban,
  CheckCircle2,
  FileText,
  KeyRound,
  MoreVertical,
  ShieldOff,
  ShieldX,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { UserListRow } from '@/data/mockUsers';

export type UserAdminAction =
  | 'block'
  | 'unblock'
  | 'soft_delete'
  | 'reverify_kyc'
  | 'blacklist_phone'
  | 'reset_devices'
  | 'generate_audit_report';

interface UserAdminMenuProps {
  user: UserListRow;
  onAction: (action: UserAdminAction) => void;
  triggerSize?: 'sm' | 'md';
  className?: string;
}

export function UserAdminMenu({
  user,
  onAction,
  triggerSize = 'md',
  className,
}: UserAdminMenuProps) {
  const isBlocked = user.status === 'blocked';
  const isDeleted = user.status === 'deleted';
  const triggerHW = triggerSize === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('admin.users.detail.menu.aria')}
          className={cn(
            'inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted transition-colors',
            triggerHW,
            className,
          )}
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {!isDeleted && (isBlocked ? (
          <DropdownMenuItem onSelect={() => onAction('unblock')}>
            <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('admin.users.action.unblock')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => onAction('block')} className="text-danger-700 focus:text-danger-700">
            <Ban className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('admin.users.action.block')}
          </DropdownMenuItem>
        ))}

        {!isDeleted && (
          <DropdownMenuItem onSelect={() => onAction('soft_delete')} className="text-danger-700 focus:text-danger-700">
            <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('admin.users.action.soft-delete')}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => onAction('reverify_kyc')}>
          <ShieldX className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.users.action.reverify-kyc')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onAction('blacklist_phone')}>
          <ShieldOff className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.users.action.blacklist-phone')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onAction('reset_devices')}>
          <KeyRound className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.users.action.reset-devices')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => onAction('generate_audit_report')}>
          <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('admin.users.action.generate-report')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
