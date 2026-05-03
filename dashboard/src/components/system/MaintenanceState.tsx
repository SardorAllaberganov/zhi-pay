import { WrenchIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { SystemStateLayout } from './SystemStateLayout';
import { useMaintenanceState, refreshMaintenanceState } from '@/lib/maintenanceState';
import { t } from '@/lib/i18n';

interface MaintenanceStateProps {
  /** Override values — used by the preview route. */
  startedAtOverride?: number;
  estimatedEndAtOverride?: number;
}

/**
 * Full-page maintenance state. Replaces the entire shell when active —
 * sidebar and topbar are NOT shown (the spec calls for this, since the
 * admin can't navigate during maintenance regardless).
 *
 * Renders an icon + title + estimated-end body, plus a mini status
 * timeline showing "Started at {time}" → "Estimated end {time}".
 *
 * No primary CTA — admin can only wait. Refresh-status secondary
 * re-queries the maintenance state (no-op in mock — toggles a notify
 * so relative-time strings refresh).
 */
export function MaintenanceState({
  startedAtOverride,
  estimatedEndAtOverride,
}: MaintenanceStateProps) {
  const live = useMaintenanceState();
  const startedAt = startedAtOverride ?? live.startedAt;
  const estimatedEndAt = estimatedEndAtOverride ?? live.estimatedEndAt;

  return (
    <SystemStateLayout
      variant="full-bleed"
      icon={WrenchIcon}
      iconTone="warning"
      title={t('admin.system.maintenance.title')}
      body={
        estimatedEndAt
          ? t('admin.system.maintenance.body', {
              time: format(new Date(estimatedEndAt), 'p'),
            })
          : t('admin.system.maintenance.body-unknown')
      }
      secondary={{
        label: t('admin.system.maintenance.action.refresh'),
        onClick: refreshMaintenanceState,
      }}
      footer={
        startedAt ? (
          <MiniTimeline startedAt={startedAt} estimatedEndAt={estimatedEndAt} />
        ) : null
      }
    />
  );
}

function MiniTimeline({
  startedAt,
  estimatedEndAt,
}: {
  startedAt: number;
  estimatedEndAt: number | null;
}) {
  return (
    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
      <div className="flex flex-col gap-0.5">
        <dt className="text-muted-foreground">
          {t('admin.system.maintenance.started-at')}
        </dt>
        <dd className="font-medium text-foreground">
          {format(new Date(startedAt), 'p')}{' '}
          <span className="text-muted-foreground">
            ({formatDistanceToNow(new Date(startedAt), { addSuffix: true })})
          </span>
        </dd>
      </div>
      {estimatedEndAt ? (
        <div className="flex flex-col gap-0.5">
          <dt className="text-muted-foreground">
            {t('admin.system.maintenance.estimated-end')}
          </dt>
          <dd className="font-medium text-foreground">
            {format(new Date(estimatedEndAt), 'p')}{' '}
            <span className="text-muted-foreground">
              ({formatDistanceToNow(new Date(estimatedEndAt), { addSuffix: true })})
            </span>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
