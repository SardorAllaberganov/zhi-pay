import { LogOut, Keyboard, User } from 'lucide-react';
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
import { t } from '@/lib/i18n';

interface UserMenuProps {
  onShowHelp?: () => void;
}

export function UserMenu({ onShowHelp }: UserMenuProps) {
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
              SA
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">Super Admin</span>
          <span className="text-sm text-muted-foreground font-normal">admin@zhipay.uz</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShowHelp}>
          <Keyboard className="mr-2 h-4 w-4" />
          Keyboard shortcuts
          <kbd className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
            ?
          </kbd>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-danger-600 focus:text-danger-700">
          <LogOut className="mr-2 h-4 w-4" />
          {t('common.actions.signout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
