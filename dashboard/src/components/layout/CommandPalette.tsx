import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  ShieldCheck,
  AlertTriangle,
  Users,
  CreditCard,
  LayoutDashboard,
  TrendingUp,
  Activity,
  Smartphone,
  AlertCircle,
  Image as ImageIcon,
  Newspaper,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useTheme } from '@/providers/ThemeProvider';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  const go = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search transfers, users, cards…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go('/')}>
            <LayoutDashboard className="mr-2" />
            <span>Overview</span>
            <CommandShortcut>g o</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/transfers')}>
            <ArrowLeftRight className="mr-2" />
            <span>Transfers</span>
            <CommandShortcut>g t</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/kyc-queue')}>
            <ShieldCheck className="mr-2" />
            <span>KYC Queue</span>
            <CommandShortcut>g k</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/aml-triage')}>
            <AlertTriangle className="mr-2" />
            <span>AML Triage</span>
            <CommandShortcut>g a</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/users')}>
            <Users className="mr-2" />
            <span>Users</span>
            <CommandShortcut>g u</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/cards')}>
            <CreditCard className="mr-2" />
            <span>Cards</span>
            <CommandShortcut>g c</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/fx-config')}>
            <TrendingUp className="mr-2" />
            <span>FX Config</span>
            <CommandShortcut>g f</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/system/services')}>
            <Activity className="mr-2" />
            <span>Services & Health</span>
            <CommandShortcut>g s</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/system/app-versions')}>
            <Smartphone className="mr-2" />
            <span>App Versions</span>
            <CommandShortcut>g v</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/system/error-codes')}>
            <AlertCircle className="mr-2" />
            <span>Error Codes</span>
            <CommandShortcut>g e</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/content/stories')}>
            <ImageIcon className="mr-2" />
            <span>Stories</span>
            <CommandShortcut>g y</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/content/news')}>
            <Newspaper className="mr-2" />
            <span>News</span>
            <CommandShortcut>g n</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/content/notifications')}>
            <Bell className="mr-2" />
            <span>Notifications</span>
            <CommandShortcut>g i</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => {
              setTheme('light');
              onOpenChange(false);
            }}
          >
            <Sun className="mr-2" />
            Light theme
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setTheme('dark');
              onOpenChange(false);
            }}
          >
            <Moon className="mr-2" />
            Dark theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
