import { LogOut, Keyboard, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from '@/lib/auth';
import { t } from '@/lib/i18n';

interface UserMenuProps {
  onShowHelp?: () => void;
}

function initialsFor(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu({ onShowHelp }: UserMenuProps) {
  const navigate = useNavigate();
  const session = useSession();
  const displayName = session?.profile.displayName ?? 'Admin';
  const email = session?.profile.email ?? '';
  const initials = initialsFor(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={t('common.actions.usermenu')}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{displayName}</span>
          {email ? (
            <span className="text-sm text-muted-foreground font-normal">{email}</span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <SettingsIcon className="mr-2 h-4 w-4" />
          {t('admin.settings.title')}
          <kbd className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
            g ,
          </kbd>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShowHelp}>
          <Keyboard className="mr-2 h-4 w-4" />
          Keyboard shortcuts
          <kbd className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
            ?
          </kbd>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ reason: 'user' })}
          className="text-danger-600 focus:text-danger-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('common.actions.signout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
