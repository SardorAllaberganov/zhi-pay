import { Laptop, Smartphone, Tablet } from 'lucide-react';
import type { AdminSession } from '@/data/mockAdminAuth';
import { cn } from '@/lib/utils';

const ICON_FOR: Record<AdminSession['device'], typeof Laptop> = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
};

interface DeviceIconProps {
  device: AdminSession['device'];
  className?: string;
}

export function DeviceIcon({ device, className }: DeviceIconProps) {
  const Icon = ICON_FOR[device];
  return <Icon className={cn('h-4 w-4 text-muted-foreground', className)} aria-hidden="true" />;
}
