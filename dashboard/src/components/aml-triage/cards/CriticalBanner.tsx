import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

interface CriticalBannerProps {
  count: number;
  onAssignFirstToMe: () => void;
}

export function CriticalBanner({ count, onAssignFirstToMe }: CriticalBannerProps) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-md border border-danger-600/40 bg-danger-50 dark:bg-danger-700/15 px-3 py-2.5">
      <AlertOctagon
        className="h-4 w-4 shrink-0 text-danger-700 dark:text-danger-600"
        aria-hidden="true"
      />
      <div className="text-sm font-semibold text-danger-700 dark:text-danger-600 min-w-0 flex-1">
        {t('admin.aml-triage.banner.critical-unassigned', { count })}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onAssignFirstToMe}
        className="border-danger-600/40 text-danger-700 hover:bg-danger-100/60 hover:text-danger-700 dark:text-danger-600 dark:hover:bg-danger-700/25"
      >
        {t('admin.aml-triage.banner.assign-first-to-me')}
      </Button>
    </div>
  );
}
